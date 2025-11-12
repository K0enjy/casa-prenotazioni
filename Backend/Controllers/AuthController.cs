using Microsoft.AspNetCore.Mvc;
using CasaPrenotazioni.API.DTOs;
using CasaPrenotazioni.API.Services;

namespace CasaPrenotazioni.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var user = await _authService.RegisterAsync(request.Nome, request.Email, request.Password);

        if (user == null)
        {
            return BadRequest(new { message = "Email già registrata" });
        }

        return Ok(new { message = "Registrazione completata con successo", userId = user.Id });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var token = await _authService.LoginAsync(request.Email, request.Password);

        if (token == null)
        {
            return Unauthorized(new { message = "Email o password errati" });
        }

        // Ottenere i dettagli dell'utente dal token
        var tokenHandler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var jwtToken = tokenHandler.ReadJwtToken(token);
        var userId = int.Parse(jwtToken.Claims.First(c => c.Type == "sub").Value);

        var user = await _authService.GetUserByIdAsync(userId);

        if (user == null)
        {
            return Unauthorized();
        }

        return Ok(new LoginResponse(token, user.Id, user.Nome, user.Email, user.Role));
    }
}
