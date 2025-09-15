import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  createEstimate,
  getEstimateById,
  updateEstimate,
  getVehicleDiagnostics,
  getEstimatesWithAccounts,
} from "../../../services/EstimateService";
import { getSettingsById } from "../../../services/laborTaxMarkupSettingsService";
import {
  Form,
  Input,
  Select,
  Button,
  Table,
  Row,
  Col,
  Modal,
  Alert,
  Spin,
  Card,
  Descriptions,
  notification,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import EditableCell from "./Editcell/EditableCell";
import PartModal from "./Modals/PartModal";
import LaborModal from "./Modals/LaborModal";
import FlatFeeModal from "./Modals/FlatFeeModal";
import ConfirmationModal from "./Modals/ConfirmationModal";

const { Option } = Select;
const { Column } = Table;

const Estimate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);
  const [form] = Form.useForm();

  const [vehicleDiagnosticOptions, setVehicleDiagnosticOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [owner, setOwner] = useState(null);
  const [diagnostic, setDiagnostic] = useState(null);
  const [extendedDiagnostic, setExtendedDiagnostic] = useState("");
  const [mileage, setMileage] = useState(0);

  const [isLoading, setIsLoading] = useState(true);
  const [parts, setParts] = useState([]);
  const [labors, setLabors] = useState([]);
  const [flatFees, setFlatFees] = useState([]);
  const [customerNote, setCustomerNote] = useState("");
  const [authorizationStatus, setAuthorizationStatus] = useState("Pending");
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [settings, setSettings] = useState(null);
  const [noTax, setNoTax] = useState(false);
  const [saving, setSaving] = useState(false);

  const [showTaxSettingsModal, setShowTaxSettingsModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);
  const [showLaborModal, setShowLaborModal] = useState(false);
  const [showFlatFeeModal, setShowFlatFeeModal] = useState(false);
  
  // Confirmation modal states
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [validationResult, setValidationResult] = useState({
    isValid: false,
    errors: [],
    warnings: [],
    summary: {}
  });

  useEffect(() => {
    console.log('showFlatFeeModal state changed to:', showFlatFeeModal);
  }, [showFlatFeeModal]);

  // Edit mode states
  const [editingItemType, setEditingItemType] = useState(null); // 'PART', 'LABOR', 'FLATFEE'
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [isEditingItem, setIsEditingItem] = useState(false);

  const [newPart, setNewPart] = useState({
    description: "",
    partNumber: "",
    quantity: 1.0,
    netPrice: 0.0,
    listPrice: 0.0,
    extendedPrice: 0.0,
    applyPartTax: false,
  });
  const [newLabor, setNewLabor] = useState({
    description: "",
    duration: 0.25,
    laborRate: 0.0,
    extendedPrice: 0.0,
    applyLaborTax: false,
  });
  const [newFlatFee, setNewFlatFee] = useState({
    description: "",
    flatFeePrice: 0.0,
    extendedPrice: 0.0,
  });
  const [isAddingPart, setIsAddingPart] = useState(false);

  // Helper functions for messages
  const showSuccessMessage = (message, title = "Success") => {
    notification.success({
      message: title,
      description: message,
      placement: 'topRight',
      duration: 4.5,
    });
  };

  const showErrorMessage = (message, title = "Error") => {
    notification.error({
      message: title,
      description: message,
      placement: 'topRight',
      duration: 4.5,
    });
  };

  // Validation function for confirmation modal
  const validateEstimateData = () => {
    const errors = [];
    const warnings = [];

    // Helper function to safely convert and round numbers
    const safeParseFloat = (value, decimals = 2) => {
      const num = parseFloat(value) || 0;
      if (isNaN(num) || !isFinite(num)) return 0;
      return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    };

    // Check if vehicle is selected (for non-edit mode)
    if (!isEditMode && (!selectedOption || selectedOption === "")) {
      errors.push("You must select a vehicle.");
    }

    // Check if at least one item is added
    if (parts.length === 0 && labors.length === 0 && flatFees.length === 0) {
      errors.push("You must add at least one item to the estimate (part, labor, or flat fee).");
    }

    // Check for duplicate part numbers
    const nonEmptyPartNumbers = parts
      .map((p) => p.partNumber)
      .filter((partNum) => partNum && partNum.trim() !== "");
    const hasDuplicates = nonEmptyPartNumbers.some(
      (item, idx) => nonEmptyPartNumbers.indexOf(item) !== idx
    );
    if (hasDuplicates) {
      errors.push("There are duplicate part numbers in the estimate.");
    }

    // Check customer note
    if (!customerNote.trim()) {
      errors.push("The 'Description of labor or services' field is required.");
    }

    // Validate all parts
    parts.forEach((part, i) => {
      if (!part.description?.trim()) {
        errors.push(`Part ${i + 1}: Description is required.`);
      }
      if (safeParseFloat(part.quantity) <= 0) {
        errors.push(`Part ${i + 1}: Quantity must be greater than 0.`);
      }
      if (safeParseFloat(part.netPrice) < 0 || safeParseFloat(part.listPrice) < 0) {
        errors.push(`Part ${i + 1}: Prices cannot be negative.`);
      }
    });

    // Validate all labors
    labors.forEach((labor, i) => {
      if (!labor.description?.trim()) {
        errors.push(`Labor ${i + 1}: Description is required.`);
      }
      if (safeParseFloat(labor.duration) <= 0) {
        errors.push(`Labor ${i + 1}: Duration must be greater than 0.`);
      }
      if (safeParseFloat(labor.laborRate) < 0) {
        errors.push(`Labor ${i + 1}: Labor rate cannot be negative.`);
      }
    });

    // Validate all flat fees
    flatFees.forEach((fee, i) => {
      if (!fee.description?.trim()) {
        errors.push(`Flat Fee ${i + 1}: Description is required.`);
      }
      if (safeParseFloat(fee.flatFeePrice) < 0) {
        errors.push(`Flat Fee ${i + 1}: Price cannot be negative.`);
      }
    });

    // Generate warnings
    if (parts.length === 0) {
      warnings.push("No parts have been added to the estimate.");
    }
    if (labors.length === 0) {
      warnings.push("No labors have been added to the estimate.");
    }
    if (total === 0) {
      warnings.push("The estimate total is $0.00.");
    }
    if (authorizationStatus === "Pending") {
      warnings.push("The authorization status is pending.");
    }

    // Generate summary
    const summary = {
      vehicleInfo: selectedVehicle ? 
        `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model} - ${selectedVehicle.vin}` :
        "Not selected",
      ownerInfo: owner ? 
        `${owner.name} ${owner.lastName} - ${owner.email}` :
        "Not available",
      authorizationStatus: authorizationStatus,
      totalItems: parts.length + labors.length + flatFees.length,
      partsCount: parts.length,
      laborsCount: labors.length,
      flatFeesCount: flatFees.length,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      customerNote: customerNote.trim() || "No description",
    };

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      summary
    };
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const cfg = await getSettingsById(1);
        setSettings(cfg);

        // Get existing estimates to filter out diagnostics that already have estimates
        const existingEstimates = await getEstimatesWithAccounts();
        const estimatesByDiagnosticId = new Set();
        existingEstimates.forEach(estimate => {
          if (estimate.estimate.technicianDiagnosticID) {
            estimatesByDiagnosticId.add(estimate.estimate.technicianDiagnosticID);
          }
        });

        const vDiagnostics = await getVehicleDiagnostics();
        const options = [];
        vDiagnostics.forEach((vd) => {
          if (vd.diagnostics && vd.diagnostics.length > 0) {
            vd.diagnostics.forEach((diag) => {
              const validTechs = diag.technicianDiagnostics.filter(
                (td) =>
                  td.extendedDiagnostic && 
                  td.extendedDiagnostic.trim() !== "" &&
                  !estimatesByDiagnosticId.has(td.id) // Filter out diagnostics that already have estimates
              );
              if (validTechs.length > 0) {
                options.push({
                  vehicle: vd.vehicle,
                  owner: vd.owner,
                  diagnostic: diag,
                  technicianDiagnostics: validTechs,
                });
              }
            });
          }
        });
        setVehicleDiagnosticOptions(options);

        if (isEditMode) {
          const estimateData = await getEstimateById(id);

          if (!estimateData) {
            showErrorMessage("Estimate not found.");
            return;
          }

          setSelectedVehicle(estimateData.vehicle || null);
          setOwner(estimateData.owner || null);
          setDiagnostic(estimateData.technicianDiagnostic || null);
          setExtendedDiagnostic(
            estimateData.technicianDiagnostic?.extendedDiagnostic ||
              estimateData.extendedDiagnostic ||
              ""
          );
          setMileage(
            estimateData.technicianDiagnostic?.mileage ||
              estimateData.mileage ||
              0
          );

          setCustomerNote(estimateData.customerNote ?? "");
          setSubtotal(estimateData.subtotal ?? 0);
          setTax(estimateData.tax ?? 0);
          setTotal(estimateData.total ?? 0);
          setAuthorizationStatus(estimateData.authorizationStatus ?? "Pending");

          // Set form fields for edit mode
          form.setFieldsValue({
            authorizationStatus: estimateData.authorizationStatus ?? "Pending"
          });

          setParts(
            (estimateData.parts || []).map((part) => ({
              ...part,
              applyPartTax: part.taxable,
            }))
          );
          setLabors(
            (estimateData.labors || []).map((labor) => ({
              ...labor,
              applyLaborTax: labor.taxable,
            }))
          );
          setFlatFees(estimateData.flatFees || []);
        } else {
          // Initialize form fields for create mode
          form.setFieldsValue({
            vehicleDiagnosticSelect: undefined,
            authorizationStatus: "Pending"
          });
        }
      } catch (err) {
        showErrorMessage("Error loading data: " + (err.message || "Unknown error."));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isEditMode, id, form]);

  useEffect(() => {
    setNoTax(owner?.noTax || false);
  }, [owner]);

  useEffect(() => {
    if (!settings) return;

    let partsTotal = 0;
    let taxParts = 0;
    let laborTotal = 0;
    let taxLabors = 0;
    let othersTotal = 0;

    parts.forEach((part) => {
      const partExt = parseFloat(part.extendedPrice) || 0;
      partsTotal += partExt;
      if (part.applyPartTax) {
        taxParts += partExt * (parseFloat(settings.partTaxRate) / 100);
      }
    });

    labors.forEach((labor) => {
      const laborExt = parseFloat(labor.extendedPrice) || 0;
      laborTotal += laborExt;
      if (labor.applyLaborTax) {
        taxLabors += laborExt * (parseFloat(settings.laborTaxRate) / 100);
      }
    });

    flatFees.forEach((fee) => {
      othersTotal += parseFloat(fee.extendedPrice) || 0;
    });

    const currentSubtotal = partsTotal + laborTotal + othersTotal;
    const currentTax = taxParts + taxLabors;
    const totalCalc = currentSubtotal + currentTax;

    setSubtotal(currentSubtotal);
    setTax(currentTax);
    setTotal(totalCalc);
  }, [parts, labors, flatFees, settings]);

  const handleOptionChange = (value) => {
    const optionIndex = value;

    if (optionIndex === null || optionIndex === undefined) {
      setSelectedOption(null);
      setSelectedVehicle(null);
      setOwner(null);
      setDiagnostic(null);
      setExtendedDiagnostic("");
      setMileage(0);
      return;
    }

    // Clear any previous form validation errors
    form.setFields([
      {
        name: 'vehicleDiagnosticSelect',
        errors: [],
      },
    ]);

    const selected = vehicleDiagnosticOptions[optionIndex];
    const selectedTD = selected.technicianDiagnostics[0];

    setSelectedOption(selected);
    setSelectedVehicle(selected.vehicle);
    setOwner(selected.owner);
    setDiagnostic(selected.diagnostic);
    setExtendedDiagnostic(selectedTD.extendedDiagnostic || "");
    setMileage(selectedTD.mileage || 0);
  };

  const handleShowTaxSettingsModal = () => setShowTaxSettingsModal(true);
  const handleCloseTaxSettingsModal = () => setShowTaxSettingsModal(false);

  const handleShowPartModal = () => {
    const defaultTax = owner?.noTax
      ? false
      : settings?.partTaxByDefault ?? false;
    setNewPart({
      description: "",
      partNumber: "",
      quantity: 1.0,
      netPrice: 0.0,
      listPrice: 0.0,
      extendedPrice: 0.0,
      applyPartTax: defaultTax,
    });
    setShowPartModal(true);
  };

  const handleShowLaborModal = () => {
    const defaultTax = owner?.noTax
      ? false
      : settings?.laborTaxByDefault ?? false;
    setNewLabor({
      description: "",
      duration: 0.25,
      laborRate: settings?.defaultHourlyRate ?? 0.0,
      extendedPrice: 0.0,
      applyLaborTax: defaultTax,
    });
    setShowLaborModal(true);
  };

  const handleShowFlatFeeModal = () => {
    setNewFlatFee({
      description: "",
      flatFeePrice: 1.0,
      extendedPrice: 1.0,
    });
    setShowFlatFeeModal(true);
  };

  const addPart = async () => {
    if (isAddingPart) return;
    if (
      newPart.quantity === "" ||
      newPart.netPrice === "" ||
      newPart.listPrice === ""
    ) {
      showErrorMessage("Quantity, Net Price and List Price are required.");
      return;
    }
    try {
      // Only check for duplicates if partNumber is provided and not empty
      if (newPart.partNumber && newPart.partNumber.trim()) {
        const duplicate = parts.find(
          (part) => part.partNumber && part.partNumber === newPart.partNumber
        );
        if (duplicate) {
          showErrorMessage(
            `The part with Part Number ${newPart.partNumber} already exists in this estimate.`
          );
          return;
        }
      }
      if (!newPart.description) {
        showErrorMessage("Description is required.");
        return;
      }
      setParts([...parts, { ...newPart }]);
      setNewPart({
        description: "",
        partNumber: "",
        quantity: 1.0,
        netPrice: 0.0,
        listPrice: 0.0,
        extendedPrice: 0.0,
        applyPartTax: noTax ? false : true,
      });
      showSuccessMessage("Part added successfully.");
      setShowPartModal(false);
    } catch {
      showErrorMessage("Error adding the part.");
    } finally {
      setIsAddingPart(false);
    }
  };

  const addLabor = () => {
    if (
      !newLabor.description ||
      newLabor.duration === "" ||
      parseFloat(newLabor.duration) <= 0
    ) {
      showErrorMessage("Please fill out all labor fields correctly.");
      return;
    }
    const dur = parseFloat(newLabor.duration) || 0;
    const rate = parseFloat(newLabor.laborRate) || 0;
    const ext = dur * rate;
    const newItem = {
      ...newLabor,
      duration: dur,
      laborRate: rate,
      extendedPrice: ext,
      applyLaborTax: newLabor.applyLaborTax,
    };
    setLabors([...labors, newItem]);
    showSuccessMessage("Labor added successfully.");
    setShowLaborModal(false);
  };

  const addFlatFee = () => {
    if (
      !newFlatFee.description ||
      newFlatFee.flatFeePrice === "" ||
      parseFloat(newFlatFee.flatFeePrice) <= 0
    ) {
      showErrorMessage("Please fill out all flat fee fields correctly.");
      return;
    }
    const price = parseFloat(newFlatFee.flatFeePrice) || 0;
    const newItem = { ...newFlatFee, extendedPrice: price };
    setFlatFees([...flatFees, newItem]);
    showSuccessMessage("Flat fee added successfully.");
    setShowFlatFeeModal(false);
  };

  // Edit item functions - Allow editing parts, labor, and flat fees directly from the table
  const handleEditItem = (type, index) => {
    console.log(`Editing ${type} at index ${index}`);
    
    // Set editing state first
    setEditingItemType(type);
    setEditingItemIndex(index);
    setIsEditingItem(true);
    
    if (type === "PART") {
      const part = parts[index];
      console.log('Part to edit:', part);
      setNewPart({ ...part });
      // Use setTimeout to ensure state is set before opening modal
      setTimeout(() => setShowPartModal(true), 0);
    } else if (type === "LABOR") {
      const labor = labors[index];
      console.log('Labor to edit:', labor);
      setNewLabor({ ...labor });
      // Use setTimeout to ensure state is set before opening modal
      setTimeout(() => setShowLaborModal(true), 0);
    } else if (type === "FLAT FEE") {
      const flatFee = flatFees[index];
      console.log('FlatFee to edit:', flatFee);
      console.log('Before setNewFlatFee - current newFlatFee:', newFlatFee);
      setNewFlatFee({ ...flatFee });
      console.log('After setNewFlatFee - showFlatFeeModal before setTimeout:', showFlatFeeModal);
      // Use setTimeout to ensure state is set before opening modal
      setTimeout(() => {
        console.log('Setting showFlatFeeModal to true');
        setShowFlatFeeModal(true);
      }, 0);
    }
  };

  const updateEditedItem = () => {
    if (editingItemType === "PART") {
      updatePartAtIndex(editingItemIndex, newPart);
    } else if (editingItemType === "LABOR") {
      updateLaborAtIndex(editingItemIndex, newLabor);
    } else if (editingItemType === "FLAT FEE") {
      updateFlatFeeAtIndex(editingItemIndex, newFlatFee);
    }
    // resetEditState is now called by individual update functions
  };

  const updatePartAtIndex = (index, updatedPart) => {
    if (!updatedPart.description) {
      showErrorMessage("Description is required.");
      return;
    }
    // Check for duplicates if partNumber is provided and not empty
    if (updatedPart.partNumber && updatedPart.partNumber.trim()) {
      const duplicate = parts.find(
        (part, idx) => idx !== index && part.partNumber && part.partNumber === updatedPart.partNumber
      );
      if (duplicate) {
        showErrorMessage(`The part with Part Number ${updatedPart.partNumber} already exists in this estimate.`);
        return;
      }
    }
    
    const updatedParts = [...parts];
    updatedParts[index] = { ...updatedPart };
    setParts(updatedParts);
    showSuccessMessage("Part updated successfully.");
    resetEditState(); // Reset edit state after successful update
  };

  const updateLaborAtIndex = (index, updatedLabor) => {
    if (
      !updatedLabor.description ||
      updatedLabor.duration === "" ||
      parseFloat(updatedLabor.duration) <= 0
    ) {
      showErrorMessage("Please fill out all labor fields correctly.");
      return;
    }
    const dur = parseFloat(updatedLabor.duration) || 0;
    const rate = parseFloat(updatedLabor.laborRate) || 0;
    const ext = dur * rate;
    const updatedItem = {
      ...updatedLabor,
      duration: dur,
      laborRate: rate,
      extendedPrice: ext,
    };
    
    const updatedLabors = [...labors];
    updatedLabors[index] = updatedItem;
    setLabors(updatedLabors);
    showSuccessMessage("Labor updated successfully.");
    resetEditState(); // Reset edit state after successful update
  };

  const updateFlatFeeAtIndex = (index, updatedFlatFee) => {
    if (
      !updatedFlatFee.description ||
      updatedFlatFee.flatFeePrice === "" ||
      parseFloat(updatedFlatFee.flatFeePrice) <= 0
    ) {
      showErrorMessage("Please fill out all flat fee fields correctly.");
      return;
    }
    const price = parseFloat(updatedFlatFee.flatFeePrice) || 0;
    const updatedItem = { ...updatedFlatFee, extendedPrice: price };
    
    const updatedFlatFees = [...flatFees];
    updatedFlatFees[index] = updatedItem;
    setFlatFees(updatedFlatFees);
    showSuccessMessage("Flat fee updated successfully.");
    resetEditState(); // Reset edit state after successful update
  };

  const resetEditState = () => {
    setEditingItemType(null);
    setEditingItemIndex(null);
    setIsEditingItem(false);
  };

  const handleCloseModal = (modalType) => {
    console.log('handleCloseModal called with modalType:', modalType, 'isEditingItem:', isEditingItem);
    
    if (modalType === "part") {
      setShowPartModal(false);
      if (!isEditingItem) {
        setNewPart({
          description: "",
          partNumber: "",
          quantity: 1.0,
          netPrice: 0.0,
          listPrice: 0.0,
          extendedPrice: 0.0,
          applyPartTax: noTax ? false : true,
        });
      }
    } else if (modalType === "labor") {
      setShowLaborModal(false);
      if (!isEditingItem) {
        setNewLabor({
          description: "",
          duration: 0.25,
          laborRate: settings?.defaultHourlyRate || 1.0,
          extendedPrice: 1.0,
          applyLaborTax: settings?.laborTaxByDefault || false,
        });
      }
    } else if (modalType === "flatfee") {
      setShowFlatFeeModal(false);
      if (!isEditingItem) {
        setNewFlatFee({
          description: "",
          flatFeePrice: 1.0,
          extendedPrice: 1.0,
        });
      }
    }
    resetEditState();
  };

  const removeItem = (type, idx) => {
    if (type === "PART") {
      setParts((prev) => {
        const arr = [...prev];
        arr.splice(idx, 1);
        return arr;
      });
    } else if (type === "LABOR") {
      setLabors((prev) => {
        const arr = [...prev];
        arr.splice(idx, 1);
        return arr;
      });
    } else if (type === "FLAT FEE") {
      setFlatFees((prev) => {
        const arr = [...prev];
        arr.splice(idx, 1);
        return arr;
      });
    }
  };

  const updatePartField = (idx, field, value) => {
    const arr = [...parts];
    arr[idx] = { ...arr[idx], [field]: value };
    if (field === "quantity" || field === "listPrice") {
      const qty = parseFloat(arr[idx].quantity) || 0;
      const lp = parseFloat(arr[idx].listPrice) || 0;
      arr[idx].extendedPrice = qty * lp;
    }
    setParts(arr);
  };
  const updateLaborField = (idx, field, value) => {
    const arr = [...labors];
    arr[idx] = { ...arr[idx], [field]: value };
    if (field === "duration" || field === "laborRate") {
      const dur = parseFloat(arr[idx].duration) || 0;
      const rate = parseFloat(arr[idx].laborRate) || 0;
      arr[idx].extendedPrice = dur * rate;
    }
    setLabors(arr);
  };
  const updateFlatFeeField = (idx, field, value) => {
    const arr = [...flatFees];
    arr[idx] = { ...arr[idx], [field]: value };
    if (field === "flatFeePrice") {
      arr[idx].extendedPrice = parseFloat(arr[idx].flatFeePrice) || 0;
    }
    setFlatFees(arr);
  };

  const handleSave = async () => {
    // Validate and show confirmation modal
    const validation = validateEstimateData();
    setValidationResult(validation);
    setShowConfirmationModal(true);
  };

  const processEstimate = async () => {
    // Helper function to safely convert and round numbers
    const safeParseFloat = (value, decimals = 2) => {
      const num = parseFloat(value) || 0;
      if (isNaN(num) || !isFinite(num)) return 0;
      return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
    };

    const safeParseInt = (value) => {
      const num = parseInt(value, 10);
      if (isNaN(num) || !isFinite(num)) return 0;
      return Math.max(0, num);
    };

    const dto = {
      VehicleID: !isEditMode
        ? safeParseInt(selectedOption.vehicle.id)
        : safeParseInt(selectedVehicle.id),
      CustomerNote: customerNote.trim(),
      Subtotal: safeParseFloat(subtotal),
      Tax: safeParseFloat(tax),
      Total: safeParseFloat(total),
      Mileage: safeParseInt(mileage),
      ExtendedDiagnostic: extendedDiagnostic || "",
      AuthorizationStatus: authorizationStatus || "Pending",
      TechnicianDiagnostic: extendedDiagnostic
        ? {
            DiagnosticId: safeParseInt(diagnostic?.diagnosticId),
            Mileage: safeParseInt(diagnostic?.mileage || mileage),
            ExtendedDiagnostic: extendedDiagnostic,
          }
        : null,
      Parts: parts.map((p) => ({
        Description: (p.description || "").trim(),
        PartNumber: (p.partNumber || "").trim(),
        Quantity: safeParseFloat(p.quantity),
        NetPrice: safeParseFloat(p.netPrice),
        ListPrice: safeParseFloat(p.listPrice),
        ExtendedPrice: safeParseFloat(p.extendedPrice),
        Taxable: Boolean(p.applyPartTax),
      })),
      Labors: labors.map((l) => ({
        Description: (l.description || "").trim(),
        Duration: safeParseFloat(l.duration),
        LaborRate: safeParseFloat(l.laborRate),
        ExtendedPrice: safeParseFloat(l.extendedPrice),
        Taxable: Boolean(l.applyLaborTax),
      })),
      FlatFees: flatFees.map((f) => ({
        Description: (f.description || "").trim(),
        FlatFeePrice: safeParseFloat(f.flatFeePrice),
        ExtendedPrice: safeParseFloat(f.extendedPrice),
        Taxable: false,
      })),
    };

    try {
      setSaving(true);
      console.log("Sending estimate data:", dto);

      if (!isEditMode) {
        const created = await createEstimate(dto);
        console.log("Payload createEstimate:", created);
        showSuccessMessage(
          `Estimate created successfully with ID: ${created.ID}`,
          "Estimate Created"
        );
        setTimeout(() => navigate("/estimates"), 1000);
      } else {
        const updateDto = { ID: parseInt(id, 10), ...dto };
        const updated = await updateEstimate(id, updateDto);
        console.log("Payload updateEstimate:", updated);
        showSuccessMessage(
          `Estimate with ID ${updated.ID} updated successfully.`,
          "Estimate Updated"
        );
        setTimeout(() => navigate("/estimates"), 1000);
      }
    } catch (err) {
      console.error("Save estimate error:", err);

      // Extract detailed error message
      let errorMessage = "Error creating the estimate.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        errorMessage = Array.isArray(errors)
          ? errors.map((e) => `${e.Field}: ${e.Errors.join(", ")}`).join("; ")
          : JSON.stringify(errors);
      } else if (err.message) {
        errorMessage = err.message;
      }

      showErrorMessage(errorMessage, "Save Error");
    } finally {
      setSaving(false);
      setShowConfirmationModal(false);
    }
  };

  const handleConfirmSave = () => {
    processEstimate();
  };

  const handleCancelConfirmation = () => {
    setShowConfirmationModal(false);
  };

  const combinedItems = useMemo(() => {
    const partItems = parts.map((p, idx) => ({
      type: "Part",
      description: p.description,
      quantity: p.quantity,
      price: p.netPrice,
      listPrice: p.listPrice,
      extendedPrice: p.extendedPrice,
      taxable: p.applyPartTax,
      partNumber: p.partNumber,
      key: `Part-${idx}`,
      rowIndex: idx,
    }));
    const laborItems = labors.map((l, idx) => ({
      type: "Labor",
      description: l.description,
      quantity: l.duration,
      price: l.laborRate,
      listPrice: "",
      extendedPrice: l.extendedPrice,
      taxable: l.applyLaborTax,
      partNumber: "",
      key: `Labor-${idx}`,
      rowIndex: idx,
    }));
    const flatFeeItems = flatFees.map((f, idx) => ({
      type: "Flat Fee",
      description: f.description,
      quantity: "-",
      price: f.flatFeePrice,
      listPrice: "",
      extendedPrice: f.extendedPrice,
      taxable: false,
      partNumber: "",
      key: `FlatFee-${idx}`,
      rowIndex: idx,
    }));
    return [...partItems, ...laborItems, ...flatFeeItems];
  }, [parts, labors, flatFees]);

  if (isLoading) {
    return (
      <div
        style={{
          height: "80vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-4 border rounded mt-4 estimate-container">
      <h3>{isEditMode ? "Edit Estimate" : "Create Estimate"}</h3>

      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <Button onClick={handleShowTaxSettingsModal}>
          View Tax &amp; Markup Settings
        </Button>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        {!isEditMode && (
          <>
            <Row gutter={16}>
              <Col span={21}>
                <Form.Item
                  name="vehicleDiagnosticSelect"
                  label="Select Vehicle (only those with TechnicianDiagnostic)"
                  rules={[
                    { 
                      required: true, 
                      message: "Please select a vehicle."
                    }
                  ]}
                >
                  <Select
                    placeholder="-- Select Option --"
                    style={{ width: '100%' }}
                    onChange={(value) => {
                      handleOptionChange(value);
                      form.setFieldValue('vehicleDiagnosticSelect', value);
                    }}
                    value={form.getFieldValue('vehicleDiagnosticSelect')}
                    allowClear
                    showSearch
                    filterOption={(input, option) => {
                      const text = option.title || '';
                      return text.toLowerCase().includes(input.toLowerCase());
                    }}
                    dropdownStyle={{ maxHeight: 400 }}
                    optionLabelProp="title"
                  >
                    {vehicleDiagnosticOptions.map((opt, idx) => {
                      const vehicle = opt.vehicle;
                      const owner = opt.owner;
                      
                      // Build comprehensive display text
                      let displayText = `${vehicle.vin} - ${vehicle.make.trim()} ${vehicle.model} ${vehicle.year}`;
                      
                      // Add engine info if available
                      if (vehicle.engine && vehicle.engine.trim()) {
                        displayText += ` (${vehicle.engine})`;
                      }
                      
                      // Add plate and state if available
                      if (vehicle.plate && vehicle.plate.trim()) {
                        displayText += ` | Plate: ${vehicle.plate}`;
                        if (vehicle.state && vehicle.state.trim()) {
                          displayText += `, ${vehicle.state}`;
                        }
                      }
                      
                      // Add owner info
                      if (owner) {
                        displayText += ` | Owner: ${owner.name} ${owner.lastName}`;
                      }
                      
                      return (
                        <Option key={idx} value={idx} title={displayText}>
                          <div style={{ lineHeight: '1.4', fontSize: '14px' }}>
                            {vehicle.vin} - {vehicle.make.trim()} {vehicle.model} {vehicle.year}
                            {(vehicle.engine?.trim() || vehicle.plate?.trim() || owner) && ' | '}
                            {vehicle.engine && vehicle.engine.trim() && (
                              <span>Engine: {vehicle.engine} | </span>
                            )}
                            {vehicle.plate && vehicle.plate.trim() && (
                              <span>Plate: {vehicle.plate}</span>
                            )}
                            {vehicle.plate && vehicle.plate.trim() && vehicle.state && vehicle.state.trim() && (
                              <span>, {vehicle.state}</span>
                            )}
                            {vehicle.plate && vehicle.plate.trim() && owner && <span> | </span>}
                            {owner && (
                              <span>Owner: {owner.name} {owner.lastName}</span>
                            )}
                          </div>
                        </Option>
                      );
                    })}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={3}>
                <Form.Item
                  name="authorizationStatus"
                  label="Authorization Status"
                  initialValue="Pending"
                >
                  <Select
                    value={authorizationStatus}
                    onChange={setAuthorizationStatus}
                    style={{ width: '100%' }}
                  >
                    <Option value="Pending">Pending</Option>
                    <Option value="Approved">Approved</Option>
                    <Option value="Not Approved">Not Approved</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </>
        )}

        {/* Authorization Status field for edit mode */}
        {isEditMode && (
          <Row gutter={16}>
            <Col span={6}>
              <Form.Item
                name="authorizationStatus"
                label="Authorization Status"
              >
                <Select
                  value={authorizationStatus}
                  onChange={setAuthorizationStatus}
                  style={{ width: '100%' }}
                >
                  <Option value="Pending">Pending</Option>
                  <Option value="Approved">Approved</Option>
                  <Option value="Not Approved">Not Approved</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}

        {selectedVehicle && (
          <Row gutter={16}>
            <Col span={24}>
              <Card>
                <Descriptions column={3} bordered>
                  <Descriptions.Item label="VIN">
                    {selectedVehicle.vin}
                  </Descriptions.Item>
                  <Descriptions.Item label="Make">
                    {selectedVehicle.make}
                  </Descriptions.Item>
                  <Descriptions.Item label="Model">
                    {selectedVehicle.model}
                  </Descriptions.Item>
                  <Descriptions.Item label="Year">
                    {selectedVehicle.year}
                  </Descriptions.Item>
                  <Descriptions.Item label="Engine">
                    {selectedVehicle.engine}
                  </Descriptions.Item>
                  <Descriptions.Item label="Plate">
                    {selectedVehicle.plate}
                  </Descriptions.Item>
                  <Descriptions.Item label="State">
                    {selectedVehicle.state}
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    {selectedVehicle.status}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mileage">
                    {mileage} miles
                  </Descriptions.Item>
                  <Descriptions.Item label="Extended Diagnostic">
                    {extendedDiagnostic}
                  </Descriptions.Item>
                  {owner && (
                    <Descriptions.Item label="Owner">
                      {owner.name} {owner.lastName} - {owner.email}
                    </Descriptions.Item>
                  )}
                </Descriptions>
              </Card>
            </Col>
          </Row>
        )}

        <Form.Item label="Extended Diagnostic">
          <Input.TextArea
            rows={3}
            value={extendedDiagnostic}
            onChange={(e) => setExtendedDiagnostic(e.target.value)}
            readOnly
          />
        </Form.Item>

        <Row gutter={16} className="mb-3">
          <Col>
            <Button
              type="primary"
              onClick={handleShowPartModal}
              disabled={!selectedVehicle && !isEditMode}
            >
              Add Part
            </Button>{" "}
            <Button
              onClick={handleShowLaborModal}
              disabled={!selectedVehicle && !isEditMode}
            >
              Add Labor
            </Button>{" "}
            <Button
              type="dashed"
              onClick={handleShowFlatFeeModal}
              disabled={!selectedVehicle && !isEditMode}
            >
              Add Flat Fee
            </Button>
          </Col>
        </Row>

        <Table
          dataSource={combinedItems}
          pagination={false}
          rowKey="key"
          scroll={{ x: "max-content" }}
        >
          <Column title="TYPE" dataIndex="type" key="type" />
          <Column
            title="DESCRIPTION"
            dataIndex="description"
            key="description"
            render={(text, record) => (
              <EditableCell
                value={text}
                onChange={(v) => {
                  if (record.type === "Part")
                    updatePartField(record.rowIndex, "description", v);
                  else if (record.type === "Labor")
                    updateLaborField(record.rowIndex, "description", v);
                  else updateFlatFeeField(record.rowIndex, "description", v);
                }}
              />
            )}
          />
          <Column
            title="PART#"
            key="partOrHours"
            render={(_, record) =>
              record.type === "Part" ? (
                <EditableCell
                  value={record.partNumber}
                  onChange={(v) =>
                    updatePartField(record.rowIndex, "partNumber", v)
                  }
                />
              ) : record.type === "Labor" ? (
                <span>-</span>
              ) : (
                <span>-</span>
              )
            }
          />
          <Column
            title="QUANTITY"
            dataIndex="quantity"
            key="quantity"
            render={(val, record) =>
              record.type === "Part" ? (
                <EditableCell
                  type="number"
                  value={val}
                  onChange={(v) =>
                    updatePartField(record.rowIndex, "quantity", v)
                  }
                />
              ) : (
                <span>-</span>
              )
            }
          />
          <Column
            title="LIST PRICE"
            dataIndex="listPrice"
            key="listPrice"
            render={(val, record) =>
              record.type === "Part" ? (
                <EditableCell
                  type="number"
                  value={val}
                  onChange={(v) =>
                    updatePartField(record.rowIndex, "listPrice", v)
                  }
                />
              ) : (
                <span>-</span>
              )
            }
          />
          <Column
            title="EXTENDED PRICE"
            dataIndex="extendedPrice"
            key="extendedPrice"
            render={(val) =>
              val != null ? `$${parseFloat(val).toFixed(2)}` : null
            }
          />
          <Column
            title="TAX?"
            dataIndex="taxable"
            key="taxable"
            render={(checked, record) =>
              record.type !== "Flat Fee" ? (
                <Form.Item valuePropName="checked">
                  <Input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => {
                      const v = e.target.checked;
                      if (record.type === "Part")
                        updatePartField(record.rowIndex, "applyPartTax", v);
                      else
                        updateLaborField(record.rowIndex, "applyLaborTax", v);
                    }}
                  />
                </Form.Item>
              ) : (
                <span>No</span>
              )
            }
          />
          <Column
            title="ACTION"
            key="action"
            width={140}
            render={(_, record) => (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Button
                  type="primary"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={() =>
                    handleEditItem(record.type.toUpperCase(), record.rowIndex)
                  }
                  title="Edit item"
                >
                  Edit
                </Button>
                <Button
                  type="primary"
                  danger
                  size="small"
                  icon={<DeleteOutlined />}
                  onClick={() =>
                    removeItem(record.type.toUpperCase(), record.rowIndex)
                  }
                  title="Remove item"
                >
                  Remove
                </Button>
              </div>
            )}
          />
        </Table>

        <Form.Item label="Description of labor or services" required>
          <Input.TextArea
            rows={3}
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
          />
        </Form.Item>

        <Row justify="end" style={{ marginBottom: 16 }}>
          <Col>
            <div style={{ textAlign: "right" }}>
              <div>Subtotal: ${subtotal.toFixed(2)}</div>
              <div>Tax: ${tax.toFixed(2)}</div>
              <h5>Total: ${total.toFixed(2)}</h5>
            </div>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              disabled={isLoading}
            >
              {isEditMode ? "Update Estimate" : "Save"}
            </Button>{" "}
            <Button onClick={() => navigate("/estimates")}>Cancel</Button>
          </Col>
        </Row>
      </Form>

      <Modal
        title="Tax & Markup Settings"
        open={showTaxSettingsModal}
        onCancel={handleCloseTaxSettingsModal}
        footer={[
          <Button key="close" onClick={handleCloseTaxSettingsModal}>
            Close
          </Button>,
        ]}
      >
        {!settings ? (
          <Alert type="warning" message="No settings found." />
        ) : (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Hourly Rate 1">
              {settings.hourlyRate1}
            </Descriptions.Item>
            <Descriptions.Item label="Hourly Rate 2">
              {settings.hourlyRate2}
            </Descriptions.Item>
            <Descriptions.Item label="Hourly Rate 3">
              {settings.hourlyRate3}
            </Descriptions.Item>
            <Descriptions.Item label="Default Hourly Rate">
              {settings.defaultHourlyRate}
            </Descriptions.Item>
            <Descriptions.Item label="Part Tax Rate">
              {settings.partTaxRate}%
            </Descriptions.Item>
            <Descriptions.Item label="Part Tax By Default">
              {settings.partTaxByDefault ? "Yes" : "No"}
            </Descriptions.Item>
            <Descriptions.Item label="Labor Tax Rate">
              {settings.laborTaxRate}%
            </Descriptions.Item>
            <Descriptions.Item label="Labor Tax By Default">
              {settings.laborTaxByDefault ? "Yes" : "No"}
            </Descriptions.Item>
            <Descriptions.Item label="Part Markup">
              {settings.partMarkup}%
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <PartModal
        show={showPartModal}
        onHide={() => handleCloseModal("part")}
        newPart={newPart}
        setNewPart={setNewPart}
        addPart={addPart}
        noTax={noTax}
        settings={settings}
        isEditingItem={isEditingItem}
        updateEditedItem={updateEditedItem}
      />
      <LaborModal
        show={showLaborModal}
        onHide={() => handleCloseModal("labor")}
        newLabor={newLabor}
        setNewLabor={setNewLabor}
        addLabor={addLabor}
        noTax={noTax}
        settings={settings}
        isEditingItem={isEditingItem}
        updateEditedItem={updateEditedItem}
      />
      <FlatFeeModal
        show={showFlatFeeModal}
        onHide={() => handleCloseModal("flatfee")}
        newFlatFee={newFlatFee}
        setNewFlatFee={setNewFlatFee}
        addFlatFee={addFlatFee}
        isEditingItem={isEditingItem}
        updateEditedItem={updateEditedItem}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        show={showConfirmationModal}
        onConfirm={handleConfirmSave}
        onCancel={handleCancelConfirmation}
        validationResult={validationResult}
        isEditMode={isEditMode}
      />
    </div>
  );
};

export default Estimate;
