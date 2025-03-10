namespace Mechanical_workshop.Dtos
{
    public class EstimateLineDto
    {
        public DateTime CreateTime { get; set; }
        public int EstimateId { get; set; }
        public string Vin { get; set; } = string.Empty;
        public int? Quantity { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal? NetPrice { get; set; }
        public decimal? ListPrice { get; set; }
        public decimal? PriceTo { get; set; }
        public decimal? Labor { get; set; }
        public decimal? ShopSupplies { get; set; }
    }
}
