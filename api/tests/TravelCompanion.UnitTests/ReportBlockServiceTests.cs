using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using TravelCompanion.Api.Data;
using TravelCompanion.Api.Models.Domain;
using TravelCompanion.Api.Models.Dtos;
using TravelCompanion.Api.Services;
using Xunit;

namespace TravelCompanion.UnitTests;

public class ReportBlockServiceTests
{
    private TravelCompanionDbContext CreateInMemoryDb()
    {
        var options = new DbContextOptionsBuilder<TravelCompanionDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new TravelCompanionDbContext(options);
    }

    [Fact]
    public async Task ReportUserAsync_ShouldCreateReport()
    {
        var db = CreateInMemoryDb();
        db.Users.Add(new User { Id = "user-1", FirstName = "A", CreatedAt = DateTimeOffset.UtcNow });
        db.Users.Add(new User { Id = "user-2", FirstName = "B", CreatedAt = DateTimeOffset.UtcNow });
        await db.SaveChangesAsync();

        var service = new ReportBlockService(db);
        await service.ReportUserAsync("user-2", "spam", "user-1");

        var reports = await db.Reports.ToListAsync();
        reports.Should().HaveCount(1);
        reports[0].Reason.Should().Be("spam");
    }

    [Fact]
    public async Task ReportUserAsync_ShouldPreventDuplicateReports()
    {
        var db = CreateInMemoryDb();
        db.Users.Add(new User { Id = "user-1", FirstName = "A", CreatedAt = DateTimeOffset.UtcNow });
        db.Users.Add(new User { Id = "user-2", FirstName = "B", CreatedAt = DateTimeOffset.UtcNow });
        await db.SaveChangesAsync();

        var service = new ReportBlockService(db);
        await service.ReportUserAsync("user-2", "spam", "user-1");

        var act = async () => await service.ReportUserAsync("user-2", "spam", "user-1");
        await act.Should().ThrowAsync<InvalidOperationException>();
    }

    [Fact]
    public async Task ReportUserAsync_ShouldAutoBlock_After5Reports()
    {
        var db = CreateInMemoryDb();
        var reported = new User { Id = "reported", FirstName = "Bad", CreatedAt = DateTimeOffset.UtcNow };
        db.Users.Add(reported);
        await db.SaveChangesAsync();

        var service = new ReportBlockService(db);
        for (int i = 1; i <= 5; i++)
        {
            var reporterId = $"reporter-{i}";
            db.Users.Add(new User { Id = reporterId, FirstName = $"R{i}", CreatedAt = DateTimeOffset.UtcNow });
            await db.SaveChangesAsync();
            // Add a connection to make the reporter qualify
            db.Connections.Add(new Connection
            {
                Id = Guid.NewGuid(), InitiatorId = reporterId, PostId = Guid.NewGuid(),
                Status = ConnectionStatus.Accepted, CreatedAt = DateTimeOffset.UtcNow, UpdatedAt = DateTimeOffset.UtcNow
            });
            await db.SaveChangesAsync();
            await service.ReportUserAsync("reported", "bad behavior", reporterId);
        }

        var updatedReported = await db.Users.FirstAsync(u => u.Id == "reported");
        updatedReported.IsBlocked.Should().BeTrue();
        updatedReported.BlockedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task BlockUserAsync_ShouldCreateBlock()
    {
        var db = CreateInMemoryDb();
        var service = new ReportBlockService(db);

        await service.BlockUserAsync("user-2", "user-1");

        var blocks = await db.Blocks.ToListAsync();
        blocks.Should().HaveCount(1);
        blocks[0].BlockerId.Should().Be("user-1");
        blocks[0].BlockedUserId.Should().Be("user-2");
    }

    [Fact]
    public async Task UnblockUserAsync_ShouldRemoveBlock()
    {
        var db = CreateInMemoryDb();
        var service = new ReportBlockService(db);

        await service.BlockUserAsync("user-2", "user-1");
        await service.UnblockUserAsync("user-2", "user-1");

        var blocks = await db.Blocks.ToListAsync();
        blocks.Should().BeEmpty();
    }

    [Fact]
    public async Task ReportUserAsync_ShouldNotAllowSelfReport()
    {
        var db = CreateInMemoryDb();
        var service = new ReportBlockService(db);

        var act = async () => await service.ReportUserAsync("user-1", "test", "user-1");
        await act.Should().ThrowAsync<InvalidOperationException>();
    }
}
