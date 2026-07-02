namespace TravelCompanion.Api.Models.Domain;

public class Post
{
    public Guid Id { get; set; }
    public string PosterId { get; set; } = string.Empty;
    public PostType PostType { get; set; }
    public bool PosterIsTraveller { get; set; } = true;
    public string? TravellerRelationship { get; set; }
    public string OriginIata { get; set; } = string.Empty;
    public string FinalDestinationIata { get; set; } = string.Empty;
    public DateOnly TravelDate { get; set; }
    public List<string> LanguagesNeeded { get; set; } = [];
    public List<string> LanguagesSpoken { get; set; } = [];
    public string Notes { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; }
    public List<PostSegment> Segments { get; set; } = [];
}

public enum PostType
{
    SeekingAssistance,
    OfferingAssistance
}

public class PostSegment
{
    public Guid Id { get; set; }
    public int SegmentOrder { get; set; }
    public string FlightNumber { get; set; } = string.Empty;
    public string Airline { get; set; } = string.Empty;
    public string OriginIata { get; set; } = string.Empty;
    public string DestinationIata { get; set; } = string.Empty;
    public DateTimeOffset DepartureTime { get; set; }
    public DateTimeOffset ArrivalTime { get; set; }
}
