using Microsoft.EntityFrameworkCore;
using TravelCompanion.Api.Data;
using TravelCompanion.Api.Models.Domain;
using TravelCompanion.Api.Models.Dtos;

namespace TravelCompanion.Api.Services;

public interface IReportBlockService
{
    Task ReportUserAsync(string reportedUserId, string reason, string reporterId);
    Task BlockUserAsync(string blockedUserId, string blockerId);
    Task UnblockUserAsync(string blockedUserId, string blockerId);
    Task<List<string>> GetBlockedUsersAsync(string userId);
}

public interface IAdminService
{
    Task<List<FlaggedUserDto>> GetFlaggedUsersAsync();
    Task<List<BlockedUserDto>> GetBlockedUsersAsync();
    Task<List<ReportDto>> GetReportsForUserAsync(string userId);
    Task BlockUserAsync(string userId);
    Task UnblockUserAsync(string userId);
    Task DismissReportsAsync(string userId);
}

public class ReportBlockService : IReportBlockService
{
    private readonly TravelCompanionDbContext _db;

    public ReportBlockService(TravelCompanionDbContext db) => _db = db;

    public async Task ReportUserAsync(string reportedUserId, string reason, string reporterId)
    {
        if (reportedUserId == reporterId)
            throw new InvalidOperationException("Cannot report yourself");

        var alreadyReported = await _db.Reports
            .AnyAsync(r => r.ReporterId == reporterId && r.ReportedUserId == reportedUserId);
        if (alreadyReported)
            throw new InvalidOperationException("Already reported this user");

        var report = new Report
        {
            Id = Guid.NewGuid(),
            ReporterId = reporterId,
            ReportedUserId = reportedUserId,
            Reason = reason,
            CreatedAt = DateTimeOffset.UtcNow
        };

        _db.Reports.Add(report);
        await _db.SaveChangesAsync();

        // Check auto-block: 5+ unique qualifying reports
        var qualifyingReports = await _db.Reports
            .Where(r => r.ReportedUserId == reportedUserId && r.DismissedAt == null)
            .CountAsync();

        if (qualifyingReports >= 5)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == reportedUserId);
            if (user != null && !user.IsBlocked)
            {
                user.IsBlocked = true;
                user.BlockedAt = DateTimeOffset.UtcNow;
                await _db.SaveChangesAsync();
            }
        }
    }

    public async Task BlockUserAsync(string blockedUserId, string blockerId)
    {
        if (blockedUserId == blockerId)
            throw new InvalidOperationException("Cannot block yourself");

        var exists = await _db.Blocks
            .AnyAsync(b => b.BlockerId == blockerId && b.BlockedUserId == blockedUserId);
        if (exists) return;

        _db.Blocks.Add(new Block
        {
            Id = Guid.NewGuid(),
            BlockerId = blockerId,
            BlockedUserId = blockedUserId,
            CreatedAt = DateTimeOffset.UtcNow
        });
        await _db.SaveChangesAsync();
    }

    public async Task UnblockUserAsync(string blockedUserId, string blockerId)
    {
        var block = await _db.Blocks
            .FirstOrDefaultAsync(b => b.BlockerId == blockerId && b.BlockedUserId == blockedUserId);
        if (block == null) return;

        _db.Blocks.Remove(block);
        await _db.SaveChangesAsync();
    }

    public async Task<List<string>> GetBlockedUsersAsync(string userId)
    {
        return await _db.Blocks
            .Where(b => b.BlockerId == userId)
            .Select(b => b.BlockedUserId)
            .ToListAsync();
    }
}

public class AdminService : IAdminService
{
    private readonly TravelCompanionDbContext _db;

    public AdminService(TravelCompanionDbContext db) => _db = db;

    public async Task<List<FlaggedUserDto>> GetFlaggedUsersAsync()
    {
        // Users with 3-4 qualifying reports (not auto-blocked)
        var flagged = await _db.Reports
            .Where(r => r.DismissedAt == null)
            .GroupBy(r => r.ReportedUserId)
            .Where(g => g.Count() >= 3 && g.Count() < 5)
            .Select(g => new
            {
                UserId = g.Key,
                ReportCount = g.Count()
            })
            .ToListAsync();

        var result = new List<FlaggedUserDto>();
        foreach (var f in flagged)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == f.UserId);
            if (user != null && !user.IsBlocked)
            {
                result.Add(new FlaggedUserDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    ReportCount = f.ReportCount,
                    CreatedAt = user.CreatedAt
                });
            }
        }
        return result;
    }

    public async Task<List<BlockedUserDto>> GetBlockedUsersAsync()
    {
        return await _db.Users
            .Where(u => u.IsBlocked)
            .Select(u => new BlockedUserDto
            {
                Id = u.Id,
                FirstName = u.FirstName,
                BlockedAt = u.BlockedAt
            })
            .ToListAsync();
    }

    public async Task<List<ReportDto>> GetReportsForUserAsync(string userId)
    {
        var reports = await _db.Reports
            .Where(r => r.ReportedUserId == userId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reports.Select(r => new ReportDto
        {
            Id = r.Id,
            ReporterId = r.ReporterId,
            Reason = r.Reason,
            CreatedAt = r.CreatedAt,
            DismissedAt = r.DismissedAt
        }).ToList();
    }

    public async Task BlockUserAsync(string userId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return;
        user.IsBlocked = true;
        user.BlockedAt = DateTimeOffset.UtcNow;
        await _db.SaveChangesAsync();
    }

    public async Task UnblockUserAsync(string userId)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null) return;
        user.IsBlocked = false;
        user.BlockedAt = null;
        await _db.SaveChangesAsync();
    }

    public async Task DismissReportsAsync(string userId)
    {
        var reports = await _db.Reports
            .Where(r => r.ReportedUserId == userId && r.DismissedAt == null)
            .ToListAsync();

        foreach (var r in reports)
            r.DismissedAt = DateTimeOffset.UtcNow;

        await _db.SaveChangesAsync();
    }
}
