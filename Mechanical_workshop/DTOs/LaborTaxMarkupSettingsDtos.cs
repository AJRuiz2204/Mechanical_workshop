namespace Mechanical_workshop.DTOs
{
    public class LaborTaxMarkupSettingsReadDto
    {
        public int Id { get; set; }
        public decimal HourlyRate1 { get; set; }
        public decimal HourlyRate2 { get; set; }
        public decimal HourlyRate3 { get; set; }
        public decimal DefaultHourlyRate { get; set; }
        public decimal PartTaxRate { get; set; }
        public bool PartTaxByDefault { get; set; }
        public decimal LaborTaxRate { get; set; }
        public bool LaborTaxByDefault { get; set; }
        public decimal PartMarkup { get; set; }
    }

    public class LaborTaxMarkupSettingsCreateDto
    {
        public decimal HourlyRate1 { get; set; }
        public decimal HourlyRate2 { get; set; }
        public decimal HourlyRate3 { get; set; }
        public decimal DefaultHourlyRate { get; set; }
        public decimal PartTaxRate { get; set; }
        public bool PartTaxByDefault { get; set; }
        public decimal LaborTaxRate { get; set; }
        public bool LaborTaxByDefault { get; set; }
        public decimal PartMarkup { get; set; }
    }

    public class LaborTaxMarkupSettingsUpdateDto
    {
        public decimal HourlyRate1 { get; set; }
        public decimal HourlyRate2 { get; set; }
        public decimal HourlyRate3 { get; set; }
        public decimal DefaultHourlyRate { get; set; }
        public decimal PartTaxRate { get; set; }
        public bool PartTaxByDefault { get; set; }
        public decimal LaborTaxRate { get; set; }
        public bool LaborTaxByDefault { get; set; }
        public decimal PartMarkup { get; set; }
    }
}
