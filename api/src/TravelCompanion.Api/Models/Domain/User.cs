using System.ComponentModel.DataAnnotations;

namespace TravelCompanion.Api.Models.Domain;

public class User
{
    public string Id { get; set; } = string.Empty; // Auth0 sub
    public string FirstName { get; set; } = string.Empty;
    public string EmailEncrypted { get; set; } = string.Empty;
    public string EmailHmac { get; set; } = string.Empty;
    public bool MobileVerified { get; set; }
    public List<string> LanguagesSpoken { get; set; } = [];
    public bool IsBlocked { get; set; }
    public DateTimeOffset? BlockedAt { get; set; }
    public bool NotificationOptOut { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}
