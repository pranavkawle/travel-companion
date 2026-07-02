using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TravelCompanion.Api.Models.Dtos;
using TravelCompanion.Api.Services;

namespace TravelCompanion.Api.Controllers;

[ApiController]
[Authorize]
[Route("posts")]
public class PostsController : ControllerBase
{
    private readonly IPostService _postService;
    private readonly ICurrentUserService _currentUser;

    public PostsController(IPostService postService, ICurrentUserService currentUser)
    {
        _postService = postService;
        _currentUser = currentUser;
    }

    [HttpPost]
    public async Task<IActionResult> CreatePost([FromBody] CreatePostRequest request)
    {
        try
        {
            var post = await _postService.CreatePostAsync(request, _currentUser.UserId!);
            return CreatedAtAction(nameof(GetPost), new { id = post.Id }, post);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails { Title = ex.Message, Status = 400 });
        }
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchPosts(
        [FromQuery] string? originIata,
        [FromQuery] string? destinationIata,
        [FromQuery] string? date,
        [FromQuery] List<string>? languages,
        [FromQuery] string? postType,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        DateOnly? parsedDate = null;
        if (!string.IsNullOrEmpty(date) && DateOnly.TryParse(date, out var d))
            parsedDate = d;

        var posts = await _postService.SearchPostsAsync(
            originIata, destinationIata, parsedDate,
            languages, postType, page, pageSize, _currentUser.UserId);
        return Ok(posts);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetPost(Guid id)
    {
        var post = await _postService.GetPostAsync(id, _currentUser.UserId);
        if (post == null)
            return NotFound(new ProblemDetails { Title = "Not found", Status = 404 });
        return Ok(post);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdatePost(Guid id, [FromBody] UpdatePostRequest request)
    {
        var post = await _postService.UpdatePostAsync(id, request, _currentUser.UserId!);
        if (post == null)
            return NotFound(new ProblemDetails { Title = "Not found", Status = 404 });
        return Ok(post);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeletePost(Guid id)
    {
        var deleted = await _postService.DeletePostAsync(id, _currentUser.UserId!);
        if (!deleted)
            return NotFound(new ProblemDetails { Title = "Not found", Status = 404 });
        return NoContent();
    }

    [HttpGet("{id:guid}/matches")]
    public async Task<IActionResult> GetMatches(Guid id)
    {
        var matches = await _postService.GetMatchesAsync(id, _currentUser.UserId!);
        return Ok(matches);
    }
}

[ApiController]
[Authorize]
[Route("posts/{postId:guid}/connections")]
public class PostConnectionsController : ControllerBase
{
    private readonly IConnectionService _connectionService;
    private readonly ICurrentUserService _currentUser;

    public PostConnectionsController(IConnectionService connectionService, ICurrentUserService currentUser)
    {
        _connectionService = connectionService;
        _currentUser = currentUser;
    }

    [HttpPost]
    public async Task<IActionResult> CreateConnection(Guid postId)
    {
        try
        {
            var connection = await _connectionService.CreateConnectionAsync(postId, _currentUser.UserId!);
            return Created($"/connections/{connection.Id}", connection);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails { Title = ex.Message, Status = 404 });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails { Title = ex.Message, Status = 409 });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Forbid();
        }
    }
}

[ApiController]
[Authorize]
[Route("connections")]
public class ConnectionsController : ControllerBase
{
    private readonly IConnectionService _connectionService;
    private readonly ICurrentUserService _currentUser;

    public ConnectionsController(IConnectionService connectionService, ICurrentUserService currentUser)
    {
        _connectionService = connectionService;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetConnections([FromQuery] string? status)
    {
        var connections = await _connectionService.GetConnectionsAsync(_currentUser.UserId!, status);
        return Ok(connections);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetConnection(Guid id)
    {
        var connections = await _connectionService.GetConnectionsAsync(_currentUser.UserId!, null);
        var connection = connections.FirstOrDefault(c => c.Id == id);
        if (connection == null)
            return NotFound(new ProblemDetails { Title = "Not found", Status = 404 });
        return Ok(connection);
    }

    [HttpPatch("{id:guid}")]
    public async Task<IActionResult> UpdateConnection(Guid id, [FromBody] UpdateConnectionRequest request)
    {
        try
        {
            var connection = await _connectionService.UpdateConnectionAsync(id, request.Status, _currentUser.UserId!);
            if (connection == null)
                return NotFound(new ProblemDetails { Title = "Not found", Status = 404 });
            return Ok(connection);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpPost("{id:guid}/traveller-details")]
    public async Task<IActionResult> ShareTravellerDetails(Guid id, [FromBody] TravellerDetailsRequest request)
    {
        try
        {
            var details = await _connectionService.ShareTravellerDetailsAsync(id, request, _currentUser.UserId!);
            return Created(details.Id.ToString(), details);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails { Title = ex.Message, Status = 404 });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new ProblemDetails { Title = ex.Message, Status = 400 });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }
}
