using Mechanical_workshop.Dtos;

public class EstimateWithAccountReceivableDto
{
    // Representa la información completa del Estimate.
    public EstimateFullDto Estimate { get; set; }
    // Información de la cuenta por cobrar asociada (puede ser null).
    public AccountReceivableResponseDto? AccountReceivable { get; set; }

    // Propiedad calculada: true si la cuenta existe y su estado es "Paid".
    public bool IsPaid => AccountReceivable != null &&
                           (AccountReceivable.Status?.ToLower() == "paid");

    // Propiedad calculada: true si la cuenta existe y no está pagada.
    public bool HasPendingPayment => AccountReceivable != null &&
                                     (AccountReceivable.Status?.ToLower() != "paid");
}
