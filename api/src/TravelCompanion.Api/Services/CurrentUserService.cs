using System.Security.Claims;

namespace TravelCompanion.Api.Services;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? Email { get; }
    bool IsMobileVerified { get; }
    bool IsAdmin { get; }
    IEnumerable<string> Roles { get; }
}

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId =>
        _httpContextAccessor.HttpContext?.User.FindFirst("sub")?.Value
        ?? _httpContextAccessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

    public string? Email =>
        _httpContextAccessor.HttpContext?.User.FindFirst("email")?.Value;

    public bool IsMobileVerified =>
        bool.TryParse(
            _httpContextAccessor.HttpContext?.User.FindFirst("phone_number_verified")?.Value,
            out var verified) && verified;

    public IEnumerable<string> Roles =>
        _httpContextAccessor.HttpContext?.User
            .FindAll("https://travel-companion.app/roles")
            .Select(c => c.Value) ?? [];

    public bool IsAdmin => Roles.Contains("admin");
}
