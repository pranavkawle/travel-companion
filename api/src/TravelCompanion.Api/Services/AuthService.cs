using Microsoft.EntityFrameworkCore;
using TravelCompanion.Api.Data;
using TravelCompanion.Api.Models.Domain;
using TravelCompanion.Api.Models.Dtos;

namespace TravelCompanion.Api.Services;

public interface IAuthService
{
    Task<UserProfileDto> RegisterAsync(RegisterRequest request, string auth0Sub, string email, bool mobileVerified);
    Task<UserProfileDto?> SyncProfileAsync(string auth0Sub, bool mobileVerified);
    Task<UserProfileDto?> GetProfileAsync(string userId);
    Task<UserProfileDto?> UpdateProfileAsync(string userId, UpdateUserRequest request);
    Task DeleteProfileAsync(string userId);
}

public class AuthService : IAuthService
{
    private readonly TravelCompanionDbContext _db;
    private readonly IEncryptionService _encryption;

    public AuthService(TravelCompanionDbContext db, IEncryptionService encryption)
    {
        _db = db;
        _encryption = encryption;
    }

    public async Task<UserProfileDto> RegisterAsync(
        RegisterRequest request, string auth0Sub, string email, bool mobileVerified)
    {
        var existing = await _db.Users.FirstOrDefaultAsync(u => u.Id == auth0Sub);
        if (existing != null)
            throw new InvalidOperationException("Profile already exists");

        var user = new User
        {
            Id = auth0Sub,
            FirstName = request.FirstName,
            EmailEncrypted = _encryption.Encrypt(email),
            EmailHmac = _encryption.ComputeHmac(email.ToLowerInvariant()),
            MobileVerified = mobileVerified,
            LanguagesSpoken = request.LanguagesSpoken,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return ToDto(user);
    }

    public async Task<UserProfileDto?> SyncProfileAsync(string auth0Sub, bool mobileVerified)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == auth0Sub);
        if (user == null) return null;

        if (user.MobileVerified != mobileVerified)
        {
            user.MobileVerified = mobileVerified;
            await _db.SaveChangesAsync();
        }

        return ToDto(user);
    }

    public async Task<UserProfileDto?> GetProfileAsync(string userId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        return user == null ? null : ToDto(user);
    }

    public async Task<UserProfileDto?> UpdateProfileAsync(string userId, UpdateUserRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return null;

        if (request.FirstName != null)
            user.FirstName = request.FirstName;
        if (request.LanguagesSpoken != null)
            user.LanguagesSpoken = request.LanguagesSpoken;
        if (request.NotificationOptOut.HasValue)
            user.NotificationOptOut = request.NotificationOptOut.Value;

        await _db.SaveChangesAsync();
        return ToDto(user);
    }

    public async Task DeleteProfileAsync(string userId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return;

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
    }

    private static UserProfileDto ToDto(User user) => new()
    {
        Id = user.Id,
        FirstName = user.FirstName,
        MobileVerified = user.MobileVerified,
        LanguagesSpoken = user.LanguagesSpoken,
        IsBlocked = user.IsBlocked,
        NotificationOptOut = user.NotificationOptOut,
        CreatedAt = user.CreatedAt
    };
}
