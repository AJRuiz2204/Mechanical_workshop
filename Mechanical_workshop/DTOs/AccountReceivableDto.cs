// DTOs/AccountReceivableDto.cs
using System.ComponentModel.DataAnnotations;

public class AccountReceivableCreateDto
{
    public int EstimateId { get; set; }
}

public class AccountReceivableUpdateDto
{
    public string Status { get; set; }
}

public class AccountReceivableResponseDto
{
    public int Id { get; set; }
    public decimal OriginalAmount { get; set; }
    public decimal Balance { get; set; }
    public string Status { get; set; }
    public DateTime CreatedDate { get; set; }
    public DateTime? CompletedDate { get; set; }
    public CustomerShortInfoDto Customer { get; set; }
    public VehicleInfoDto Vehicle { get; set; }
    public EstimateInfoDto Estimate { get; set; }
    public List<PaymentResponseDto> Payments { get; set; }
}

// DTOs/PaymentDto.cs
public class PaymentCreateDto
{
    [Required]
    [Range(0.01, double.MaxValue)]
    public decimal Amount { get; set; }
    
    [Required]
    public required string Method { get; set; }
    
    public required string TransactionReference { get; set; }
    public required string Notes { get; set; }
    
    [Required]
    public int AccountReceivableId { get; set; }
}

public class PaymentUpdateDto
{
    public required string TransactionReference { get; set; }
    public required string Notes { get; set; }
}

public class PaymentResponseDto
{
    public int Id { get; set; }
    public decimal Amount { get; set; }
    public DateTime PaymentDate { get; set; }
    public string? Method { get; set; }
    public string? TransactionReference { get; set; }
    public string? Notes { get; set; }

    public CustomerShortInfoDto? Customer { get; set; }
    public VehicleInfoDto? Vehicle { get; set; }
    public decimal RemainingBalance { get; set; }
    public decimal InitialBalance { get; set; }
}



// DTOs/SupportingDtos.cs
public class CustomerShortInfoDto
{
    public int Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string PrimaryPhone { get; set; }
}

public class VehicleInfoDto
{
    public int Id { get; set; }
    public string Make { get; set; }
    public string Model { get; set; }
    public string Year { get; set; }
    public string VIN { get; set; }
}

public class EstimateInfoDto
{
    public int Id { get; set; }
    public DateTime Date { get; set; }
    public decimal Total { get; set; }
}