import { useEffect, useCallback } from "react";

/**
 * Hook to clear part modal fields when shown
 */
export function usePartModal(show, settings, setNewPart) {
  const clearFields = useCallback(() => {
    setNewPart({
      description: "",
      partNumber: "",
      quantity: 1.0,
      netPrice: 1.0,
      listPrice: 1.0,
      extendedPrice: 1.0,
      applyPartTax: settings?.partTaxByDefault || false,
    });
  }, [settings, setNewPart]);

  useEffect(() => {
    if (show) clearFields();
  }, [show, clearFields]);

  return clearFields;
}

/**
 * Hook to clear labor modal fields when shown
 */
export function useLaborModal(show, settings, setNewLabor) {
  const clearFields = useCallback(() => {
    setNewLabor({
      description: "",
      duration: 0.25,
      laborRate: settings?.defaultHourlyRate || 1.0,
      extendedPrice: 1.0,
      applyLaborTax: settings?.laborTaxByDefault || false,
    });
  }, [settings, setNewLabor]);

  useEffect(() => {
    if (show) clearFields();
  }, [show, clearFields]);

  return clearFields;
}

/**
 * Hook to clear flat fee modal fields when shown
 */
export function useFlatFeeModal(show, setNewFlatFee) {
  const clearFields = useCallback(() => {
    setNewFlatFee({
      description: "",
      flatFeePrice: 1.0,
      extendedPrice: 1.0,
    });
  }, [setNewFlatFee]);

  useEffect(() => {
    if (show) clearFields();
  }, [show, clearFields]);

  return clearFields;
}
