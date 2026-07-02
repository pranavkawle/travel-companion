namespace TravelCompanion.Api.Models.Dtos;

public class RegisterRequest
{
    public string FirstName { get; set; } = string.Empty;
    public List<string> LanguagesSpoken { get; set; } = [];
}

public class UserProfileDto
{
    public string Id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public bool MobileVerified { get; set; }
    public List<string> LanguagesSpoken { get; set; } = [];
    public bool IsBlocked { get; set; }
    public bool NotificationOptOut { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class UpdateUserRequest
{
    public string? FirstName { get; set; }
    public List<string>? LanguagesSpoken { get; set; }
    public bool? NotificationOptOut { get; set; }
}

public class CreatePostRequest
{
    public string PostType { get; set; } = string.Empty;
    public bool PosterIsTraveller { get; set; } = true;
    public string? TravellerRelationship { get; set; }
    public string OriginIata { get; set; } = string.Empty;
    public string FinalDestinationIata { get; set; } = string.Empty;
    public DateOnly TravelDate { get; set; }
    public List<string> LanguagesNeeded { get; set; } = [];
    public List<string> LanguagesSpoken { get; set; } = [];
    public string Notes { get; set; } = string.Empty;
    public List<PostSegmentDto> Segments { get; set; } = [];
}

public class PostSegmentDto
{
    public Guid? Id { get; set; }
    public int SegmentOrder { get; set; }
    public string FlightNumber { get; set; } = string.Empty;
    public string Airline { get; set; } = string.Empty;
    public string OriginIata { get; set; } = string.Empty;
    public string DestinationIata { get; set; } = string.Empty;
    public DateTimeOffset DepartureTime { get; set; }
    public DateTimeOffset ArrivalTime { get; set; }
}

public class PostResponseDto
{
    public Guid Id { get; set; }
    public string PosterId { get; set; } = string.Empty;
    public string PostType { get; set; } = string.Empty;
    public bool PosterIsTraveller { get; set; }
    public string? TravellerRelationship { get; set; }
    public string OriginIata { get; set; } = string.Empty;
    public string FinalDestinationIata { get; set; } = string.Empty;
    public DateOnly TravelDate { get; set; }
    public List<string> LanguagesNeeded { get; set; } = [];
    public List<string> LanguagesSpoken { get; set; } = [];
    public string Notes { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public List<PostSegmentDto> Segments { get; set; } = [];
}

public class UpdatePostRequest
{
    public string? Notes { get; set; }
    public bool? IsActive { get; set; }
}

public class ConnectionResponseDto
{
    public Guid Id { get; set; }
    public string InitiatorId { get; set; } = string.Empty;
    public Guid PostId { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public class UpdateConnectionRequest
{
    public string Status { get; set; } = string.Empty;
}

public class TravellerDetailsRequest
{
    public string TravellerName { get; set; } = string.Empty;
    public string? Notes { get; set; }
}

public class TravellerDetailsResponseDto
{
    public Guid Id { get; set; }
    public string SharedByUserId { get; set; } = string.Empty;
    public string TravellerName { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class SendMessageRequest
{
    public string Body { get; set; } = string.Empty;
}

public class MessageResponseDto
{
    public Guid Id { get; set; }
    public Guid ThreadId { get; set; }
    public string SenderId { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTimeOffset SentAt { get; set; }
}

public class ThreadResponseDto
{
    public Guid Id { get; set; }
    public Guid ConnectionId { get; set; }
    public string ParticipantAId { get; set; } = string.Empty;
    public string ParticipantBId { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class ReportRequest
{
    public string Reason { get; set; } = string.Empty;
}

public class ReportDto
{
    public Guid Id { get; set; }
    public string ReporterId { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? DismissedAt { get; set; }
}

public class FlaggedUserDto
{
    public string Id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public int ReportCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
}

public class BlockedUserDto
{
    public string Id { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public DateTimeOffset? BlockedAt { get; set; }
}

public class AirportDto
{
    public string IataCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Timezone { get; set; } = string.Empty;
}

public class FlightDto
{
    public string FlightNumber { get; set; } = string.Empty;
    public string Airline { get; set; } = string.Empty;
    public string OriginIata { get; set; } = string.Empty;
    public string DestinationIata { get; set; } = string.Empty;
    public DateTimeOffset DepartureTime { get; set; }
    public DateTimeOffset ArrivalTime { get; set; }
}

public class ClientErrorRequest
{
    public string Message { get; set; } = string.Empty;
    public string? Stack { get; set; }
    public string? Url { get; set; }
    public string? UserAgent { get; set; }
}

public class PaginatedResult<T>
{
    public List<T> Items { get; set; } = [];
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalCount { get; set; }
}
