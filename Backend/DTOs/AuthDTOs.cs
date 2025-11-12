namespace CasaPrenotazioni.API.DTOs;

public record RegisterRequest(string Nome, string Email, string Password);

public record LoginRequest(string Email, string Password);

public record LoginResponse(string Token, int UserId, string Nome, string Email, string Role);
