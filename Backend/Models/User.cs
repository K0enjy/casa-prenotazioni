namespace CasaPrenotazioni.API.Models;

public class User
{
    public int Id { get; set; }
    public required string Nome { get; set; }
    public required string Email { get; set; }
    public required string PasswordHash { get; set; }
    public string Role { get; set; } = "User"; // "Admin" o "User"
    public DateTime DataCreazione { get; set; } = DateTime.UtcNow;

    // Relazione con le prenotazioni
    public ICollection<Booking> Prenotazioni { get; set; } = new List<Booking>();
}
