using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CasaPrenotazioni.API.Data;
using CasaPrenotazioni.API.DTOs;
using CasaPrenotazioni.API.Models;
using CasaPrenotazioni.API.Services;
using System.Security.Claims;

namespace CasaPrenotazioni.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<BookingsController> _logger;

    public BookingsController(ApplicationDbContext context, IEmailService emailService,
        ILogger<BookingsController> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    private int GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;
        return int.Parse(userIdClaim ?? "0");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BookingResponse>>> GetAllBookings()
    {
        var bookings = await _context.Bookings
            .Include(b => b.User)
            .OrderBy(b => b.DataInizio)
            .Select(b => new BookingResponse(
                b.Id,
                b.UserId,
                b.User!.Nome,
                b.User.Email,
                b.DataInizio,
                b.DataFine,
                b.Note,
                b.DataCreazione
            ))
            .ToListAsync();

        return Ok(bookings);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BookingResponse>> GetBooking(int id)
    {
        var booking = await _context.Bookings
            .Include(b => b.User)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (booking == null)
        {
            return NotFound();
        }

        return Ok(new BookingResponse(
            booking.Id,
            booking.UserId,
            booking.User!.Nome,
            booking.User.Email,
            booking.DataInizio,
            booking.DataFine,
            booking.Note,
            booking.DataCreazione
        ));
    }

    [HttpGet("my")]
    public async Task<ActionResult<IEnumerable<BookingResponse>>> GetMyBookings()
    {
        var userId = GetCurrentUserId();

        var bookings = await _context.Bookings
            .Include(b => b.User)
            .Where(b => b.UserId == userId)
            .OrderBy(b => b.DataInizio)
            .Select(b => new BookingResponse(
                b.Id,
                b.UserId,
                b.User!.Nome,
                b.User.Email,
                b.DataInizio,
                b.DataFine,
                b.Note,
                b.DataCreazione
            ))
            .ToListAsync();

        return Ok(bookings);
    }

    [HttpPost]
    public async Task<ActionResult<BookingResponse>> CreateBooking([FromBody] CreateBookingRequest request)
    {
        var userId = GetCurrentUserId();

        // Verificare che la data di inizio sia prima della data di fine
        if (request.DataInizio >= request.DataFine)
        {
            return BadRequest(new { message = "La data di inizio deve essere prima della data di fine" });
        }

        // Verificare che non ci siano sovrapposizioni
        var hasOverlap = await _context.Bookings.AnyAsync(b =>
            (request.DataInizio < b.DataFine && request.DataFine > b.DataInizio));

        if (hasOverlap)
        {
            return Conflict(new { message = "Le date selezionate si sovrappongono con un'altra prenotazione" });
        }

        var booking = new Booking
        {
            UserId = userId,
            DataInizio = request.DataInizio,
            DataFine = request.DataFine,
            Note = request.Note
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        // Caricare l'utente per la risposta
        await _context.Entry(booking).Reference(b => b.User).LoadAsync();

        // Inviare notifiche email agli altri utenti (eseguito in background)
        _ = Task.Run(async () =>
        {
            try
            {
                var otherUsers = await _context.Users.Where(u => u.Id != userId).ToListAsync();
                foreach (var user in otherUsers)
                {
                    await _emailService.SendBookingNotificationAsync(
                        user.Email,
                        user.Nome,
                        booking.User!.Nome,
                        booking.DataInizio,
                        booking.DataFine,
                        booking.Note
                    );
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Errore nell'invio delle notifiche: {ex.Message}");
            }
        });

        var response = new BookingResponse(
            booking.Id,
            booking.UserId,
            booking.User!.Nome,
            booking.User.Email,
            booking.DataInizio,
            booking.DataFine,
            booking.Note,
            booking.DataCreazione
        );

        return CreatedAtAction(nameof(GetBooking), new { id = booking.Id }, response);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBooking(int id, [FromBody] UpdateBookingRequest request)
    {
        var userId = GetCurrentUserId();

        var booking = await _context.Bookings.FindAsync(id);

        if (booking == null)
        {
            return NotFound();
        }

        // Solo il proprietario della prenotazione può modificarla
        if (booking.UserId != userId)
        {
            return Forbid();
        }

        // Verificare che la data di inizio sia prima della data di fine
        if (request.DataInizio >= request.DataFine)
        {
            return BadRequest(new { message = "La data di inizio deve essere prima della data di fine" });
        }

        // Verificare che non ci siano sovrapposizioni (escludendo la prenotazione corrente)
        var hasOverlap = await _context.Bookings.AnyAsync(b =>
            b.Id != id &&
            (request.DataInizio < b.DataFine && request.DataFine > b.DataInizio));

        if (hasOverlap)
        {
            return Conflict(new { message = "Le date selezionate si sovrappongono con un'altra prenotazione" });
        }

        booking.DataInizio = request.DataInizio;
        booking.DataFine = request.DataFine;
        booking.Note = request.Note;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteBooking(int id)
    {
        var userId = GetCurrentUserId();

        var booking = await _context.Bookings.FindAsync(id);

        if (booking == null)
        {
            return NotFound();
        }

        // Solo il proprietario della prenotazione può eliminarla
        if (booking.UserId != userId)
        {
            return Forbid();
        }

        _context.Bookings.Remove(booking);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("check-availability")]
    public async Task<ActionResult<bool>> CheckAvailability([FromQuery] DateTime dataInizio, [FromQuery] DateTime dataFine)
    {
        var hasOverlap = await _context.Bookings.AnyAsync(b =>
            (dataInizio < b.DataFine && dataFine > b.DataInizio));

        return Ok(new { available = !hasOverlap });
    }
}
