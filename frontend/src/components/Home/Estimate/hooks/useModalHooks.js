import { useEffect, useCallback } from "react";

export function usePartModal(show, settings, setNewPart) {
  const clearFields = useCallback(() => {
    setNewPart({
      description: "",
      partNumber: "",
      quantity: 1,
      netPrice: 1,
      listPrice: 1,
      extendedPrice: 1,
      applyPartTax: settings?.partTaxByDefault || false
    });
  }, [settings, setNewPart]);

  useEffect(() => {
    if (show) clearFields();
  }, [show, clearFields]);

  return clearFields;
}

export function useLaborModal(show, settings, setNewLabor) {
  const clearFields = useCallback(() => {
    setNewLabor({
      description: "",
      duration: 1,
      laborRate: settings?.defaultHourlyRate || 1,
      extendedPrice: 1,
      applyLaborTax: settings?.laborTaxByDefault || false
    });
  }, [settings, setNewLabor]);

  useEffect(() => {
    if (show) clearFields();
  }, [show, clearFields]);

  return clearFields;
}

export function useFlatFeeModal(show, setNewFlatFee) {
  const clearFields = useCallback(() => {
    setNewFlatFee({
      description: "",
      flatFeePrice: 1,
      extendedPrice: 1
    });
  }, [setNewFlatFee]);

  useEffect(() => {
    if (show) clearFields();
  }, [show, clearFields]);

  return clearFields;
}
