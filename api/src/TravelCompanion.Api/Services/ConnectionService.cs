using Microsoft.EntityFrameworkCore;
using TravelCompanion.Api.Data;
using TravelCompanion.Api.Models.Domain;
using TravelCompanion.Api.Models.Dtos;

namespace TravelCompanion.Api.Services;

public interface IConnectionService
{
    Task<ConnectionResponseDto> CreateConnectionAsync(Guid postId, string initiatorId);
    Task<List<ConnectionResponseDto>> GetConnectionsAsync(string userId, string? status);
    Task<ConnectionResponseDto?> UpdateConnectionAsync(Guid connectionId, string status, string userId);
    Task<TravellerDetailsResponseDto> ShareTravellerDetailsAsync(
        Guid connectionId, TravellerDetailsRequest request, string userId);
}

public class ConnectionService : IConnectionService
{
    private readonly TravelCompanionDbContext _db;
    private readonly IEncryptionService _encryption;

    public ConnectionService(TravelCompanionDbContext db, IEncryptionService encryption)
    {
        _db = db;
        _encryption = encryption;
    }

    public async Task<ConnectionResponseDto> CreateConnectionAsync(Guid postId, string initiatorId)
    {
        // Check pending limit
        var pendingCount = await _db.Connections
            .CountAsync(c => c.InitiatorId == initiatorId && c.Status == ConnectionStatus.Pending);
        if (pendingCount >= 10)
            throw new InvalidOperationException("Maximum 10 pending connections allowed");

        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == postId && p.IsActive);
        if (post == null)
            throw new KeyNotFoundException("Post not found");

        if (post.PosterId == initiatorId)
            throw new InvalidOperationException("Cannot connect to own post");

        // Check duplicate
        var existing = await _db.Connections
            .AnyAsync(c => c.InitiatorId == initiatorId && c.PostId == postId);
        if (existing)
            throw new InvalidOperationException("Connection already exists");

        // Check blocks
        var isBlocked = await _db.Blocks
            .AnyAsync(b => b.BlockerId == post.PosterId && b.BlockedUserId == initiatorId);
        if (isBlocked)
            throw new UnauthorizedAccessException("Cannot connect to this post");

        var connection = new Connection
        {
            Id = Guid.NewGuid(),
            InitiatorId = initiatorId,
            PostId = postId,
            Status = ConnectionStatus.Pending,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };

        _db.Connections.Add(connection);
        await _db.SaveChangesAsync();

        return ToDto(connection);
    }

    public async Task<List<ConnectionResponseDto>> GetConnectionsAsync(string userId, string? status)
    {
        var query = _db.Connections.Where(c =>
            c.InitiatorId == userId ||
            _db.Posts.Any(p => p.Id == c.PostId && p.PosterId == userId));

        if (!string.IsNullOrEmpty(status) &&
            Enum.TryParse<ConnectionStatus>(status, ignoreCase: true, out var st))
            query = query.Where(c => c.Status == st);

        var connections = await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
        return connections.Select(ToDto).ToList();
    }

    public async Task<ConnectionResponseDto?> UpdateConnectionAsync(
        Guid connectionId, string status, string userId)
    {
        var connection = await _db.Connections.FirstOrDefaultAsync(c => c.Id == connectionId);
        if (connection == null) return null;

        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == connection.PostId);
        if (post == null || post.PosterId != userId)
            throw new UnauthorizedAccessException("Only post owner can update connection");

        if (!Enum.TryParse<ConnectionStatus>(status, ignoreCase: true, out var newStatus))
            throw new ArgumentException("Invalid status");

        connection.Status = newStatus;
        connection.UpdatedAt = DateTimeOffset.UtcNow;

        // If accepted, create a thread
        if (newStatus == ConnectionStatus.Accepted)
        {
            var existingThread = await _db.Threads
                .AnyAsync(t => t.ConnectionId == connection.Id);
            if (!existingThread)
            {
                var thread = new Models.Domain.Thread
                {
                    Id = Guid.NewGuid(),
                    ConnectionId = connection.Id,
                    ParticipantAId = connection.InitiatorId,
                    ParticipantBId = post.PosterId,
                    CreatedAt = DateTimeOffset.UtcNow
                };
                _db.Threads.Add(thread);
            }
        }

        await _db.SaveChangesAsync();
        return ToDto(connection);
    }

    public async Task<TravellerDetailsResponseDto> ShareTravellerDetailsAsync(
        Guid connectionId, TravellerDetailsRequest request, string userId)
    {
        var connection = await _db.Connections.FirstOrDefaultAsync(c => c.Id == connectionId);
        if (connection == null)
            throw new KeyNotFoundException("Connection not found");

        if (connection.Status != ConnectionStatus.Accepted)
            throw new InvalidOperationException("Connection must be accepted first");

        var post = await _db.Posts.FirstOrDefaultAsync(p => p.Id == connection.PostId);
        var isParticipant = userId == connection.InitiatorId ||
                            (post != null && userId == post.PosterId);
        if (!isParticipant)
            throw new UnauthorizedAccessException("Not a participant in this connection");

        var detail = new TravellerDetail
        {
            Id = Guid.NewGuid(),
            ConnectionId = connectionId,
            SharedByUserId = userId,
            TravellerNameEncrypted = _encryption.Encrypt(request.TravellerName),
            NotesEncrypted = string.IsNullOrEmpty(request.Notes)
                ? "" : _encryption.Encrypt(request.Notes),
            CreatedAt = DateTimeOffset.UtcNow,
            AutoDeleteAt = new DateTimeOffset((post?.TravelDate ?? DateOnly.FromDateTime(DateTime.UtcNow)).AddDays(30).ToDateTime(TimeOnly.MinValue), TimeSpan.Zero)
        };

        _db.TravellerDetails.Add(detail);
        await _db.SaveChangesAsync();

        return new TravellerDetailsResponseDto
        {
            Id = detail.Id,
            SharedByUserId = detail.SharedByUserId,
            TravellerName = request.TravellerName,
            Notes = request.Notes,
            CreatedAt = detail.CreatedAt
        };
    }

    private static ConnectionResponseDto ToDto(Connection c) => new()
    {
        Id = c.Id,
        InitiatorId = c.InitiatorId,
        PostId = c.PostId,
        Status = c.Status.ToString().ToLowerInvariant(),
        CreatedAt = c.CreatedAt,
        UpdatedAt = c.UpdatedAt
    };
}
