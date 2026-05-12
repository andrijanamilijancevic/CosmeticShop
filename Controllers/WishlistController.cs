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
    [Authorize(Roles = "Customer")]
    public class WishlistController : ControllerBase
    {
        private readonly AppDbContext _context;

        public WishlistController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET: api/Wishlist
        [HttpGet]
        public async Task<IActionResult> GetWishlist()
        {
            var userId = GetUserId();

            var items = await _context.WishlistItems
                .Include(w => w.Product)
                .ThenInclude(p => p.Category)
                .Where(w => w.UserId == userId)
                .Select(w => new ProductResponseDTO
                {
                    Id = w.Product.Id,
                    Name = w.Product.Name,
                    Description = w.Product.Description,
                    Price = w.Product.Price,
                    StockQuantity = w.Product.StockQuantity,
                    ImageUrl = w.Product.ImageUrl,
                    Brand = w.Product.Brand,
                    IsActive = w.Product.IsActive,
                    CategoryName = w.Product.Category.Name,
                    CategoryId = w.Product.CategoryId
                })
                .ToListAsync();

            return Ok(items);
        }

        // POST: api/Wishlist/5
        [HttpPost("{productId}")]
        public async Task<IActionResult> Add(int productId)
        {
            var userId = GetUserId();

            var product = await _context.Products.FindAsync(productId);
            if (product == null || !product.IsActive)
                return NotFound("Proizvod nije pronađen.");

            var exists = await _context.WishlistItems
                .AnyAsync(w => w.UserId == userId && w.ProductId == productId);

            if (exists)
                return BadRequest("Proizvod je već na wish listi.");

            _context.WishlistItems.Add(new WishlistItem
            {
                UserId = userId,
                ProductId = productId
            });

            await _context.SaveChangesAsync();
            return Ok("Proizvod dodat na wish listu.");
        }

        // DELETE: api/Wishlist/5
        [HttpDelete("{productId}")]
        public async Task<IActionResult> Remove(int productId)
        {
            var userId = GetUserId();

            var item = await _context.WishlistItems
                .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);

            if (item == null)
                return NotFound("Proizvod nije na wish listi.");

            _context.WishlistItems.Remove(item);
            await _context.SaveChangesAsync();

            return Ok("Proizvod uklonjen sa wish liste.");
        }
    }
}