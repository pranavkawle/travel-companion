using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelCompanion.Api.Models.Dtos;
using TravelCompanion.Api.Services;

namespace TravelCompanion.Api.Controllers;

[ApiController]
[Authorize]
[Route("messages")]
public class MessagesController : ControllerBase
{
    private readonly IMessagingService _messagingService;
    private readonly ICurrentUserService _currentUser;

    public MessagesController(IMessagingService messagingService, ICurrentUserService currentUser)
    {
        _messagingService = messagingService;
        _currentUser = currentUser;
    }

    [HttpGet("threads")]
    public async Task<IActionResult> GetThreads()
    {
        var threads = await _messagingService.GetThreadsAsync(_currentUser.UserId!);
        return Ok(threads);
    }

    [HttpGet("threads/{id:guid}")]
    public async Task<IActionResult> GetMessages(Guid id)
    {
        try
        {
            var messages = await _messagingService.GetMessagesAsync(id, _currentUser.UserId!);
            return Ok(messages);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpPost("threads/{id:guid}")]
    public async Task<IActionResult> SendMessage(Guid id, [FromBody] SendMessageRequest request)
    {
        try
        {
            var message = await _messagingService.SendMessageAsync(id, request, _currentUser.UserId!);
            return Created(message.Id.ToString(), message);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails { Title = ex.Message, Status = 404 });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}

[ApiController]
[Route("flights")]
[Authorize]
public class FlightsController : ControllerBase
{
    private readonly IFlightService _flightService;

    public FlightsController(IFlightService flightService) => _flightService = flightService;

    [HttpGet("search")]
    public async Task<IActionResult> SearchFlights(
        [FromQuery] string originIata,
        [FromQuery] string destinationIata,
        [FromQuery] string date)
    {
        if (!DateOnly.TryParse(date, out var parsedDate))
            return BadRequest(new ProblemDetails { Title = "Invalid date format", Status = 400 });

        var flights = await _flightService.SearchFlightsAsync(originIata, destinationIata, parsedDate);
        return Ok(flights);
    }
}

[ApiController]
[Route("airports")]
[AllowAnonymous]
public class AirportsController : ControllerBase
{
    private readonly IFlightService _flightService;

    public AirportsController(IFlightService flightService) => _flightService = flightService;

    [HttpGet("search")]
    public async Task<IActionResult> SearchAirports([FromQuery] string q)
    {
        var airports = await _flightService.SearchAirportsAsync(q);
        return Ok(airports);
    }
}

[ApiController]
[Authorize]
[Route("logs")]
public class LogsController : ControllerBase
{
    private readonly ILogger<LogsController> _logger;

    public LogsController(ILogger<LogsController> logger) => _logger = logger;

    [HttpPost("client-error")]
    public IActionResult LogClientError([FromBody] ClientErrorRequest request)
    {
        var json = System.Text.Json.JsonSerializer.Serialize(request);
        if (json.Length > 4096)
            return StatusCode(413);

        _logger.LogWarning("Client error: {Error}", json);
        return NoContent();
    }
}

[ApiController]
[Authorize(Policy = "RequireAdmin")]
[Route("admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService) => _adminService = adminService;

    [HttpGet("users/flagged")]
    public async Task<IActionResult> GetFlaggedUsers()
    {
        var flagged = await _adminService.GetFlaggedUsersAsync();
        return Ok(flagged);
    }

    [HttpGet("users/blocked")]
    public async Task<IActionResult> GetBlockedUsers()
    {
        var blocked = await _adminService.GetBlockedUsersAsync();
        return Ok(blocked);
    }

    [HttpGet("users/{id}/reports")]
    public async Task<IActionResult> GetReportsForUser(string id)
    {
        var reports = await _adminService.GetReportsForUserAsync(id);
        return Ok(reports);
    }

    [HttpPost("users/{id}/block")]
    public async Task<IActionResult> BlockUser(string id)
    {
        await _adminService.BlockUserAsync(id);
        return NoContent();
    }

    [HttpPost("users/{id}/unblock")]
    public async Task<IActionResult> UnblockUser(string id)
    {
        await _adminService.UnblockUserAsync(id);
        return NoContent();
    }

    [HttpPost("users/{id}/reports/dismiss")]
    public async Task<IActionResult> DismissReports(string id)
    {
        await _adminService.DismissReportsAsync(id);
        return NoContent();
    }
}
