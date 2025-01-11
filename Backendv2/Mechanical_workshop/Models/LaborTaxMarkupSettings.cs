using System.ComponentModel.DataAnnotations;

namespace Mechanical_workshop.Models
{
    public class PartLaborSettings
    {
        [Key]
        public int Id { get; set; }

        [Range(0, double.MaxValue)]
        public decimal HourlyRate1 { get; set; }

        [Range(0, double.MaxValue)]
        public decimal HourlyRate2 { get; set; }

        [Range(0, double.MaxValue)]
        public decimal HourlyRate3 { get; set; }

        [Range(0, double.MaxValue)]
        public decimal DefaultHourlyRate { get; set; }

        [Range(0, double.MaxValue)]
        public decimal PartTaxRate { get; set; }

        public bool PartTaxByDefault { get; set; }

        [Range(0, double.MaxValue)]
        public decimal LaborTaxRate { get; set; }

        public bool LaborTaxByDefault { get; set; }

        [Range(0, double.MaxValue)]
        public decimal PartMarkup { get; set; }
    }
}
