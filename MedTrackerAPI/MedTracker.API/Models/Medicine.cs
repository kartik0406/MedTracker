namespace MedTracker.API.Models;

public class Medicine
{
    public int MedicineId { get; set; }
    public string Name { get; set; } = default!;
    public string Company { get; set; } = default!;
    public decimal Price { get; set; }
    public DateTime ExpiryDate { get; set; }
    public int Stock { get; set; }
    public DateTime CreatedOn { get; set; } = DateTime.UtcNow;
}