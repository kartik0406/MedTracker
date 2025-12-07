namespace MedTracker.API.Models;

public class AppUser
{
    public int AppUserId { get; set; }

    // From Azure AD token claims (oid / sub / name / email)
    public string SubjectId { get; set; } = default!; // unique per identity provider
    public string DisplayName { get; set; } = default!;
    public string Email { get; set; } = default!;
    public string Provider { get; set; } = "AzureAD";

    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
    public DateTime LastLoginOn { get; set; } = DateTime.UtcNow;

    public ICollection<LoginHistory> LoginHistories { get; set; } = new List<LoginHistory>();
}