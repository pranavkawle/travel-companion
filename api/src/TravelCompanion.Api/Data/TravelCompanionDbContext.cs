using Microsoft.EntityFrameworkCore;
using TravelCompanion.Api.Models.Domain;

namespace TravelCompanion.Api.Data;

public class TravelCompanionDbContext : DbContext
{
    public TravelCompanionDbContext(DbContextOptions<TravelCompanionDbContext> options)
        : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Airport> Airports => Set<Airport>();
    public DbSet<Language> Languages => Set<Language>();
    public DbSet<Connection> Connections => Set<Connection>();
    public DbSet<TravellerDetail> TravellerDetails => Set<TravellerDetail>();
    public DbSet<Models.Domain.Thread> Threads => Set<Models.Domain.Thread>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Report> Reports => Set<Report>();
    public DbSet<Block> Blocks => Set<Block>();
    public DbSet<EmailOutbox> EmailOutbox => Set<EmailOutbox>();
    public DbSet<MessageNotificationLog> MessageNotificationLogs => Set<MessageNotificationLog>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Users
        modelBuilder.Entity<User>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasElementName("_id").HasMaxLength(200);
        });

        // Posts — segments embedded
        modelBuilder.Entity<Post>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.PosterId).HasMaxLength(200);
        });

        modelBuilder.Entity<PostSegment>(_ => { });

        // Airports — MongoDB requires PK mapped to _id
        modelBuilder.Entity<Airport>(e =>
        {
            e.HasKey(x => x.IataCode);
            e.Property(x => x.IataCode).HasElementName("_id");
        });

        // Languages
        modelBuilder.Entity<Language>(e =>
        {
            e.HasKey(x => x.Code);
            e.Property(x => x.Code).HasElementName("_id");
        });

        // Connections
        modelBuilder.Entity<Connection>(e =>
        {
            e.HasKey(x => x.Id);
        });

        // TravellerDetails
        modelBuilder.Entity<TravellerDetail>(e =>
        {
            e.HasKey(x => x.Id);
        });

        // Threads
        modelBuilder.Entity<Models.Domain.Thread>(e =>
        {
            e.HasKey(x => x.Id);
        });

        // Messages
        modelBuilder.Entity<Message>(e =>
        {
            e.HasKey(x => x.Id);
        });

        // Reports
        modelBuilder.Entity<Report>(e =>
        {
            e.HasKey(x => x.Id);
        });

        // Blocks
        modelBuilder.Entity<Block>(e =>
        {
            e.HasKey(x => x.Id);
        });

        // EmailOutbox
        modelBuilder.Entity<EmailOutbox>(e =>
        {
            e.HasKey(x => x.Id);
        });

        // MessageNotificationLogs
        modelBuilder.Entity<MessageNotificationLog>(e =>
        {
            e.HasKey(x => x.Id);
        });
    }
}
