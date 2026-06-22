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
    [Authorize]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private string GetUserRole() =>
            User.FindFirstValue(ClaimTypes.Role)!;

        // GET: api/Orders — Admin vidi sve, Customer vidi svoje
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .AsQueryable();

            if (GetUserRole() == "Customer")
                query = query.Where(o => o.UserId == GetUserId());

            var total = await query.CountAsync();
            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var result = orders.Select(o => new OrderResponseDTO
            {
                Id = o.Id,
                CreatedAt = o.CreatedAt,
                Status = o.Status,
                TotalAmount = o.TotalAmount,
                CouponCode = o.CouponCode,
                StripePaymentId = o.StripePaymentId,
                CustomerName = $"{o.User.FirstName} {o.User.LastName}",
                CustomerEmail = o.User.Email,
                Items = o.OrderItems.Select(oi => new OrderItemResponseDTO
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Product.Name,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.UnitPrice * oi.Quantity
                }).ToList()
            });

            return Ok(new { total, page, pageSize, data = result });
        }

        // GET: api/Orders/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound("Porudžbina nije pronađena.");

            if (GetUserRole() == "Customer" && order.UserId != GetUserId())
                return Forbid();

            return Ok(new OrderResponseDTO
            {
                Id = order.Id,
                CreatedAt = order.CreatedAt,
                Status = order.Status,
                TotalAmount = order.TotalAmount,
                CouponCode = order.CouponCode,
                StripePaymentId = order.StripePaymentId,
                CustomerName = $"{order.User.FirstName} {order.User.LastName}",
                CustomerEmail = order.User.Email,
                Items = order.OrderItems.Select(oi => new OrderItemResponseDTO
                {
                    ProductId = oi.ProductId,
                    ProductName = oi.Product.Name,
                    Quantity = oi.Quantity,
                    UnitPrice = oi.UnitPrice,
                    TotalPrice = oi.UnitPrice * oi.Quantity
                }).ToList()
            });
        }

        // POST: api/Orders — kreira porudžbinu iz korpe
        [HttpPost]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CreateOrder(CreateOrderDTO dto)
        {
            var userId = GetUserId();

            var cart = await _context.Carts
                .Include(c => c.CartItems)
                .ThenInclude(ci => ci.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (cart == null || !cart.CartItems.Any())
                return BadRequest("Korpa je prazna.");

            // Proveri stanje za sve proizvode
            foreach (var item in cart.CartItems)
            {
                if (item.Quantity > item.Product.StockQuantity)
                    return BadRequest($"Proizvod '{item.Product.Name}' nema dovoljno na stanju.");
            }

            decimal totalAmount = cart.CartItems.Sum(ci => ci.Product.Price * ci.Quantity);

            // Primeni kupon ako postoji
            if (!string.IsNullOrEmpty(dto.CouponCode))
            {
                var coupon = await _context.Coupons.FirstOrDefaultAsync(c =>
                    c.Code == dto.CouponCode && c.IsActive && c.ExpiresAt > DateTime.UtcNow);

                if (coupon == null)
                    return BadRequest("Kupon nije validan ili je istekao.");

                totalAmount -= totalAmount * (coupon.DiscountPercent / 100);
            }

            // Kreiraj porudžbinu
            var order = new Order
            {
                UserId = userId,
                TotalAmount = totalAmount,
                CouponCode = dto.CouponCode,
                Status = "Pending"
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            // Dodaj stavke i smanji stanje na lageru (BIZNIS LOGIKA)
            foreach (var item in cart.CartItems)
            {
                _context.OrderItems.Add(new OrderItem
                {
                    OrderId = order.Id,
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    UnitPrice = item.Product.Price
                });

                // Smanjivanje stanja nakon porudžbine
                item.Product.StockQuantity -= item.Quantity;
            }

            // Isprazni korpu
            cart.CartItems.Clear();

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = order.Id }, new { message = "Porudžbina kreirana.", orderId = order.Id });
        }

        // PUT: api/Orders/5/status — samo Admin menja status
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string status)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return NotFound("Porudžbina nije pronađena.");

            order.Status = status;
            await _context.SaveChangesAsync();

            return Ok("Status porudžbine ažuriran.");
        }
    }
}