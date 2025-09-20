import { useEffect, useCallback } from "react";

/**
 * Hook to clear part modal fields when shown (only if not editing)
 */
export function usePartModal(show, settings, setNewPart, isEditingItem) {
  const clearFields = useCallback(() => {
    setNewPart({
      description: "",
      partNumber: "",
      quantity: null,
      netPrice: null,
      listPrice: null,
      extendedPrice: null,
      applyPartTax: settings?.partTaxByDefault || false,
    });
  }, [settings, setNewPart]);

  useEffect(() => {
    if (show && !isEditingItem) clearFields();
  }, [show, clearFields, isEditingItem]);

  return clearFields;
}

/**
 * Hook to clear labor modal fields when shown (only if not editing)
 */
export function useLaborModal(show, settings, setNewLabor, isEditingItem) {
  const clearFields = useCallback(() => {
    setNewLabor({
      description: "",
      duration: null,
      laborRate: settings?.defaultHourlyRate || null,
      extendedPrice: null,
      applyLaborTax: settings?.laborTaxByDefault || false,
    });
  }, [settings, setNewLabor]);

  useEffect(() => {
    if (show && !isEditingItem) clearFields();
  }, [show, clearFields, isEditingItem]);

  return clearFields;
}

/**
 * Hook to clear flat fee modal fields when shown (only if not editing)
 */
export function useFlatFeeModal(show, setNewFlatFee, isEditingItem) {
  const clearFields = useCallback(() => {
    console.log('useFlatFeeModal clearFields called');
    setNewFlatFee({
      description: "",
      flatFeePrice: null,
      extendedPrice: null,
    });
  }, [setNewFlatFee]);

  useEffect(() => {
    console.log('useFlatFeeModal useEffect - show:', show, 'isEditingItem:', isEditingItem);
    if (show && !isEditingItem) {
      console.log('Clearing flat fee fields because not editing');
      clearFields();
    } else if (show && isEditingItem) {
      console.log('NOT clearing flat fee fields because editing mode');
    }
  }, [show, clearFields, isEditingItem]);

  return clearFields;
}
