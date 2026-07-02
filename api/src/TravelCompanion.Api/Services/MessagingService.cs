using Microsoft.EntityFrameworkCore;
using TravelCompanion.Api.Data;
using TravelCompanion.Api.Models.Domain;
using TravelCompanion.Api.Models.Dtos;

namespace TravelCompanion.Api.Services;

public interface IMessagingService
{
    Task<List<ThreadResponseDto>> GetThreadsAsync(string userId);
    Task<List<MessageResponseDto>> GetMessagesAsync(Guid threadId, string userId);
    Task<MessageResponseDto> SendMessageAsync(Guid threadId, SendMessageRequest request, string senderId);
}

public class MessagingService : IMessagingService
{
    private readonly TravelCompanionDbContext _db;
    private readonly IEncryptionService _encryption;

    public MessagingService(TravelCompanionDbContext db, IEncryptionService encryption)
    {
        _db = db;
        _encryption = encryption;
    }

    public async Task<List<ThreadResponseDto>> GetThreadsAsync(string userId)
    {
        var threads = await _db.Threads
            .Where(t => t.ParticipantAId == userId || t.ParticipantBId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return threads.Select(t => new ThreadResponseDto
        {
            Id = t.Id,
            ConnectionId = t.ConnectionId,
            ParticipantAId = t.ParticipantAId,
            ParticipantBId = t.ParticipantBId,
            CreatedAt = t.CreatedAt
        }).ToList();
    }

    public async Task<List<MessageResponseDto>> GetMessagesAsync(Guid threadId, string userId)
    {
        var thread = await _db.Threads.FirstOrDefaultAsync(t => t.Id == threadId);
        if (thread == null) return [];
        if (thread.ParticipantAId != userId && thread.ParticipantBId != userId)
            throw new UnauthorizedAccessException("Not a participant in this thread");

        var messages = await _db.Messages
            .Where(m => m.ThreadId == threadId)
            .OrderBy(m => m.SentAt)
            .ToListAsync();

        // Mark as read for the requesting user
        var unread = messages.Where(m => m.RecipientId == userId && !m.IsRead).ToList();
        foreach (var msg in unread)
            msg.IsRead = true;

        if (unread.Count > 0)
            await _db.SaveChangesAsync();

        return messages.Select(m => new MessageResponseDto
        {
            Id = m.Id,
            ThreadId = m.ThreadId,
            SenderId = m.SenderId,
            Body = _encryption.Decrypt(m.BodyEncrypted),
            IsRead = m.IsRead,
            SentAt = m.SentAt
        }).ToList();
    }

    public async Task<MessageResponseDto> SendMessageAsync(
        Guid threadId, SendMessageRequest request, string senderId)
    {
        var thread = await _db.Threads.FirstOrDefaultAsync(t => t.Id == threadId);
        if (thread == null)
            throw new KeyNotFoundException("Thread not found");

        var recipientId = thread.ParticipantAId == senderId
            ? thread.ParticipantBId
            : thread.ParticipantAId;

        // Check blocks
        var isBlocked = await _db.Blocks
            .AnyAsync(b => b.BlockerId == recipientId && b.BlockedUserId == senderId);
        if (isBlocked)
            throw new UnauthorizedAccessException("Cannot send message — blocked by recipient");

        var message = new Message
        {
            Id = Guid.NewGuid(),
            ThreadId = threadId,
            SenderId = senderId,
            RecipientId = recipientId,
            BodyEncrypted = _encryption.Encrypt(request.Body),
            IsRead = false,
            SentAt = DateTimeOffset.UtcNow
        };

        _db.Messages.Add(message);
        await _db.SaveChangesAsync();

        return new MessageResponseDto
        {
            Id = message.Id,
            ThreadId = message.ThreadId,
            SenderId = message.SenderId,
            Body = request.Body,
            IsRead = false,
            SentAt = message.SentAt
        };
    }
}
