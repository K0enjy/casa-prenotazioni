namespace CasaPrenotazioni.API.Models;

public class Booking
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public DateTime DataInizio { get; set; }
    public DateTime DataFine { get; set; }
    public string? Note { get; set; }
    public DateTime DataCreazione { get; set; } = DateTime.UtcNow;

    // Relazione con l'utente
    public User? User { get; set; }
}
