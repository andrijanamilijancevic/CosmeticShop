using CosmeticsShop.Data;
using CosmeticsShop.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CosmeticsShop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private string GetUserRole() =>
            User.FindFirstValue(ClaimTypes.Role)!;

        // GET: api/Users — samo Admin
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll(
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Users.AsQueryable();

            if (!string.IsNullOrEmpty(search))
                query = query.Where(u => u.Email.Contains(search) ||
                    u.FirstName.Contains(search) ||
                    u.LastName.Contains(search));

            var total = await query.CountAsync();
            var users = await query
                .OrderBy(u => u.LastName)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(u => new UserResponseDTO
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Email = u.Email,
                    Role = u.Role,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return Ok(new { total, page, pageSize, data = users });
        }

        // GET: api/Users/me — ulogovani korisnik vidi svoj profil
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var user = await _context.Users.FindAsync(GetUserId());
            if (user == null) return NotFound();

            return Ok(new UserResponseDTO
            {
                Id = user.Id,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                Role = user.Role,
                CreatedAt = user.CreatedAt
            });
        }

        // PUT: api/Users/me — izmeni profil
        [HttpPut("me")]
        public async Task<IActionResult> UpdateProfile(UpdateProfileDTO dto)
        {
            var user = await _context.Users.FindAsync(GetUserId());
            if (user == null) return NotFound();

            user.FirstName = dto.FirstName;
            user.LastName = dto.LastName;

            await _context.SaveChangesAsync();
            return Ok("Profil ažuriran.");
        }

        // PUT: api/Users/me/password — promeni lozinku
        [HttpPut("me/password")]
        public async Task<IActionResult> ChangePassword(ChangePasswordDTO dto)
        {
            var user = await _context.Users.FindAsync(GetUserId());
            if (user == null) return NotFound();

            if (!BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.PasswordHash))
                return BadRequest("Stara lozinka nije ispravna.");

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            await _context.SaveChangesAsync();

            return Ok("Lozinka uspešno promenjena.");
        }

        // DELETE: api/Users/5 — samo Admin
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound("Korisnik nije pronađen.");

            if (user.Role == "Admin")
                return BadRequest("Ne možete obrisati Admin korisnika.");

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();

            return Ok("Korisnik obrisan.");
        }
    }
}