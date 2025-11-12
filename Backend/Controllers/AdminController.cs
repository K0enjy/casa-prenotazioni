using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CasaPrenotazioni.API.Data;
using CasaPrenotazioni.API.Models;

namespace CasaPrenotazioni.API.Controllers;

[Authorize(Roles = "Admin")]
[ApiController]
[Route("api/[controller]")]
public class AdminController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<AdminController> _logger;

    public AdminController(ApplicationDbContext context, ILogger<AdminController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/admin/users
    [HttpGet("users")]
    public async Task<ActionResult<IEnumerable<object>>> GetAllUsers()
    {
        var users = await _context.Users
            .Include(u => u.Prenotazioni)
            .Select(u => new
            {
                u.Id,
                u.Nome,
                u.Email,
                u.Role,
                u.DataCreazione,
                NumeroPrenotazioni = u.Prenotazioni.Count
            })
            .ToListAsync();

        return Ok(users);
    }

    // DELETE: api/admin/users/{id}
    [HttpDelete("users/{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound(new { message = "Utente non trovato" });
        }

        // Non permettere di eliminare se stesso
        var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value ?? "0");

        if (user.Id == currentUserId)
        {
            return BadRequest(new { message = "Non puoi eliminare il tuo stesso account" });
        }

        // Verificare che rimanga almeno un admin
        if (user.Role == "Admin")
        {
            var adminCount = await _context.Users.CountAsync(u => u.Role == "Admin");
            if (adminCount <= 1)
            {
                return BadRequest(new { message = "Non puoi eliminare l'ultimo amministratore" });
            }
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Utente eliminato con successo" });
    }

    // PUT: api/admin/users/{id}/role
    [HttpPut("users/{id}/role")]
    public async Task<IActionResult> ChangeUserRole(int id, [FromBody] ChangeRoleRequest request)
    {
        var user = await _context.Users.FindAsync(id);

        if (user == null)
        {
            return NotFound(new { message = "Utente non trovato" });
        }

        if (request.Role != "Admin" && request.Role != "User")
        {
            return BadRequest(new { message = "Ruolo non valido. Usa 'Admin' o 'User'" });
        }

        // Non permettere di cambiare il proprio ruolo
        var currentUserId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value ?? "0");

        if (user.Id == currentUserId)
        {
            return BadRequest(new { message = "Non puoi modificare il tuo stesso ruolo" });
        }

        // Verificare che rimanga almeno un admin
        if (user.Role == "Admin" && request.Role == "User")
        {
            var adminCount = await _context.Users.CountAsync(u => u.Role == "Admin");
            if (adminCount <= 1)
            {
                return BadRequest(new { message = "Deve rimanere almeno un amministratore" });
            }
        }

        user.Role = request.Role;
        await _context.SaveChangesAsync();

        return Ok(new { message = $"Ruolo aggiornato a {request.Role}" });
    }

    // DELETE: api/admin/bookings/{id}
    [HttpDelete("bookings/{id}")]
    public async Task<IActionResult> DeleteAnyBooking(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);

        if (booking == null)
        {
            return NotFound(new { message = "Prenotazione non trovata" });
        }

        _context.Bookings.Remove(booking);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Prenotazione eliminata con successo" });
    }

    // GET: api/admin/stats
    [HttpGet("stats")]
    public async Task<ActionResult<object>> GetStats()
    {
        var totalUsers = await _context.Users.CountAsync();
        var totalBookings = await _context.Bookings.CountAsync();
        var activeBookings = await _context.Bookings
            .CountAsync(b => b.DataFine > DateTime.UtcNow);
        var pastBookings = await _context.Bookings
            .CountAsync(b => b.DataFine <= DateTime.UtcNow);

        return Ok(new
        {
            totalUsers,
            totalBookings,
            activeBookings,
            pastBookings
        });
    }
}

public record ChangeRoleRequest(string Role);
