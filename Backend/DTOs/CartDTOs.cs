namespace CosmeticsShop.DTOs
{
    public class AddToCartDTO
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
    }

    public class CartItemResponseDTO
    {
        public int Id { get; set; }
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class CartResponseDTO
    {
        public int Id { get; set; }
        public List<CartItemResponseDTO> Items { get; set; } = new();
        public decimal TotalAmount { get; set; }
    }
}