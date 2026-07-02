using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelCompanion.Api.Models.Dtos;
using TravelCompanion.Api.Services;

namespace TravelCompanion.Api.Controllers;

[ApiController]
[Authorize]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ICurrentUserService _currentUser;

    public AuthController(IAuthService authService, ICurrentUserService currentUser)
    {
        _authService = authService;
        _currentUser = currentUser;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        var userId = _currentUser.UserId!;
        var email = _currentUser.Email!;
        var mobileVerified = _currentUser.IsMobileVerified;

        try
        {
            var profile = await _authService.RegisterAsync(request, userId, email, mobileVerified);
            return CreatedAtAction(nameof(UsersController.GetProfile), "Users", profile);
        }
        catch (InvalidOperationException)
        {
            return Conflict(new ProblemDetails
            {
                Title = "Profile already exists",
                Status = 409
            });
        }
    }

    [HttpPost("sync")]
    public async Task<IActionResult> Sync()
    {
        var userId = _currentUser.UserId!;
        var mobileVerified = _currentUser.IsMobileVerified;

        var profile = await _authService.SyncProfileAsync(userId, mobileVerified);
        if (profile == null)
            return NotFound(new ProblemDetails { Title = "Profile not found", Status = 404 });

        return Ok(profile);
    }
}

[ApiController]
[Authorize]
[Route("users")]
public class UsersController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ICurrentUserService _currentUser;

    public UsersController(IAuthService authService, ICurrentUserService currentUser)
    {
        _authService = authService;
        _currentUser = currentUser;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetProfile()
    {
        var profile = await _authService.GetProfileAsync(_currentUser.UserId!);
        if (profile == null)
            return NotFound(new ProblemDetails { Title = "Not found", Status = 404 });
        return Ok(profile);
    }

    [HttpPatch("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateUserRequest request)
    {
        var profile = await _authService.UpdateProfileAsync(_currentUser.UserId!, request);
        if (profile == null)
            return NotFound(new ProblemDetails { Title = "Not found", Status = 404 });
        return Ok(profile);
    }

    [HttpDelete("me")]
    public async Task<IActionResult> DeleteProfile()
    {
        await _authService.DeleteProfileAsync(_currentUser.UserId!);
        return NoContent();
    }
}

[ApiController]
[Authorize]
[Route("users")]
public class ReportBlockController : ControllerBase
{
    private readonly IReportBlockService _reportBlockService;
    private readonly ICurrentUserService _currentUser;

    public ReportBlockController(IReportBlockService reportBlockService, ICurrentUserService currentUser)
    {
        _reportBlockService = reportBlockService;
        _currentUser = currentUser;
    }

    [HttpPost("{id}/report")]
    public async Task<IActionResult> ReportUser(string id, [FromBody] ReportRequest request)
    {
        try
        {
            await _reportBlockService.ReportUserAsync(id, request.Reason, _currentUser.UserId!);
            return Created();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails { Title = ex.Message, Status = 409 });
        }
    }

    [HttpPost("{id}/block")]
    public async Task<IActionResult> BlockUser(string id)
    {
        await _reportBlockService.BlockUserAsync(id, _currentUser.UserId!);
        return Created();
    }

    [HttpGet("blocked")]
    public async Task<IActionResult> GetBlockedUsers()
    {
        var blocked = await _reportBlockService.GetBlockedUsersAsync(_currentUser.UserId!);
        return Ok(blocked);
    }

    [HttpDelete("blocked/{id}")]
    public async Task<IActionResult> UnblockUser(string id)
    {
        await _reportBlockService.UnblockUserAsync(id, _currentUser.UserId!);
        return NoContent();
    }
}
