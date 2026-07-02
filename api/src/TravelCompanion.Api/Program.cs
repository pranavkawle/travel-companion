using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using MongoDB.Driver;
using MongoDB.EntityFrameworkCore.Extensions;
using Serilog;
using System.Threading.RateLimiting;
using TravelCompanion.Api.Data;
using TravelCompanion.Api.Services;
using Microsoft.Extensions.Diagnostics.HealthChecks;

var builder = WebApplication.CreateBuilder(args);

// DOTNET_SYSTEM_GLOBALIZATION_INVARIANT workaround
builder.Configuration.AddEnvironmentVariables();

// Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .WriteTo.Console()
    .CreateLogger();
builder.Host.UseSerilog();

// Load .env file if present
var envPath = Path.Combine(Directory.GetCurrentDirectory(), "..", "..", ".env");
if (!File.Exists(envPath))
    envPath = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (File.Exists(envPath))
    foreach (var line in File.ReadAllLines(envPath))
    {
        var trimmed = line.Trim();
        if (string.IsNullOrEmpty(trimmed) || trimmed.StartsWith('#')) continue;
        var eqIdx = trimmed.IndexOf('=');
        if (eqIdx < 0) continue;
        var key = trimmed[..eqIdx].Trim().Trim('"');
        var val = trimmed[(eqIdx + 1)..].Trim().Trim('"');
        if (!string.IsNullOrEmpty(val))
            Environment.SetEnvironmentVariable(key, val);
    }

// EF Core MongoDB
var mongoConnStr = Environment.GetEnvironmentVariable("DATABASE_URL")
    ?? "mongodb://127.0.0.1:27017";
var mongoDbName = Environment.GetEnvironmentVariable("MONGO_INITDB_DATABASE")
    ?? "travel_companion";

builder.Services.AddDbContext<TravelCompanionDbContext>(options =>
    options.UseMongoDB(mongoConnStr, mongoDbName));

// HTTP
builder.Services.AddHttpContextAccessor();
builder.Services.AddHttpClient<FlightService>();
builder.Services.AddScoped<IFlightService>(sp =>
{
    var http = sp.GetRequiredService<IHttpClientFactory>().CreateClient("FlightService");
    var config = sp.GetRequiredService<IConfiguration>();
    var db = sp.GetRequiredService<TravelCompanionDbContext>();
    return new FlightService(http, config, db);
});

// Services
builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPostService, PostService>();
builder.Services.AddScoped<IConnectionService, ConnectionService>();
builder.Services.AddScoped<IMessagingService, MessagingService>();
builder.Services.AddScoped<IReportBlockService, ReportBlockService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddSingleton<IEncryptionService, EncryptionService>();

// Auth0 JWT
var auth0Domain = Environment.GetEnvironmentVariable("AUTH0_DOMAIN") ?? "";
var auth0Audience = Environment.GetEnvironmentVariable("AUTH0_AUDIENCE") ?? "";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = $"https://{auth0Domain}/";
        options.Audience = auth0Audience;
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = $"https://{auth0Domain}/",
            ValidateAudience = true,
            ValidAudience = auth0Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("RequireAdmin", policy =>
        policy.RequireClaim("https://travel-companion.app/roles", "admin"));

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddFixedWindowLimiter("register", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
    });
    options.AddFixedWindowLimiter("post-create", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromMinutes(1);
    });
    options.AddFixedWindowLimiter("connection-create", opt =>
    {
        opt.PermitLimit = 20;
        opt.Window = TimeSpan.FromMinutes(1);
    });
    options.AddFixedWindowLimiter("report", opt =>
    {
        opt.PermitLimit = 10;
        opt.Window = TimeSpan.FromMinutes(1);
    });
    options.AddSlidingWindowLimiter("message-send", opt =>
    {
        opt.PermitLimit = 60;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.SegmentsPerWindow = 4;
    });
    options.AddFixedWindowLimiter("airport-search", opt =>
    {
        opt.PermitLimit = 30;
        opt.Window = TimeSpan.FromMinutes(1);
    });
    options.AddSlidingWindowLimiter("global", opt =>
    {
        opt.PermitLimit = 300;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.SegmentsPerWindow = 6;
    });
});

// Controllers + Problem Details
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddEndpointsApiExplorer();

// CORS — allow SPA
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins(
                "http://localhost:4200",
                "http://localhost:5173",
                "http://127.0.0.1:4200"
              )
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// Health checks
builder.Services.AddHealthChecks()
    .AddCheck<MongoHealthCheck>("mongodb", tags: ["ready"]);

var app = builder.Build();

app.UseSerilogRequestLogging(opts =>
{
    
});

app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health", new()
{
    Predicate = _ => false // liveness — always 200
});
app.MapHealthChecks("/health/ready", new()
{
    Predicate = check => check.Tags.Contains("ready")
});


// Seed data
using (var scope = app.Services.CreateScope())
{
    var mongoClient = new MongoClient(mongoConnStr);
    var mongoDb = mongoClient.GetDatabase(mongoDbName);
    await SeedData.SeedAsync(mongoDb);
}

app.Run();

public partial class Program { }

public class MongoHealthCheck : IHealthCheck
{
    private readonly TravelCompanionDbContext _db;
    public MongoHealthCheck(TravelCompanionDbContext db) => _db = db;

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        try
        {
            _ = await _db.Users.FirstOrDefaultAsync(cancellationToken);
            return HealthCheckResult.Healthy("MongoDB reachable");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("MongoDB unreachable", ex);
        }
    }
}
