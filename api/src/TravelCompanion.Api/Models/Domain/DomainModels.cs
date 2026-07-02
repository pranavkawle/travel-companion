using MongoDB.Bson.Serialization.Attributes;

namespace TravelCompanion.Api.Models.Domain;

public class Airport
{
    [BsonId]
    public string IataCode { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Country { get; set; } = string.Empty;
    public string Timezone { get; set; } = string.Empty;
}

public class Language
{
    [BsonId]
    public string Code { get; set; } = string.Empty; // ISO 639-1
    public string DisplayName { get; set; } = string.Empty;
}

public class Connection
{
    public Guid Id { get; set; }
    public string InitiatorId { get; set; } = string.Empty;
    public Guid PostId { get; set; }
    public ConnectionStatus Status { get; set; } = ConnectionStatus.Pending;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }
}

public enum ConnectionStatus
{
    Pending,
    Accepted,
    Declined,
    Blocked
}

public class TravellerDetail
{
    public Guid Id { get; set; }
    public Guid ConnectionId { get; set; }
    public string SharedByUserId { get; set; } = string.Empty;
    public string TravellerNameEncrypted { get; set; } = string.Empty;
    public string NotesEncrypted { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset AutoDeleteAt { get; set; }
}

public class Thread
{
    public Guid Id { get; set; }
    public Guid ConnectionId { get; set; }
    public string ParticipantAId { get; set; } = string.Empty;
    public string ParticipantBId { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class Message
{
    public Guid Id { get; set; }
    public Guid ThreadId { get; set; }
    public string SenderId { get; set; } = string.Empty;
    public string RecipientId { get; set; } = string.Empty;
    public string BodyEncrypted { get; set; } = string.Empty;
    public bool IsRead { get; set; }
    public DateTimeOffset SentAt { get; set; }
}

public class Report
{
    public Guid Id { get; set; }
    public string ReporterId { get; set; } = string.Empty;
    public string ReportedUserId { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? DismissedAt { get; set; }
}

public class Block
{
    public Guid Id { get; set; }
    public string BlockerId { get; set; } = string.Empty;
    public string BlockedUserId { get; set; } = string.Empty;
    public DateTimeOffset CreatedAt { get; set; }
}

public class EmailOutbox
{
    public int Id { get; set; }
    public string ToEmailEncrypted { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public EmailOutboxStatus Status { get; set; } = EmailOutboxStatus.Pending;
    public int RetryCount { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset? ProcessedAt { get; set; }
}

public enum EmailOutboxStatus
{
    Pending,
    Sent,
    Failed
}

public class MessageNotificationLog
{
    public int Id { get; set; }
    public Guid ThreadId { get; set; }
    public string RecipientId { get; set; } = string.Empty;
    public DateTimeOffset NextAllowedAt { get; set; }
}
