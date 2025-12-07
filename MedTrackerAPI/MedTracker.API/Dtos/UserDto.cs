namespace MedTracker.API.Dtos;

public record CurrentUserDto(
    int AppUserId,
    string DisplayName,
    string Email,
    string Provider);