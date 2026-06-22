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
    [Authorize(Roles = "Customer")]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // GET: api/Cart
        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetUserId();

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null) return NotFound("Korpa nije pronađena.");

            var response = new CartResponseDTO
            {
                Id = cart.Id,
                Items = cart.CartItems.Select(ci => new CartItemResponseDTO
                {
                    Id = ci.Id,
                    ProductId = ci.ProductId,
                    ProductName = ci.Product.Name,
                    ImageUrl = ci.Product.ImageUrl,
                    UnitPrice = ci.Product.Price,
                    Quantity = ci.Quantity,
                    TotalPrice = ci.Product.Price * ci.Quantity
                }).ToList(),
                TotalAmount = cart.CartItems.Sum(ci => ci.Product.Price * ci.Quantity)
            };

            return Ok(response);
        }

        // POST: api/Cart — dodaj u korpu
        [HttpPost]
        public async Task<IActionResult> AddToCart(AddToCartDTO dto)
        {
            var userId = GetUserId();

            // Proveri da li proizvod postoji i ima dovoljno na stanju
            var product = await _context.Products.FindAsync(dto.ProductId);
            if (product == null || !product.IsActive)
                return NotFound("Proizvod nije pronađen.");

            if (dto.Quantity <= 0)
                return BadRequest("Količina mora biti veća od 0.");

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null) return NotFound("Korpa nije pronađena.");

            var existingItem = cart.CartItems.FirstOrDefault(ci => ci.ProductId == dto.ProductId);

            int newQuantity = (existingItem?.Quantity ?? 0) + dto.Quantity;

            // BIZNIS LOGIKA — ne može više od stanja na lageru
            if (newQuantity > product.StockQuantity)
                return BadRequest($"Nije moguće dodati {dto.Quantity} komada. Na stanju je {product.StockQuantity} komada.");

            if (existingItem != null)
            {
                existingItem.Quantity = newQuantity;
            }
            else
            {
                cart.CartItems.Add(new Models.CartItem
                {
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity
                });
            }

            await _context.SaveChangesAsync();
            return Ok("Proizvod dodat u korpu.");
        }

        // PUT: api/Cart/5 — izmeni količinu
        [HttpPut("{cartItemId}")]
        public async Task<IActionResult> UpdateQuantity(int cartItemId, AddToCartDTO dto)
        {
            var userId = GetUserId();

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null) return NotFound("Korpa nije pronađena.");

            var item = cart.CartItems.FirstOrDefault(ci => ci.Id == cartItemId);
            if (item == null) return NotFound("Stavka nije pronađena.");

            var product = await _context.Products.FindAsync(item.ProductId);

            // BIZNIS LOGIKA — provera stanja
            if (dto.Quantity > product!.StockQuantity)
                return BadRequest($"Na stanju je samo {product.StockQuantity} komada.");

            if (dto.Quantity <= 0)
            {
                cart.CartItems.Remove(item);
            }
            else
            {
                item.Quantity = dto.Quantity;
            }

            await _context.SaveChangesAsync();
            return Ok("Korpa ažurirana.");
        }

        // DELETE: api/Cart/5 — ukloni iz korpe
        [HttpDelete("{cartItemId}")]
        public async Task<IActionResult> RemoveFromCart(int cartItemId)
        {
            var userId = GetUserId();

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null) return NotFound("Korpa nije pronađena.");

            var item = cart.CartItems.FirstOrDefault(ci => ci.Id == cartItemId);
            if (item == null) return NotFound("Stavka nije pronađena.");

            cart.CartItems.Remove(item);
            await _context.SaveChangesAsync();

            return Ok("Stavka uklonjena iz korpe.");
        }

        // DELETE: api/Cart — isprazni korpu
        [HttpDelete]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetUserId();

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null) return NotFound("Korpa nije pronađena.");

            cart.CartItems.Clear();
            await _context.SaveChangesAsync();

            return Ok("Korpa ispražnjena.");
        }
    }
}