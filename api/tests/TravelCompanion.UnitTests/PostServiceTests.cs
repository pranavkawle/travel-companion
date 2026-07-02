using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using TravelCompanion.Api.Data;
using TravelCompanion.Api.Models.Domain;
using TravelCompanion.Api.Models.Dtos;
using TravelCompanion.Api.Services;
using Xunit;

namespace TravelCompanion.UnitTests;

public class PostServiceTests
{
    private TravelCompanionDbContext CreateInMemoryDb()
    {
        var options = new DbContextOptionsBuilder<TravelCompanionDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TravelCompanionDbContext(options);
    }

    [Fact]
    public async Task CreatePostAsync_ShouldCreatePost_WithSegments()
    {
        var db = CreateInMemoryDb();
        var service = new PostService(db);
        var request = new CreatePostRequest
        {
            PostType = "SEEKING_ASSISTANCE",
            OriginIata = "DEL",
            FinalDestinationIata = "SYD",
            TravelDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            LanguagesNeeded = ["hi", "en"],
            Notes = "Need Hindi help",
            Segments =
            [
                new PostSegmentDto
                {
                    SegmentOrder = 1,
                    FlightNumber = "EK524",
                    Airline = "Emirates",
                    OriginIata = "DEL",
                    DestinationIata = "DXB",
                    DepartureTime = DateTimeOffset.UtcNow.AddDays(7),
                    ArrivalTime = DateTimeOffset.UtcNow.AddDays(7).AddHours(4)
                }
            ]
        };

        var result = await service.CreatePostAsync(request, "user-1");

        result.Id.Should().NotBeEmpty();
        result.PosterId.Should().Be("user-1");
        result.PostType.Should().Be("SeekingAssistance");
        result.IsActive.Should().BeTrue();
        result.Segments.Should().HaveCount(1);
        result.Segments[0].FlightNumber.Should().Be("EK524");
    }

    [Fact]
    public async Task CreatePostAsync_ShouldEnforceMax5ActivePosts()
    {
        var db = CreateInMemoryDb();
        var service = new PostService(db);

        for (int i = 0; i < 5; i++)
        {
            await service.CreatePostAsync(new CreatePostRequest
            {
                PostType = "OFFERING_ASSISTANCE",
                OriginIata = "DEL",
                FinalDestinationIata = "BOM",
                TravelDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
                Segments = [new PostSegmentDto { SegmentOrder = 1, FlightNumber = "AI101", Airline = "Air India", OriginIata = "DEL", DestinationIata = "BOM", DepartureTime = DateTimeOffset.UtcNow, ArrivalTime = DateTimeOffset.UtcNow.AddHours(2) }]
            }, "user-1");
        }

        var act = async () => await service.CreatePostAsync(new CreatePostRequest
        {
            PostType = "OFFERING_ASSISTANCE",
            OriginIata = "DEL",
            FinalDestinationIata = "BOM",
            TravelDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            Segments = [new PostSegmentDto { SegmentOrder = 1, FlightNumber = "AI102", Airline = "Air India", OriginIata = "DEL", DestinationIata = "BOM", DepartureTime = DateTimeOffset.UtcNow, ArrivalTime = DateTimeOffset.UtcNow.AddHours(2) }]
        }, "user-1");

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Maximum 5 active posts*");
    }

    [Fact]
    public async Task SearchPostsAsync_ShouldFilterByOrigin()
    {
        var db = CreateInMemoryDb();
        var service = new PostService(db);

        await service.CreatePostAsync(new CreatePostRequest
        {
            PostType = "SEEKING_ASSISTANCE", OriginIata = "DEL", FinalDestinationIata = "SYD",
            TravelDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            Segments = [new PostSegmentDto { SegmentOrder = 1, FlightNumber = "EK524", Airline = "EK", OriginIata = "DEL", DestinationIata = "DXB", DepartureTime = DateTimeOffset.UtcNow, ArrivalTime = DateTimeOffset.UtcNow.AddHours(4) }]
        }, "user-1");

        await service.CreatePostAsync(new CreatePostRequest
        {
            PostType = "SEEKING_ASSISTANCE", OriginIata = "BOM", FinalDestinationIata = "LHR",
            TravelDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            Segments = [new PostSegmentDto { SegmentOrder = 1, FlightNumber = "BA138", Airline = "BA", OriginIata = "BOM", DestinationIata = "LHR", DepartureTime = DateTimeOffset.UtcNow, ArrivalTime = DateTimeOffset.UtcNow.AddHours(9) }]
        }, "user-2");

        var results = await service.SearchPostsAsync("DEL", null, null, null, null, 1, 20, null);

        results.Should().HaveCount(1);
        results[0].OriginIata.Should().Be("DEL");
    }

    [Fact]
    public async Task DeletePostAsync_ShouldRemovePost()
    {
        var db = CreateInMemoryDb();
        var service = new PostService(db);

        var post = await service.CreatePostAsync(new CreatePostRequest
        {
            PostType = "SEEKING_ASSISTANCE", OriginIata = "DEL", FinalDestinationIata = "SYD",
            TravelDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7)),
            Segments = [new PostSegmentDto { SegmentOrder = 1, FlightNumber = "EK524", Airline = "EK", OriginIata = "DEL", DestinationIata = "DXB", DepartureTime = DateTimeOffset.UtcNow, ArrivalTime = DateTimeOffset.UtcNow.AddHours(4) }]
        }, "user-1");

        var deleted = await service.DeletePostAsync(post.Id, "user-1");
        deleted.Should().BeTrue();

        var fetched = await service.GetPostAsync(post.Id, null);
        fetched.Should().BeNull();
    }

    [Fact]
    public async Task GetMatchesAsync_ShouldFindOverlappingFlightNumbers()
    {
        var db = CreateInMemoryDb();
        var service = new PostService(db);
        var travelDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(7));

        var post1 = await service.CreatePostAsync(new CreatePostRequest
        {
            PostType = "SEEKING_ASSISTANCE", OriginIata = "DEL", FinalDestinationIata = "SYD",
            TravelDate = travelDate,
            Segments = [new PostSegmentDto { SegmentOrder = 1, FlightNumber = "EK524", Airline = "Emirates", OriginIata = "DEL", DestinationIata = "DXB", DepartureTime = DateTimeOffset.UtcNow, ArrivalTime = DateTimeOffset.UtcNow.AddHours(4) }]
        }, "user-1");

        await service.CreatePostAsync(new CreatePostRequest
        {
            PostType = "OFFERING_ASSISTANCE", OriginIata = "DEL", FinalDestinationIata = "DXB",
            TravelDate = travelDate,
            Segments = [new PostSegmentDto { SegmentOrder = 1, FlightNumber = "EK524", Airline = "Emirates", OriginIata = "DEL", DestinationIata = "DXB", DepartureTime = DateTimeOffset.UtcNow, ArrivalTime = DateTimeOffset.UtcNow.AddHours(4) }]
        }, "user-2");

        var matches = await service.GetMatchesAsync(post1.Id, "user-1");

        matches.Should().HaveCount(1);
        matches[0].Segments[0].FlightNumber.Should().Be("EK524");
    }
}
