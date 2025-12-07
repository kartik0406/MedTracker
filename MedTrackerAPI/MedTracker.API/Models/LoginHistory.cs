namespace MedTracker.API.Models;

public class LoginHistory
{
    public int LoginHistoryId { get; set; }
    public int AppUserId { get; set; }
    public AppUser AppUser { get; set; } = default!;

    public DateTime LoggedInAt { get; set; } = DateTime.UtcNow;
    public string? IpAddress { get; set; }
    public string? UserAgent { get; set; }
}