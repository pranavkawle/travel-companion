using FluentAssertions;
using TravelCompanion.Api.Services;
using Xunit;

namespace TravelCompanion.UnitTests;

public class EncryptionServiceTests
{
    private readonly EncryptionService _service;
    private static readonly byte[] Key = Convert.FromBase64String("mfne3nCeCQCX09aJJcUmUaxJ5ofmR84X/ETBU7EVw3c=");
    private static readonly byte[] HmacKey = Convert.FromBase64String("9CGi9pO5NTrSLXbYbOkDZ0G3E4qIx34g5vnMRGhZ8/M=");

    public EncryptionServiceTests()
    {
        _service = new EncryptionService(Key, HmacKey);
    }

    [Fact]
    public void Encrypt_Decrypt_RoundTrip_ReturnsOriginal()
    {
        var plain = "test@example.com";
        var encrypted = _service.Encrypt(plain);
        var decrypted = _service.Decrypt(encrypted);

        decrypted.Should().Be(plain);
    }

    [Fact]
    public void Encrypt_ProducesDifferentCiphertext_ForSamePlaintext()
    {
        var plain = "test@example.com";
        var enc1 = _service.Encrypt(plain);
        var enc2 = _service.Encrypt(plain);

        enc1.Should().NotBe(enc2);
    }

    [Fact]
    public void ComputeHmac_IsDeterministic()
    {
        var input = "test@example.com";
        var hmac1 = _service.ComputeHmac(input);
        var hmac2 = _service.ComputeHmac(input);

        hmac1.Should().Be(hmac2);
    }

    [Fact]
    public void ComputeHmac_DiffersForDifferentInputs()
    {
        var hmac1 = _service.ComputeHmac("test1@example.com");
        var hmac2 = _service.ComputeHmac("test2@example.com");

        hmac1.Should().NotBe(hmac2);
    }

    [Fact]
    public void Encrypt_Decrypt_EmptyString()
    {
        var encrypted = _service.Encrypt("");
        var decrypted = _service.Decrypt(encrypted);
        decrypted.Should().Be("");
    }

    [Fact]
    public void Encrypt_Decrypt_UnicodeContent()
    {
        var plain = "Hello 世界 🌍";
        var encrypted = _service.Encrypt(plain);
        var decrypted = _service.Decrypt(encrypted);
        decrypted.Should().Be(plain);
    }
}
