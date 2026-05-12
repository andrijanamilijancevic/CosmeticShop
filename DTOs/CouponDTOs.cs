namespace CosmeticsShop.DTOs
{
    public class CreateCouponDTO
    {
        public string Code { get; set; } = string.Empty;
        public decimal DiscountPercent { get; set; }
        public DateTime ExpiresAt { get; set; }
    }

    public class CouponResponseDTO
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public decimal DiscountPercent { get; set; }
        public bool IsActive { get; set; }
        public DateTime ExpiresAt { get; set; }
    }
}