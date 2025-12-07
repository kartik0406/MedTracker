namespace MedTracker.API.Dtos;

public record MedicineListItemDto(
    int MedicineId,
    string Name,
    string Company,
    decimal Price,
    DateTime ExpiryDate,
    int Stock);

public record MedicineCreateUpdateDto(
    string Name,
    string Company,
    decimal Price,
    DateTime ExpiryDate,
    int Stock);