using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace CasaPrenotazioni.API.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendBookingNotificationAsync(string recipientEmail, string recipientName,
        string bookerName, DateTime dataInizio, DateTime dataFine, string? note)
    {
        try
        {
            var emailSettings = _configuration.GetSection("EmailSettings");

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                emailSettings["SenderName"],
                emailSettings["SenderEmail"]));
            message.To.Add(new MailboxAddress(recipientName, recipientEmail));
            message.Subject = "Nuova Prenotazione Casa in Montagna";

            var bodyBuilder = new BodyBuilder
            {
                HtmlBody = $@"
                    <h2>Nuova Prenotazione</h2>
                    <p>Ciao {recipientName},</p>
                    <p><strong>{bookerName}</strong> ha prenotato la casa in montagna.</p>
                    <ul>
                        <li><strong>Data Inizio:</strong> {dataInizio:dd/MM/yyyy}</li>
                        <li><strong>Data Fine:</strong> {dataFine:dd/MM/yyyy}</li>
                        {(string.IsNullOrEmpty(note) ? "" : $"<li><strong>Note:</strong> {note}</li>")}
                    </ul>
                    <p>Ricordati di controllare il calendario prima di pianificare la tua visita!</p>
                "
            };

            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(
                emailSettings["SmtpServer"],
                int.Parse(emailSettings["SmtpPort"] ?? "587"),
                SecureSocketOptions.StartTls);

            await client.AuthenticateAsync(
                emailSettings["Username"],
                emailSettings["Password"]);

            await client.SendAsync(message);
            await client.DisconnectAsync(true);

            _logger.LogInformation($"Email inviata a {recipientEmail}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Errore nell'invio email: {ex.Message}");
            return false;
        }
    }
}
