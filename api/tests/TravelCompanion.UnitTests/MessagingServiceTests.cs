using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using TravelCompanion.Api.Data;
using TravelCompanion.Api.Models.Domain;
using TravelCompanion.Api.Models.Dtos;
using TravelCompanion.Api.Services;
using Xunit;

namespace TravelCompanion.UnitTests;

public class MessagingServiceTests
{
    private (TravelCompanionDbContext db, IEncryptionService enc, Guid threadId) CreateSetup()
    {
        var options = new DbContextOptionsBuilder<TravelCompanionDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var db = new TravelCompanionDbContext(options);

        var key = Convert.FromBase64String("mfne3nCeCQCX09aJJcUmUaxJ5ofmR84X/ETBU7EVw3c=");
        var hmacKey = Convert.FromBase64String("9CGi9pO5NTrSLXbYbOkDZ0G3E4qIx34g5vnMRGhZ8/M=");
        var enc = new EncryptionService(key, hmacKey);

        var threadId = Guid.NewGuid();
        db.Threads.Add(new TravelCompanion.Api.Models.Domain.Thread
        {
            Id = threadId,
            ConnectionId = Guid.NewGuid(),
            ParticipantAId = "user-a",
            ParticipantBId = "user-b",
            CreatedAt = DateTimeOffset.UtcNow
        });
        db.SaveChanges();
        return (db, enc, threadId);
    }

    [Fact]
    public async Task SendMessageAsync_ShouldEncryptMessageBody()
    {
        var (db, enc, threadId) = CreateSetup();
        var service = new MessagingService(db, enc);

        var msg = await service.SendMessageAsync(threadId, new SendMessageRequest { Body = "Hello there!" }, "user-a");

        msg.Body.Should().Be("Hello there!");
        msg.SenderId.Should().Be("user-a");
        msg.IsRead.Should().BeFalse();

        // Verify body is encrypted in DB
        var rawMsg = await db.Messages.FirstAsync();
        rawMsg.BodyEncrypted.Should().NotBe("Hello there!");
        enc.Decrypt(rawMsg.BodyEncrypted).Should().Be("Hello there!");
    }

    [Fact]
    public async Task GetMessagesAsync_ShouldMarkAsRead()
    {
        var (db, enc, threadId) = CreateSetup();
        var service = new MessagingService(db, enc);

        await service.SendMessageAsync(threadId, new SendMessageRequest { Body = "Msg 1" }, "user-a");
        await service.SendMessageAsync(threadId, new SendMessageRequest { Body = "Msg 2" }, "user-a");

        var messages = await service.GetMessagesAsync(threadId, "user-b");

        messages.Should().HaveCount(2);
        messages.All(m => m.IsRead).Should().BeTrue();
    }

    [Fact]
    public async Task GetMessagesAsync_ShouldRejectNonParticipant()
    {
        var (db, enc, threadId) = CreateSetup();
        var service = new MessagingService(db, enc);

        await service.SendMessageAsync(threadId, new SendMessageRequest { Body = "Test" }, "user-a");

        var act = async () => await service.GetMessagesAsync(threadId, "intruder");
        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task GetThreadsAsync_ShouldReturnUserThreads()
    {
        var (db, enc, threadId) = CreateSetup();
        var service = new MessagingService(db, enc);

        var threads = await service.GetThreadsAsync("user-a");
        threads.Should().HaveCount(1);
        threads[0].Id.Should().Be(threadId);
    }

    [Fact]
    public async Task SendMessageAsync_ShouldRejectBlockedUser()
    {
        var (db, enc, threadId) = CreateSetup();
        var service = new MessagingService(db, enc);

        // Block user-a
        db.Blocks.Add(new Block
        {
            Id = Guid.NewGuid(),
            BlockerId = "user-b",
            BlockedUserId = "user-a",
            CreatedAt = DateTimeOffset.UtcNow
        });
        await db.SaveChangesAsync();

        var act = async () => await service.SendMessageAsync(threadId, new SendMessageRequest { Body = "Hello" }, "user-a");
        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }
}
