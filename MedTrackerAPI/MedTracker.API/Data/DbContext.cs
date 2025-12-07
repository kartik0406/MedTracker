using MedTracker.API.Models;
using Microsoft.EntityFrameworkCore;

namespace MedTracker.API.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Medicine> Medicines => Set<Medicine>();
    public DbSet<AppUser> AppUsers => Set<AppUser>();
    public DbSet<LoginHistory> LoginHistories => Set<LoginHistory>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Medicine>(entity =>
        {
            entity.HasKey(m => m.MedicineId);
            entity.Property(m => m.Name).IsRequired().HasMaxLength(200);
            entity.Property(m => m.Company).IsRequired().HasMaxLength(200);
            entity.Property(m => m.Price).HasColumnType("decimal(18,2)");
        });

        modelBuilder.Entity<AppUser>(entity =>
        {
            entity.HasKey(u => u.AppUserId);
            entity.HasIndex(u => u.SubjectId).IsUnique();
            entity.Property(u => u.DisplayName).IsRequired().HasMaxLength(200);
            entity.Property(u => u.Email).IsRequired().HasMaxLength(200);
            entity.Property(u => u.Provider).IsRequired().HasMaxLength(50);
        });

        modelBuilder.Entity<LoginHistory>(entity =>
        {
            entity.HasKey(l => l.LoginHistoryId);
            entity.HasOne(l => l.AppUser)
                .WithMany(u => u.LoginHistories)
                .HasForeignKey(l => l.AppUserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
    }
}