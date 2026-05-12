using CosmeticsShop.Data;
using CosmeticsShop.DTOs;
using CosmeticsShop.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CosmeticsShop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CouponsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CouponsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/Coupons — samo Admin
        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var coupons = await _context.Coupons
                .Select(c => new CouponResponseDTO
                {
                    Id = c.Id,
                    Code = c.Code,
                    DiscountPercent = c.DiscountPercent,
                    IsActive = c.IsActive,
                    ExpiresAt = c.ExpiresAt
                })
                .ToListAsync();

            return Ok(coupons);
        }

        // GET: api/Coupons/validate/SUMMER20 — Customer proverava kupon
        [HttpGet("validate/{code}")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> Validate(string code)
        {
            var coupon = await _context.Coupons.FirstOrDefaultAsync(c =>
                c.Code == code && c.IsActive && c.ExpiresAt > DateTime.UtcNow);

            if (coupon == null)
                return BadRequest("Kupon nije validan ili je istekao.");

            return Ok(new CouponResponseDTO
            {
                Id = coupon.Id,
                Code = coupon.Code,
                DiscountPercent = coupon.DiscountPercent,
                IsActive = coupon.IsActive,
                ExpiresAt = coupon.ExpiresAt
            });
        }

        // POST: api/Coupons — samo Admin
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(CreateCouponDTO dto)
        {
            if (dto.DiscountPercent <= 0 || dto.DiscountPercent > 100)
                return BadRequest("Popust mora biti između 1 i 100.");

            if (dto.ExpiresAt <= DateTime.UtcNow)
                return BadRequest("Datum isteka mora biti u budućnosti.");

            if (await _context.Coupons.AnyAsync(c => c.Code == dto.Code))
                return BadRequest("Kupon sa ovim kodom već postoji.");

            var coupon = new Coupon
            {
                Code = dto.Code,
                DiscountPercent = dto.DiscountPercent,
                ExpiresAt = dto.ExpiresAt,
                IsActive = true
            };

            _context.Coupons.Add(coupon);
            await _context.SaveChangesAsync();

            return Ok(new CouponResponseDTO
            {
                Id = coupon.Id,
                Code = coupon.Code,
                DiscountPercent = coupon.DiscountPercent,
                IsActive = coupon.IsActive,
                ExpiresAt = coupon.ExpiresAt
            });
        }

        // PUT: api/Coupons/5/toggle — aktiviraj/deaktiviraj
        [HttpPut("{id}/toggle")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Toggle(int id)
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null) return NotFound("Kupon nije pronađen.");

            coupon.IsActive = !coupon.IsActive;
            await _context.SaveChangesAsync();

            return Ok($"Kupon je {(coupon.IsActive ? "aktiviran" : "deaktiviran")}.");
        }

        // DELETE: api/Coupons/5 — samo Admin
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var coupon = await _context.Coupons.FindAsync(id);
            if (coupon == null) return NotFound("Kupon nije pronađen.");

            _context.Coupons.Remove(coupon);
            await _context.SaveChangesAsync();

            return Ok("Kupon obrisan.");
        }
    }
}