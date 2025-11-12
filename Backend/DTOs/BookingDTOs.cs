namespace CasaPrenotazioni.API.DTOs;

public record CreateBookingRequest(DateTime DataInizio, DateTime DataFine, string? Note);

public record UpdateBookingRequest(DateTime DataInizio, DateTime DataFine, string? Note);

public record BookingResponse(
    int Id,
    int UserId,
    string UserNome,
    string UserEmail,
    DateTime DataInizio,
    DateTime DataFine,
    string? Note,
    DateTime DataCreazione
);
