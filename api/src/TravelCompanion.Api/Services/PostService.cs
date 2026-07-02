using Microsoft.EntityFrameworkCore;
using TravelCompanion.Api.Data;
using TravelCompanion.Api.Models.Domain;
using TravelCompanion.Api.Models.Dtos;

namespace TravelCompanion.Api.Services;

public interface IPostService
{
    Task<PostResponseDto> CreatePostAsync(CreatePostRequest request, string userId);
    Task<PostResponseDto?> GetPostAsync(Guid id, string? viewerId);
    Task<List<PostResponseDto>> SearchPostsAsync(
        string? originIata, string? destinationIata, DateOnly? date,
        List<string>? languages, string? postType, int page, int pageSize, string? viewerId);
    Task<PostResponseDto?> UpdatePostAsync(Guid id, UpdatePostRequest request, string userId);
    Task<bool> DeletePostAsync(Guid id, string userId);
    Task<List<PostResponseDto>> GetMatchesAsync(Guid postId, string viewerId);
}

public class PostService : IPostService
{
    private readonly TravelCompanionDbContext _db;

    public PostService(TravelCompanionDbContext db) => _db = db;

    public async Task<PostResponseDto> CreatePostAsync(CreatePostRequest request, string userId)
    {
        var activeCount = await _db.Posts.CountAsync(p => p.PosterId == userId && p.IsActive);
        if (activeCount >= 5)
            throw new InvalidOperationException("Maximum 5 active posts allowed");

        var postType = request.PostType.Replace("_", "") switch
        {
            "SEEKINGASSISTANCE" => PostType.SeekingAssistance,
            "OFFERINGASSISTANCE" => PostType.OfferingAssistance,
            _ => Enum.TryParse<PostType>(request.PostType, ignoreCase: true, out var pt)
                ? pt
                : throw new ArgumentException($"Invalid post type: {request.PostType}")
        };

        var post = new Post
        {
            Id = Guid.NewGuid(),
            PosterId = userId,
            PostType = postType,
            PosterIsTraveller = request.PosterIsTraveller,
            TravellerRelationship = request.TravellerRelationship,
            OriginIata = request.OriginIata,
            FinalDestinationIata = request.FinalDestinationIata,
            TravelDate = request.TravelDate,
            LanguagesNeeded = request.LanguagesNeeded,
            LanguagesSpoken = request.LanguagesSpoken,
            Notes = request.Notes,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            Segments = request.Segments.Select(s => new PostSegment
            {
                Id = Guid.NewGuid(),
                SegmentOrder = s.SegmentOrder,
                FlightNumber = s.FlightNumber,
                Airline = s.Airline,
                OriginIata = s.OriginIata,
                DestinationIata = s.DestinationIata,
                DepartureTime = s.DepartureTime,
                ArrivalTime = s.ArrivalTime
            }).ToList()
        };

        _db.Posts.Add(post);
        await _db.SaveChangesAsync();
        return ToDto(post);
    }

    public async Task<PostResponseDto?> GetPostAsync(Guid id, string? viewerId)
    {
        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == id);
        return post == null ? null : ToDto(post);
    }

    public async Task<List<PostResponseDto>> SearchPostsAsync(
        string? originIata, string? destinationIata, DateOnly? date,
        List<string>? languages, string? postType, int page, int pageSize, string? viewerId)
    {
        var query = _db.Posts.Where(p => p.IsActive);

        if (!string.IsNullOrEmpty(originIata))
            query = query.Where(p => p.OriginIata == originIata);
        if (!string.IsNullOrEmpty(destinationIata))
            query = query.Where(p => p.FinalDestinationIata == destinationIata);
        if (date.HasValue)
            query = query.Where(p => p.TravelDate == date.Value);
        if (languages is { Count: > 0 })
            query = query.Where(p =>
                p.LanguagesNeeded.Any(l => languages.Contains(l)) ||
                p.LanguagesSpoken.Any(l => languages.Contains(l)));
        if (!string.IsNullOrEmpty(postType) &&
            Enum.TryParse<PostType>(postType, ignoreCase: true, out var pt))
            query = query.Where(p => p.PostType == pt);

        // Exclude posts by blocked users
        if (viewerId != null)
        {
            var blockedUserIds = await _db.Blocks
                .Where(b => b.BlockerId == viewerId)
                .Select(b => b.BlockedUserId)
                .ToListAsync();
            query = query.Where(p => !blockedUserIds.Contains(p.PosterId));
        }

        var skip = (page - 1) * pageSize;
        var posts = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync();

        return posts.Select(ToDto).ToList();
    }

    public async Task<PostResponseDto?> UpdatePostAsync(
        Guid id, UpdatePostRequest request, string userId)
    {
        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == id && p.PosterId == userId);
        if (post == null) return null;

        if (request.Notes != null)
            post.Notes = request.Notes;
        if (request.IsActive.HasValue)
            post.IsActive = request.IsActive.Value;

        await _db.SaveChangesAsync();
        return ToDto(post);
    }

    public async Task<bool> DeletePostAsync(Guid id, string userId)
    {
        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == id && p.PosterId == userId);
        if (post == null) return false;

        _db.Posts.Remove(post);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<PostResponseDto>> GetMatchesAsync(Guid postId, string viewerId)
    {
        var targetPost = await _db.Posts.FirstOrDefaultAsync(p => p.Id == postId);
        if (targetPost == null) return [];

        // Find posts with overlapping segments (same flight number or same origin+destination+close departure)
        var targetFlightNumbers = targetPost.Segments.Select(s => s.FlightNumber).ToList();
        var targetRoutes = targetPost.Segments
            .Select(s => (s.OriginIata, s.DestinationIata)).ToList();

        var candidates = await _db.Posts
            .Where(p => p.Id != postId && p.IsActive && p.TravelDate == targetPost.TravelDate)
            .ToListAsync();

        var matched = candidates.Where(c =>
            c.Segments.Any(s =>
                targetFlightNumbers.Contains(s.FlightNumber) ||
                targetRoutes.Contains((s.OriginIata, s.DestinationIata))))
            .ToList();

        return matched.Select(ToDto).ToList();
    }

    private static PostResponseDto ToDto(Post post) => new()
    {
        Id = post.Id,
        PosterId = post.PosterId,
        PostType = post.PostType.ToString(),
        PosterIsTraveller = post.PosterIsTraveller,
        TravellerRelationship = post.TravellerRelationship,
        OriginIata = post.OriginIata,
        FinalDestinationIata = post.FinalDestinationIata,
        TravelDate = post.TravelDate,
        LanguagesNeeded = post.LanguagesNeeded,
        LanguagesSpoken = post.LanguagesSpoken,
        Notes = post.Notes,
        IsActive = post.IsActive,
        CreatedAt = post.CreatedAt,
        Segments = post.Segments.Select(s => new PostSegmentDto
        {
            Id = s.Id,
            SegmentOrder = s.SegmentOrder,
            FlightNumber = s.FlightNumber,
            Airline = s.Airline,
            OriginIata = s.OriginIata,
            DestinationIata = s.DestinationIata,
            DepartureTime = s.DepartureTime,
            ArrivalTime = s.ArrivalTime
        }).ToList()
    };
}
