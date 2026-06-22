namespace CosmeticsShop.DTOs
{
    public class CreateOrderDTO
    {
        public string? CouponCode { get; set; }
    }

    public class OrderItemResponseDTO
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class OrderResponseDTO
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public string? CouponCode { get; set; }
        public string? StripePaymentId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerEmail { get; set; } = string.Empty;
        public List<OrderItemResponseDTO> Items { get; set; } = new();
    }
}