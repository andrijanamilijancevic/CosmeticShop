using CosmeticsShop.Data;
using CosmeticsShop.DTOs;
using CosmeticsShop.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace CosmeticsShop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReviewsController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET: api/Reviews/product/5 — svi mogu da vide
        [HttpGet("product/{productId}")]
        public async Task<IActionResult> GetByProduct(int productId)
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Where(r => r.ProductId == productId && r.IsApproved)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new ReviewResponseDTO
                {
                    Id = r.Id,
                    Rating = r.Rating,
                    Comment = r.Comment,
                    CreatedAt = r.CreatedAt,
                    CustomerName = $"{r.User.FirstName} {r.User.LastName}",
                    IsApproved = r.IsApproved
                })
                .ToListAsync();

            return Ok(reviews);
        }

        // POST: api/Reviews — samo Customer
        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> Create(CreateReviewDTO dto)
        {
            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest("Ocena mora biti između 1 i 5.");

            var productExists = await _context.Products.AnyAsync(p => p.Id == dto.ProductId);
            if (!productExists) return NotFound("Proizvod nije pronađen.");

            // Proveri da li je korisnik već ostavio recenziju
            var userId = GetUserId();
            var alreadyReviewed = await _context.Reviews
                .AnyAsync(r => r.ProductId == dto.ProductId && r.UserId == userId);

            if (alreadyReviewed)
                return BadRequest("Već ste ostavili recenziju za ovaj proizvod.");

            var review = new Review
            {
                ProductId = dto.ProductId,
                UserId = userId,
                Rating = dto.Rating,
                Comment = dto.Comment
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok("Recenzija uspešno dodata.");
        }

        // DELETE: api/Reviews/5 — samo Admin
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound("Recenzija nije pronađena.");

            _context.Reviews.Remove(review);
            await _context.SaveChangesAsync();

            return Ok("Recenzija obrisana.");
        }

        // PUT: api/Reviews/5/approve — samo Admin
        [HttpPut("{id}/approve")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Approve(int id)
        {
            var review = await _context.Reviews.FindAsync(id);
            if (review == null) return NotFound("Recenzija nije pronađena.");

            review.IsApproved = !review.IsApproved;
            await _context.SaveChangesAsync();

            return Ok($"Recenzija {(review.IsApproved ? "odobrena" : "skrivena")}.");
        }
    }
}