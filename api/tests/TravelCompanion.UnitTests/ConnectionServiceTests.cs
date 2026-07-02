using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using TravelCompanion.Api.Data;
using TravelCompanion.Api.Models.Domain;
using TravelCompanion.Api.Models.Dtos;
using TravelCompanion.Api.Services;
using Xunit;

namespace TravelCompanion.UnitTests;

public class ConnectionServiceTests
{
    private (TravelCompanionDbContext db, IEncryptionService enc) CreateSetup()
    {
        var options = new DbContextOptionsBuilder<TravelCompanionDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        var db = new TravelCompanionDbContext(options);

        var key = Convert.FromBase64String("mfne3nCeCQCX09aJJcUmUaxJ5ofmR84X/ETBU7EVw3c=");
        var hmacKey = Convert.FromBase64String("9CGi9pO5NTrSLXbYbOkDZ0G3E4qIx34g5vnMRGhZ8/M=");
        var enc = new EncryptionService(key, hmacKey);

        // Seed a post owner and a post
        db.Users.Add(new User { Id = "owner", FirstName = "Owner", CreatedAt = DateTimeOffset.UtcNow });
        db.Users.Add(new User { Id = "initiator", FirstName = "Initiator", CreatedAt = DateTimeOffset.UtcNow });
        db.Posts.Add(new Post
        {
            Id = Guid.NewGuid(),
            PosterId = "owner",
            PostType = PostType.SeekingAssistance,
            OriginIata = "DEL",
            FinalDestinationIata = "SYD",
            TravelDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            Segments = [new PostSegment { Id = Guid.NewGuid(), SegmentOrder = 1, FlightNumber = "EK524", Airline = "EK", OriginIata = "DEL", DestinationIata = "DXB", DepartureTime = DateTimeOffset.UtcNow, ArrivalTime = DateTimeOffset.UtcNow.AddHours(4) }]
        });
        db.SaveChanges();
        return (db, enc);
    }

    [Fact]
    public async Task CreateConnectionAsync_ShouldCreatePendingConnection()
    {
        var (db, enc) = CreateSetup();
        var service = new ConnectionService(db, enc);
        var postId = db.Posts.First().Id;

        var connection = await service.CreateConnectionAsync(postId, "initiator");

        connection.Status.Should().Be("pending");
        connection.InitiatorId.Should().Be("initiator");
        connection.PostId.Should().Be(postId);
    }

    [Fact]
    public async Task CreateConnectionAsync_ShouldPreventConnectingToOwnPost()
    {
        var (db, enc) = CreateSetup();
        var service = new ConnectionService(db, enc);
        var postId = db.Posts.First().Id;

        var act = async () => await service.CreateConnectionAsync(postId, "owner");
        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task CreateConnectionAsync_ShouldPreventDuplicates()
    {
        var (db, enc) = CreateSetup();
        var service = new ConnectionService(db, enc);
        var postId = db.Posts.First().Id;

        await service.CreateConnectionAsync(postId, "initiator");
        var act = async () => await service.CreateConnectionAsync(postId, "initiator");
        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task UpdateConnectionAsync_ShouldCreateThread_WhenAccepted()
    {
        var (db, enc) = CreateSetup();
        var service = new ConnectionService(db, enc);
        var postId = db.Posts.First().Id;

        var connection = await service.CreateConnectionAsync(postId, "initiator");
        var updated = await service.UpdateConnectionAsync(connection.Id, "accepted", "owner");

        updated!.Status.Should().Be("accepted");
        var threads = await db.Threads.ToListAsync();
        threads.Should().HaveCount(1);
        threads[0].ConnectionId.Should().Be(connection.Id);
    }

    [Fact]
    public async Task UpdateConnectionAsync_ShouldNotCreateThread_WhenDeclined()
    {
        var (db, enc) = CreateSetup();
        var service = new ConnectionService(db, enc);
        var postId = db.Posts.First().Id;

        var connection = await service.CreateConnectionAsync(postId, "initiator");
        var updated = await service.UpdateConnectionAsync(connection.Id, "declined", "owner");

        updated!.Status.Should().Be("declined");
        var threads = await db.Threads.ToListAsync();
        threads.Should().BeEmpty();
    }

    [Fact]
    public async Task CreateConnectionAsync_ShouldEnforceMax10Pending()
    {
        var (db, enc) = CreateSetup();
        var service = new ConnectionService(db, enc);

        // Create 10 posts to connect to (skip the seed post from CreateSetup)
        for (int i = 0; i < 10; i++)
        {
            var post = new Post
            {
                Id = Guid.NewGuid(),
                PosterId = "owner",
                PostType = PostType.SeekingAssistance,
                OriginIata = "DEL",
                FinalDestinationIata = "SYD",
                TravelDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow,
                Segments = [new PostSegment { Id = Guid.NewGuid(), SegmentOrder = 1, FlightNumber = $"EK{i}", Airline = "EK", OriginIata = "DEL", DestinationIata = "DXB", DepartureTime = DateTimeOffset.UtcNow, ArrivalTime = DateTimeOffset.UtcNow.AddHours(4) }]
            };
            db.Posts.Add(post);
        }
        await db.SaveChangesAsync();

        var newPosts = db.Posts.Where(p => p.PosterId == "owner").Skip(1).Take(10).ToList();
        foreach (var post in newPosts)
        {
            await service.CreateConnectionAsync(post.Id, "initiator");
        }

        var extraPost = new Post
        {
            Id = Guid.NewGuid(),
            PosterId = "owner",
            PostType = PostType.SeekingAssistance,
            OriginIata = "DEL",
            FinalDestinationIata = "SYD",
            TravelDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            Segments = [new PostSegment { Id = Guid.NewGuid(), SegmentOrder = 1, FlightNumber = "EK999", Airline = "EK", OriginIata = "DEL", DestinationIata = "DXB", DepartureTime = DateTimeOffset.UtcNow, ArrivalTime = DateTimeOffset.UtcNow.AddHours(4) }]
        };
        db.Posts.Add(extraPost);
        await db.SaveChangesAsync();

        var act = async () => await service.CreateConnectionAsync(extraPost.Id, "initiator");
        await act.Should().ThrowAsync<InvalidOperationException>();
    }
}
