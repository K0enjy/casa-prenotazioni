namespace CasaPrenotazioni.API.Services;

public interface IEmailService
{
    Task<bool> SendBookingNotificationAsync(string recipientEmail, string recipientName,
        string bookerName, DateTime dataInizio, DateTime dataFine, string? note);
}
