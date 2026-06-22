using CosmeticsShop.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;
using Stripe.Checkout;
using System.Security.Claims;

namespace CosmeticsShop.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StripeController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public StripeController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // POST: api/Stripe/create-checkout-session
        [HttpPost("create-checkout-session")]
        [Authorize(Roles = "Customer")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.UserId == GetUserId());

            if (order == null)
                return NotFound("Porudžbina nije pronađena.");

            StripeConfiguration.ApiKey = _configuration["StripeSettings:SecretKey"];

            var lineItems = order.OrderItems.Select(oi => new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "rsd",
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = oi.Product.Name,
                        Images = new List<string> { oi.Product.ImageUrl }
                    },
                    UnitAmount = (long)(oi.UnitPrice * 100)
                },
                Quantity = oi.Quantity
            }).ToList();

            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = lineItems,
                Mode = "payment",
                SuccessUrl = "http://localhost:4200/order-success?orderId=" + orderId,
                CancelUrl = "http://localhost:4200/cart",
                Metadata = new Dictionary<string, string>
                {
                    { "orderId", orderId.ToString() },
                    { "userId", GetUserId().ToString() }
                }
            };

            var service = new SessionService();
            var session = await service.CreateAsync(options);

            return Ok(new { sessionUrl = session.Url });
        }

        // POST: api/Stripe/webhook
        [HttpPost("webhook")]
        public async Task<IActionResult> Webhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var webhookSecret = _configuration["StripeSettings:WebhookSecret"];

            try
            {
                StripeConfiguration.ApiKey = _configuration["StripeSettings:SecretKey"];

                Event stripeEvent;

                if (!string.IsNullOrEmpty(webhookSecret))
                {
                    var signature = Request.Headers["Stripe-Signature"];
                    stripeEvent = EventUtility.ConstructEvent(json, signature, webhookSecret);
                }
                else
                {
                    stripeEvent = EventUtility.ParseEvent(json);
                }

                if (stripeEvent.Type == "checkout.session.completed")
                {
                    var session = stripeEvent.Data.Object as Session;
                    if (session == null) return BadRequest();

                    var orderId = int.Parse(session.Metadata["orderId"]);

                    var order = await _context.Orders.FindAsync(orderId);
                    if (order != null)
                    {
                        order.Status = "Paid";
                        order.StripePaymentId = session.PaymentIntentId;
                        await _context.SaveChangesAsync();
                    }
                }

                return Ok();
            }
            catch (StripeException ex)
            {
                return BadRequest($"Webhook greška: {ex.Message}");
            }
        }

        // GET: api/Stripe/transactions — samo Admin
        [HttpGet("transactions")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetTransactions(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            var query = _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Where(o => o.Status == "Paid" && o.StripePaymentId != null);

            var total = await query.CountAsync();
            var transactions = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(o => new
                {
                    orderId = o.Id,
                    stripePaymentId = o.StripePaymentId,
                    customerName = $"{o.User.FirstName} {o.User.LastName}",
                    customerEmail = o.User.Email,
                    totalAmount = o.TotalAmount,
                    createdAt = o.CreatedAt,
                    items = o.OrderItems.Select(oi => new
                    {
                        productName = oi.Product.Name,
                        quantity = oi.Quantity,
                        unitPrice = oi.UnitPrice
                    })
                })
                .ToListAsync();

            return Ok(new { total, page, pageSize, data = transactions });
        }
    }
}