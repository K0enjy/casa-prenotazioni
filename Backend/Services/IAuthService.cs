using CasaPrenotazioni.API.Models;

namespace CasaPrenotazioni.API.Services;

public interface IAuthService
{
    Task<User?> RegisterAsync(string nome, string email, string password);
    Task<string?> LoginAsync(string email, string password);
    Task<User?> GetUserByIdAsync(int userId);
}
