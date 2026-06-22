namespace CosmeticsShop.Models
{
    public class Coupon
    {
        public int Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public decimal DiscountPercent { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime ExpiresAt { get; set; }

    }
}
