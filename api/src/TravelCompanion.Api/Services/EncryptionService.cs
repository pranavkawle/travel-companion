using System.Security.Cryptography;
using System.Text;

namespace TravelCompanion.Api.Services;

public interface IEncryptionService
{
    string Encrypt(string plainText);
    string Decrypt(string cipherText);
    string ComputeHmac(string input);
}

public class EncryptionService : IEncryptionService
{
    private readonly byte[] _encryptionKey;
    private readonly byte[] _hmacSecret;

    public EncryptionService(IConfiguration config)
    {
        var encKey = config["ENCRYPTION_KEY"]
            ?? throw new InvalidOperationException("ENCRYPTION_KEY not configured");
        var hmacSecret = config["HMAC_SECRET"]
            ?? throw new InvalidOperationException("HMAC_SECRET not configured");

        _encryptionKey = Convert.FromBase64String(encKey);
        _hmacSecret = Convert.FromBase64String(hmacSecret);
    }

    // For tests
    public EncryptionService(byte[] encryptionKey, byte[] hmacSecret)
    {
        _encryptionKey = encryptionKey;
        _hmacSecret = hmacSecret;
    }

    public string Encrypt(string plainText)
    {
        using var aes = Aes.Create();
        aes.Key = _encryptionKey;
        aes.GenerateIV();

        using var encryptor = aes.CreateEncryptor();
        var plainBytes = Encoding.UTF8.GetBytes(plainText);
        var cipherBytes = encryptor.TransformFinalBlock(plainBytes, 0, plainBytes.Length);

        // Prepend IV to ciphertext
        var result = new byte[aes.IV.Length + cipherBytes.Length];
        Buffer.BlockCopy(aes.IV, 0, result, 0, aes.IV.Length);
        Buffer.BlockCopy(cipherBytes, 0, result, aes.IV.Length, cipherBytes.Length);

        return Convert.ToBase64String(result);
    }

    public string Decrypt(string cipherText)
    {
        var fullBytes = Convert.FromBase64String(cipherText);

        using var aes = Aes.Create();
        aes.Key = _encryptionKey;

        var iv = new byte[16];
        Buffer.BlockCopy(fullBytes, 0, iv, 0, 16);
        aes.IV = iv;

        using var decryptor = aes.CreateDecryptor();
        var cipherBytes = new byte[fullBytes.Length - 16];
        Buffer.BlockCopy(fullBytes, 16, cipherBytes, 0, cipherBytes.Length);
        var plainBytes = decryptor.TransformFinalBlock(cipherBytes, 0, cipherBytes.Length);

        return Encoding.UTF8.GetString(plainBytes);
    }

    public string ComputeHmac(string input)
    {
        using var hmac = new HMACSHA256(_hmacSecret);
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(input));
        return Convert.ToBase64String(hashBytes);
    }
}
