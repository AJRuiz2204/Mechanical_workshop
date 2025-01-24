/* eslint-disable no-unused-vars */
import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import {
  Form,
  Button,
  Table,
  Row,
  Col,
  Modal,
  InputGroup,
  FormControl,
  Alert,
  Spinner,
  Container,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  createEstimate,
  getAllVehicles,
  getVehicleById,
  getEstimateById,
  updateEstimate,
  getDiagnosticByVehicleId,
} from "../../../services/EstimateService";
import { getSettingsById } from "../../../services/laborTaxMarkupSettingsService";
import { getWorkshopSettings } from "../../../services/workshopSettingsService";

/**
 * Component: Estimate
 *
 * Description:
 * Handles the creation and editing of estimates. Allows users to select vehicles,
 * add parts, labor, and flat fees, view calculated totals, and generate PDF versions of the estimates.
 * Operates in two modes:
 * - Create Mode: For creating new estimates.
 * - Edit Mode: For editing existing estimates based on the provided ID.
 */
const Estimate = () => {
  const { id } = useParams(); // Retrieve the estimate ID from URL parameters
  const navigate = useNavigate(); // Hook for navigation
  const isEditMode = Boolean(id); // Determine if the component is in edit mode

  // State variables for managing data and UI states
  const [isLoading, setIsLoading] = useState(true); // Indicates if data is loading
  const [vehicles, setVehicles] = useState([]); // List of all available vehicles
  const [selectedVehicleId, setSelectedVehicleId] = useState(""); // ID of the selected vehicle
  const [selectedVehicle, setSelectedVehicle] = useState(null); // Details of the selected vehicle
  const [owner, setOwner] = useState(null); // Owner information of the selected vehicle
  const [parts, setParts] = useState([]); // List of parts added to the estimate
  const [labors, setLabors] = useState([]); // List of labor entries added to the estimate
  const [flatFees, setFlatFees] = useState([]); // List of flat fees added to the estimate
  const [customerNote, setCustomerNote] = useState(""); // Note for the customer
  const [extendedDiagnostic, setExtendedDiagnostic] = useState(""); // Extended diagnostic information
  const [diagnostic, setDiagnostic] = useState(null); // Diagnostic details fetched for the vehicle
  const [authorizationStatus, setAuthorizationStatus] = useState("InReview"); // Authorization status of the estimate
  const [subtotal, setSubtotal] = useState(0); // Calculated subtotal
  const [tax, setTax] = useState(0); // Calculated tax
  const [total, setTotal] = useState(0); // Calculated total amount

  const [settings, setSettings] = useState(null); // Tax and labor markup settings
  const [noTax, setNoTax] = useState(false); // Indicates if tax should be applied

  const [workshopSettings, setWorkshopSettings] = useState(null); // Workshop-specific settings
  const [loadingWorkshop, setLoadingWorkshop] = useState(true); // Indicates if workshop settings are loading

  const [error, setError] = useState(null); // Error message state
  const [success, setSuccess] = useState(null); // Success message state
  const [saving, setSaving] = useState(false); // Indicates if the estimate is being saved

  // State variables to control the visibility of modals
  const [showTaxSettingsModal, setShowTaxSettingsModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);
  const [showLaborModal, setShowLaborModal] = useState(false);
  const [showFlatFeeModal, setShowFlatFeeModal] = useState(false);

  // State variables for new items being added
  const [newPart, setNewPart] = useState({
    description: "",
    partNumber: "",
    quantity: 1,
    netPrice: 0,
    listPrice: 0,
    extendedPrice: 0,
    applyPartTax: false,
  });
  const [newLabor, setNewLabor] = useState({
    description: "",
    duration: 0,
    laborRate: 0,
    extendedPrice: 0,
    applyLaborTax: false,
  });
  const [newFlatFee, setNewFlatFee] = useState({
    description: "",
    flatFeePrice: 0,
    extendedPrice: 0,
  });
  const [isAddingPart, setIsAddingPart] = useState(false); // Indicates if a part is being added

  /**
   * Effect to load necessary data on component mount and when in edit mode.
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch workshop settings
        const shopData = await getWorkshopSettings();
        setWorkshopSettings(shopData);

        // Fetch tax and labor markup settings
        const cfg = await getSettingsById(1);
        setSettings(cfg);

        // Fetch all vehicles
        const vList = await getAllVehicles();
        setVehicles(vList);

        // If in edit mode, fetch the existing estimate data
        if (isEditMode) {
          const estimateData = await getEstimateById(id);
          setSelectedVehicle(estimateData.vehicle);
          setOwner(estimateData.owner);
          setParts(estimateData.parts);
          setLabors(estimateData.labors);
          setFlatFees(estimateData.flatFees);
          setDiagnostic(estimateData.technicianDiagnostic);
          setExtendedDiagnostic(
            estimateData.technicianDiagnostic?.extendedDiagnostic || ""
          );
          setCustomerNote(estimateData.customerNote || "");
          setSubtotal(estimateData.subtotal || 0);
          setTax(estimateData.tax || 0);
          setTotal(estimateData.total || 0);
          setAuthorizationStatus(
            estimateData.authorizationStatus || "InReview"
          );
        }
      } catch (err) {
        setError("Error loading data: " + err.message);
      } finally {
        setIsLoading(false);
        setLoadingWorkshop(false);
      }
    };
    loadData();
  }, [isEditMode, id]);

  /**
   * Effect to calculate totals whenever parts, labors, flatFees, or settings change.
   */
  useEffect(() => {
    if (!settings) return;

    let partsTotal = 0;
    let taxParts = 0;
    let laborTotal = 0;
    let taxLabors = 0;
    let othersTotal = 0;

    // Calculate parts total and tax
    parts.forEach((part) => {
      const partExt = parseFloat(part.extendedPrice) || 0;
      partsTotal += partExt;
      if (part.applyPartTax) {
        taxParts += partExt * (parseFloat(settings.partTaxRate) / 100);
      }
    });

    // Calculate labors total and tax
    labors.forEach((labor) => {
      const laborExt = parseFloat(labor.extendedPrice) || 0;
      laborTotal += laborExt;
      if (labor.applyLaborTax) {
        taxLabors += laborExt * (parseFloat(settings.laborTaxRate) / 100);
      }
    });

    // Calculate flat fees total
    flatFees.forEach((fee) => {
      othersTotal += parseFloat(fee.extendedPrice) || 0;
    });

    const totalCalc =
      partsTotal + laborTotal + othersTotal + taxParts + taxLabors;

    // Set the calculated totals for PDF and display
    setSubtotal(partsTotal + laborTotal + othersTotal);
    setTax(taxParts + taxLabors);
    setTotal(totalCalc);
  }, [parts, labors, flatFees, settings]);

  /**
   * Handles the change event when a vehicle is selected.
   * Fetches vehicle details and associated diagnostic information.
   */
  const handleVehicleChange = async (e) => {
    const vehicleId = e.target.value; // Keep as string
    if (!vehicleId || parseInt(vehicleId, 10) <= 0) {
      setError("Select a valid vehicle (ID > 0).");
      setSelectedVehicleId("");
      return;
    }
    setSelectedVehicleId(vehicleId);
    setParts([]);
    setLabors([]);
    setFlatFees([]);
    setSubtotal(0);
    setTax(0);
    setTotal(0);
    setExtendedDiagnostic("");
    setDiagnostic(null);

    try {
      const vehData = await getVehicleById(parseInt(vehicleId, 10));
      setSelectedVehicle(vehData);
      if (vehData.userWorkshop) {
        setOwner(vehData.userWorkshop);
        setNoTax(vehData.userWorkshop.noTax);
      }
      const fetchedDiagnostic = await getDiagnosticByVehicleId(
        parseInt(vehicleId, 10)
      );
      if (fetchedDiagnostic) {
        setDiagnostic(fetchedDiagnostic);
        setExtendedDiagnostic(fetchedDiagnostic.extendedDiagnostic);
      } else {
        setDiagnostic(null);
        setExtendedDiagnostic("");
      }
    } catch (err) {
      setError("Error fetching vehicle details or diagnostic: " + err.message);
    }
  };

  // Handlers to show and hide the Tax Settings modal
  const handleShowTaxSettingsModal = () => setShowTaxSettingsModal(true);
  const handleCloseTaxSettingsModal = () => setShowTaxSettingsModal(false);

  /**
   * Handlers to show and hide the Part modal.
   * Initializes the newPart state with default values.
   */
  const handleShowPartModal = () => {
    const defaultTax = noTax ? false : true;
    setNewPart({
      description: "",
      partNumber: "",
      quantity: 1,
      netPrice: 0,
      listPrice: 0,
      extendedPrice: 0,
      applyPartTax: defaultTax,
    });
    setShowPartModal(true);
  };
  const handleClosePartModal = () => {
    setShowPartModal(false);
    setNewPart({
      description: "",
      partNumber: "",
      quantity: 1,
      netPrice: 0,
      listPrice: 0,
      extendedPrice: 0,
      applyPartTax: noTax ? false : true, // Set based on noTax
    });
  };

  /**
   * Handlers to show and hide the Labor modal.
   * Initializes the newLabor state with default values.
   */
  const handleShowLaborModal = () => {
    const defaultTax = noTax ? false : true;
    let defaultRate = 0;
    if (settings && settings.defaultHourlyRate) {
      defaultRate = settings.defaultHourlyRate;
    }
    setNewLabor({
      description: "",
      duration: 0,
      laborRate: defaultRate,
      extendedPrice: 0,
      applyLaborTax: defaultTax,
    });
    setShowLaborModal(true);
  };
  const handleCloseLaborModal = () => {
    setShowLaborModal(false);
    setNewLabor({
      description: "",
      duration: 0,
      laborRate: settings?.defaultHourlyRate || 0,
      extendedPrice: 0,
      applyLaborTax: noTax ? false : true, // Set based on noTax
    });
  };

  /**
   * Handlers to show and hide the Flat Fee modal.
   * Initializes the newFlatFee state with default values.
   */
  const handleShowFlatFeeModal = () => {
    setNewFlatFee({
      description: "",
      flatFeePrice: 0,
      extendedPrice: 0,
    });
    setShowFlatFeeModal(true);
  };
  const handleCloseFlatFeeModal = () => {
    setShowFlatFeeModal(false);
    setNewFlatFee({
      description: "",
      flatFeePrice: 0,
      extendedPrice: 0,
    });
  };

  /**
   * Adds a new part to the estimate after validating inputs.
   */
  const addPart = async () => {
    if (isAddingPart) return;
    setIsAddingPart(true);
    try {
      // Check for duplicate part numbers
      const duplicate = parts.find(
        (part) => part.partNumber === newPart.partNumber
      );
      if (duplicate) {
        setError(
          `The part with Part Number ${newPart.partNumber} already exists in this estimate.`
        );
        return;
      }
      // Ensure description and part number are provided
      if (!newPart.description || !newPart.partNumber) {
        setError("Description and part number are required.");
        return;
      }
      // Add the new part to the parts list
      setParts([...parts, { ...newPart }]);
      // Reset the newPart state
      setNewPart({
        description: "",
        partNumber: "",
        quantity: 1,
        netPrice: 0,
        listPrice: 0,
        extendedPrice: 0,
        applyPartTax: noTax ? false : true,
      });
      setSuccess("Part added successfully.");
      setShowPartModal(false);
      setError(null); // Clear any existing errors
    } catch (err) {
      setError("Error adding the part.");
    } finally {
      setIsAddingPart(false);
    }
  };

  /**
   * Adds a new labor entry to the estimate after validating inputs.
   */
  const addLabor = () => {
    // Validate description and duration
    if (!newLabor.description || newLabor.duration <= 0) {
      setError("Please fill out all labor fields correctly.");
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
    setError(null);
    handleCloseLaborModal();
  };

  /**
   * Adds a new flat fee to the estimate after validating inputs.
   */
  const addFlatFee = () => {
    // Validate description and flat fee price
    if (!newFlatFee.description || newFlatFee.flatFeePrice <= 0) {
      setError("Please fill out all flat fee fields correctly.");
      return;
    }
    const price = parseFloat(newFlatFee.flatFeePrice) || 0;
    const newItem = { ...newFlatFee, extendedPrice: price };
    setFlatFees([...flatFees, newItem]);
    setError(null);
    handleCloseFlatFeeModal();
  };

  /**
   * Removes an item (part, labor, or flat fee) from the estimate based on its type and index.
   * @param {string} type - The type of the item ("PART", "LABOR", "FLATFEE")
   * @param {number} idx - The index of the item in its respective array
   */
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
    } else if (type === "FLATFEE") {
      setFlatFees((prev) => {
        const arr = [...prev];
        arr.splice(idx, 1);
        return arr;
      });
    }
  };

  /**
   * Handles the saving of the estimate, whether creating a new one or updating an existing one.
   * Validates inputs before sending data to the backend services.
   * @param {Event} e - The form submission event
   */
  const handleSave = async (e) => {
    e.preventDefault();

    // Validate that a vehicle is selected only in create mode
    if (!isEditMode && (!selectedVehicleId || selectedVehicleId === "")) {
      setError("Please select a vehicle.");
      return;
    }

    // Basic validations to ensure at least one item is added
    if (parts.length === 0 && labors.length === 0 && flatFees.length === 0) {
      setError("Add at least one item to the Estimate.");
      return;
    }
    const partNumbers = parts.map((p) => p.partNumber);
    const hasDuplicates = partNumbers.some(
      (item, idx) => partNumbers.indexOf(item) !== idx
    );
    if (hasDuplicates) {
      setError("There are duplicate Part Numbers in the estimate.");
      return;
    }

    if (!customerNote.trim()) {
      setError("The 'Description of labor or services' field cannot be empty.");
      return;
    }

    // Create Mode: Prepare and send the create estimate payload
    if (!isEditMode) {
      const vehicleIdParsed = parseInt(selectedVehicleId, 10);
      if (!vehicleIdParsed || vehicleIdParsed <= 0) {
        setError("Vehicle ID must be greater than 0.");
        return;
      }
      // Build the Create DTO object
      const createDto = {
        VehicleID: vehicleIdParsed,
        TechnicianDiagnostic: extendedDiagnostic
          ? {
              DiagnosticId: diagnostic?.diagnosticId || 0,
              Mileage: diagnostic?.mileage || 0,
              ExtendedDiagnostic: extendedDiagnostic,
            }
          : null,
        CustomerNote: customerNote,
        Subtotal: subtotal,
        Tax: tax,
        Total: total,
        AuthorizationStatus: authorizationStatus,
        Parts: parts.map((p) => ({
          Description: p.description,
          PartNumber: p.partNumber,
          Quantity: p.quantity,
          NetPrice: p.netPrice,
          ListPrice: p.listPrice,
          ExtendedPrice: p.extendedPrice,
          Taxable: p.applyPartTax,
        })),
        Labors: labors.map((l) => ({
          Description: l.description,
          Duration: l.duration,
          LaborRate: l.laborRate,
          ExtendedPrice: l.extendedPrice,
          Taxable: l.applyLaborTax,
        })),
        FlatFees: flatFees.map((f) => ({
          Description: f.description,
          FlatFeePrice: f.flatFeePrice,
          ExtendedPrice: f.extendedPrice,
          Taxable: false,
        })),
      };

      try {
        setSaving(true);
        const created = await createEstimate(createDto);
        setSuccess(`Estimate created successfully with ID: ${created.ID}`);
        navigate("/estimates"); // Navigate to the estimates list page
      } catch (err) {
        setError(err.message || "Error creating the estimate.");
      } finally {
        setSaving(false);
      }
    }
    // Edit Mode: Prepare and send the update estimate payload
    else {
      const updateDto = {
        ID: parseInt(id, 10),
        VehicleID: selectedVehicle ? parseInt(selectedVehicleId, 10) || 0 : 0, // Ensure it's a number
        CustomerNote: customerNote,
        Subtotal: subtotal,
        Tax: tax,
        Total: total,
        AuthorizationStatus: authorizationStatus,
        TechnicianDiagnostic: extendedDiagnostic
          ? {
              DiagnosticId: diagnostic?.diagnosticId || 0,
              Mileage: diagnostic?.mileage || 0,
              ExtendedDiagnostic: extendedDiagnostic,
            }
          : null,
        Parts: parts.map((p) => ({
          Description: p.description,
          PartNumber: p.partNumber,
          Quantity: p.quantity,
          NetPrice: p.netPrice,
          ListPrice: p.listPrice,
          ExtendedPrice: p.extendedPrice,
          Taxable: p.applyPartTax,
        })),
        Labors: labors.map((l) => ({
          Description: l.description,
          Duration: l.duration,
          LaborRate: l.laborRate,
          ExtendedPrice: l.extendedPrice,
          Taxable: l.applyLaborTax,
        })),
        FlatFees: flatFees.map((f) => ({
          Description: f.description,
          FlatFeePrice: f.flatFeePrice,
          ExtendedPrice: f.extendedPrice,
          Taxable: false,
        })),
      };

      try {
        setSaving(true);
        const updated = await updateEstimate(id, updateDto);
        setSuccess(`Estimate with ID ${updated.ID} updated successfully.`);
        navigate("/estimates"); // Navigate to the estimates list page
      } catch (err) {
        setError(err.message || "Error updating the estimate.");
      } finally {
        setSaving(false);
      }
    }
  };

  /**
   * Combines all items (parts, labors, flat fees) for PDF preview using useMemo for optimization.
   */
  const combinedItems = useMemo(() => {
    return [
      ...parts.map((p) => ({
        type: "Part",
        description: p.description,
        quantity: p.quantity,
        price: p.netPrice,
        listPrice: p.listPrice,
        extendedPrice: p.extendedPrice,
        taxable: p.applyPartTax,
        partNumber: p.partNumber,
      })),
      ...labors.map((l) => ({
        type: "Labor",
        description: l.description,
        quantity: l.duration,
        price: l.laborRate,
        listPrice: "", // Labor does not have a list price
        extendedPrice: l.extendedPrice,
        taxable: l.applyLaborTax,
        partNumber: "",
      })),
      ...flatFees.map((f) => ({
        type: "Flat Fee",
        description: f.description,
        quantity: "-", // Flat Fee does not have a quantity
        price: f.flatFeePrice,
        listPrice: "", // Flat Fee does not have a list price
        extendedPrice: f.extendedPrice,
        taxable: false,
        partNumber: "",
      })),
    ];
  }, [parts, labors, flatFees]);

  // Render a loading spinner while data is being fetched
  if (isLoading || loadingWorkshop) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ height: "80vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading Estimate...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="p-4 border rounded mt-4">
      <h3 className="mb-4">
        {isEditMode ? "Edit Estimate" : "Create Estimate"}
      </h3>

      {/* Display error alert if there's an error */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      {/* Display success alert if there's a success message */}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      {/* Button to view Tax & Markup Settings */}
      <div className="text-end mb-3">
        <Button variant="info" onClick={handleShowTaxSettingsModal}>
          View Tax & Markup Settings
        </Button>
      </div>

      <Form onSubmit={handleSave}>
        {/* ---------------------------------------------
            CREATE MODE => Select Vehicle, etc.
        --------------------------------------------- */}
        {!isEditMode && (
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group controlId="vehicleSelect">
                <Form.Label>Select Vehicle (VIN)</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedVehicleId}
                  onChange={handleVehicleChange}
                  required
                >
                  <option value="">-- Select Vehicle --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {`${v.vin} - ${v.year} ${v.make} ${v.model}`}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>

            <Col md={6} className="mb-3">
              <Form.Group controlId="authorizationStatus">
                <Form.Label>Authorization Status</Form.Label>
                <Form.Control
                  as="select"
                  value={authorizationStatus}
                  onChange={(e) => setAuthorizationStatus(e.target.value)}
                  required
                >
                  <option value="InReview">In Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
        )}

        {/* ---------------------------------------------
            EDIT MODE => Display Vehicle and Owner Info
        --------------------------------------------- */}
        {isEditMode && (
          <Row className="mb-3">
            <Col md={6}>
              <p className="fw-bold">Vehicle:</p>
              {selectedVehicle ? (
                <p>
                  {selectedVehicle.vin} - {selectedVehicle.year}{" "}
                  {selectedVehicle.make} {selectedVehicle.model} (
                  {selectedVehicle.engine})
                </p>
              ) : (
                <p>No vehicle associated.</p>
              )}
            </Col>
            <Col md={6}>
              <Form.Group controlId="authorizationStatus">
                <Form.Label>Authorization Status</Form.Label>
                <Form.Control
                  as="select"
                  value={authorizationStatus}
                  onChange={(e) => setAuthorizationStatus(e.target.value)}
                  required
                >
                  <option value="InReview">In Review</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
        )}

        {/* Display Owner and Tax Setting in Edit Mode */}
        {isEditMode && selectedVehicle && owner && (
          <Row className="mb-3">
            <Col md={6}>
              <p className="fw-bold">Owner:</p>
              <p>
                {owner.name} {owner.lastName} - {owner.email}
              </p>
            </Col>
            <Col md={6}>
              <p className="fw-bold">Tax Setting:</p>
              <p>{owner.noTax ? "No Tax" : "Taxable"}</p>
            </Col>
          </Row>
        )}

        {/* Display Vehicle and Owner Info in Create Mode */}
        {!isEditMode && selectedVehicle && owner && (
          <div className="mb-3">
            <Row>
              <Col md={8}>
                <strong>Vehicle:</strong>{" "}
                {`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.engine})`}
                <br />
                Plate: {selectedVehicle.plate}, State: {selectedVehicle.state},
                Status: {selectedVehicle.status}
              </Col>
              <Col md={4}>
                <strong>Owner:</strong> {owner.name} {owner.lastName}
                <br />
                Email: {owner.email}
                <br />
                <strong>{owner.noTax ? "No Tax" : "Taxable"}</strong>
              </Col>
            </Row>
          </div>
        )}

        {/* Technician Diagnostic */}
        <Form.Group controlId="diagnostic" className="mb-3">
          <Form.Label>Extended Diagnostic</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={extendedDiagnostic}
            onChange={(e) => setExtendedDiagnostic(e.target.value)}
            placeholder="Enter technician diagnostic..."
            readOnly={isEditMode} // Consider removing if editing is desired
          />
        </Form.Group>

        {/* Buttons to add items */}
        <Row className="mb-3">
          <Col>
            <Button
              variant="primary"
              onClick={handleShowPartModal}
              className="me-2"
              disabled={!selectedVehicle && !isEditMode}
            >
              Add Part
            </Button>
            <Button
              variant="secondary"
              onClick={handleShowLaborModal}
              className="me-2"
              disabled={!selectedVehicle && !isEditMode}
            >
              Add Labor
            </Button>
            <Button
              variant="info"
              onClick={handleShowFlatFeeModal}
              disabled={!selectedVehicle && !isEditMode}
            >
              Add Flat Fee
            </Button>
          </Col>
        </Row>

        {/* Items List */}
        <Row>
          <Col>
            <h5>Items</h5>
            <Table bordered hover responsive>
              <thead>
                <tr>
                  <th>TYPE</th>
                  <th>DESCRIPTION</th>
                  <th>PART# / HOURS</th>
                  <th>NET / RATE</th>
                  <th>QUANTITY</th>
                  <th>LIST PRICE</th>
                  <th>EXTENDED PRICE</th>
                  <th>TAX?</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {/* Render parts */}
                {parts.map((p, idx) => (
                  <tr key={`p-${idx}`}>
                    <td>[PART]</td>
                    <td>{p.description}</td>
                    <td>
                      {p.partNumber} (QTY: {p.quantity})
                    </td>
                    <td>${parseFloat(p.netPrice).toFixed(2)}</td>
                    <td>{p.quantity}</td>
                    <td>${parseFloat(p.listPrice).toFixed(2)}</td>
                    <td>${parseFloat(p.extendedPrice).toFixed(2)}</td>
                    <td>{p.applyPartTax ? "Yes" : "No"}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeItem("PART", idx)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
                {/* Render labors */}
                {labors.map((l, idx) => (
                  <tr key={`l-${idx}`}>
                    <td>[LABOR]</td>
                    <td>{l.description}</td>
                    <td>{l.duration} hrs</td>
                    <td>${parseFloat(l.laborRate).toFixed(2)}</td>
                    <td>{l.duration}</td>
                    <td>-</td>
                    <td>${parseFloat(l.extendedPrice).toFixed(2)}</td>
                    <td>{l.applyLaborTax ? "Yes" : "No"}</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeItem("LABOR", idx)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
                {/* Render flat fees */}
                {flatFees.map((f, idx) => (
                  <tr key={`f-${idx}`}>
                    <td>[FLATFEE]</td>
                    <td>{f.description}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>${parseFloat(f.extendedPrice).toFixed(2)}</td>
                    <td>No</td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeItem("FLATFEE", idx)}
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>

        {/* Customer Note */}
        <Form.Group className="mb-3">
          <Form.Label>Description of labor or services</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
          />
        </Form.Group>

        {/* Totals Section */}
        <Row>
          <Col md={8}></Col>
          <Col md={4}>
            <div className="text-end">
              <div>Subtotal: ${subtotal.toFixed(2)}</div>
              <div>Tax: ${tax.toFixed(2)}</div>
              <h5>Total: ${total.toFixed(2)}</h5>
            </div>
          </Col>
        </Row>

        {/* Final Action Buttons */}
        <Row className="mb-3">
          <Col>
            <Button
              variant="success"
              type="submit"
              disabled={saving || isLoading}
              className="me-2"
            >
              {saving
                ? "Saving..."
                : isEditMode
                ? "Update Estimate"
                : "Create Estimate"}
            </Button>

            <Button variant="secondary" onClick={() => navigate("/estimates")}>
              Cancel
            </Button>
          </Col>
        </Row>
      </Form>

      {/* Modal: Tax Settings */}
      <Modal show={showTaxSettingsModal} onHide={handleCloseTaxSettingsModal}>
        <Modal.Header closeButton>
          <Modal.Title>Tax & Markup Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!settings ? (
            <Alert variant="warning">No settings found.</Alert>
          ) : (
            <div className="row">
              <div className="col-6 mb-2">
                <strong>Hourly Rate 1:</strong> {settings.hourlyRate1}
              </div>
              <div className="col-6 mb-2">
                <strong>Hourly Rate 2:</strong> {settings.hourlyRate2}
              </div>
              <div className="col-6 mb-2">
                <strong>Hourly Rate 3:</strong> {settings.hourlyRate3}
              </div>
              <div className="col-6 mb-2">
                <strong>Default Hourly Rate:</strong>{" "}
                {settings.defaultHourlyRate}
              </div>
              <div className="col-6 mb-2">
                <strong>Part Tax Rate:</strong> {settings.partTaxRate}%
              </div>
              <div className="col-6 mb-2">
                <strong>Part Tax By Default:</strong>{" "}
                {settings.partTaxByDefault ? "Yes" : "No"}
              </div>
              <div className="col-6 mb-2">
                <strong>Labor Tax Rate:</strong> {settings.laborTaxRate}%
              </div>
              <div className="col-6 mb-2">
                <strong>Labor Tax By Default:</strong>{" "}
                {settings.laborTaxByDefault ? "Yes" : "No"}
              </div>
              <div className="col-6 mb-2">
                <strong>Part Markup:</strong> {settings.partMarkup}%
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseTaxSettingsModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal: Add Part */}
      <Modal show={showPartModal} onHide={handleClosePartModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Part</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Description Field */}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={newPart.description}
                onChange={(e) =>
                  setNewPart({ ...newPart, description: e.target.value })
                }
                placeholder="Enter part description"
                required
              />
            </Form.Group>
            {/* Part Number Field */}
            <Form.Group className="mb-3">
              <Form.Label>Part Number</Form.Label>
              <Form.Control
                type="text"
                value={newPart.partNumber}
                onChange={(e) =>
                  setNewPart({ ...newPart, partNumber: e.target.value })
                }
                placeholder="Enter part number"
                required
              />
            </Form.Group>
            {/* Quantity Field */}
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={newPart.quantity === 0 ? "" : newPart.quantity}
                onChange={(e) => {
                  const qty = parseInt(e.target.value, 10) || 1;
                  const ext = newPart.netPrice * qty;
                  setNewPart((prev) => ({
                    ...prev,
                    quantity: qty,
                    extendedPrice: ext,
                  }));
                }}
                placeholder="Quantity"
                required
              />
            </Form.Group>
            {/* Net Price Field */}
            <Form.Group className="mb-3">
              <Form.Label>Net Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  type="number"
                  step="0.01"
                  value={newPart.netPrice === 0 ? "" : newPart.netPrice}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value) || 0;
                    const ext = price * newPart.quantity;
                    setNewPart((prev) => ({
                      ...prev,
                      netPrice: price,
                      extendedPrice: ext,
                    }));
                  }}
                  placeholder="Net Price"
                  required
                />
              </InputGroup>
            </Form.Group>
            {/* List Price Field */}
            <Form.Group className="mb-3">
              <Form.Label>List Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  type="number"
                  step="0.01"
                  value={newPart.listPrice === 0 ? "" : newPart.listPrice}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value) || 0;
                    const ext = price * newPart.quantity;
                    setNewPart((prev) => ({
                      ...prev,
                      listPrice: price,
                      extendedPrice: ext,
                    }));
                  }}
                  placeholder="List Price"
                  required
                />
              </InputGroup>
            </Form.Group>
            {/* Extended Price Field */}
            <Form.Group className="mb-3">
              <Form.Label>Extended Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  type="number"
                  step="0.01"
                  value={
                    newPart.extendedPrice === 0 ? "" : newPart.extendedPrice
                  }
                  readOnly
                  placeholder="0" // Read-only field
                />
              </InputGroup>
            </Form.Group>
            {/* Tax Checkbox */}
            <Form.Group className="mt-3">
              <Form.Check
                type="checkbox"
                label={
                  noTax
                    ? "Override NoTax? (Apply Part Tax)"
                    : "Don't Apply Part Tax?"
                }
                checked={newPart.applyPartTax}
                onChange={(e) =>
                  setNewPart({ ...newPart, applyPartTax: e.target.checked })
                }
              />
              <Form.Text className="text-muted">
                {noTax
                  ? "If you check this box, tax will be applied even if the profile has NoTax."
                  : "If you check this box, tax will not be applied for this item."}
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePartModal}>
            Close
          </Button>
          <Button variant="primary" onClick={addPart} disabled={isAddingPart}>
            {isAddingPart ? "Adding..." : "Add Part"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal: Add Labor */}
      <Modal show={showLaborModal} onHide={handleCloseLaborModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Labor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Description Field */}
            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={newLabor.description}
                onChange={(e) =>
                  setNewLabor({ ...newLabor, description: e.target.value })
                }
                placeholder="Labor description"
              />
            </Form.Group>
            {/* Duration Field */}
            <Form.Group className="mb-2">
              <Form.Label>Duration (hours)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={newLabor.duration === 0 ? "" : newLabor.duration}
                onChange={(e) => {
                  const dur = parseFloat(e.target.value) || 0;
                  setNewLabor((prev) => ({
                    ...prev,
                    duration: dur,
                    extendedPrice: dur * prev.laborRate,
                  }));
                }}
                placeholder="Hours"
              />
            </Form.Group>
            {/* Labor Rate Field */}
            <Form.Group className="mb-2">
              <Form.Label>Labor Rate</Form.Label>
              <Form.Select
                value={newLabor.laborRate}
                onChange={(e) => {
                  const rate = parseFloat(e.target.value) || 0;
                  setNewLabor((prev) => ({
                    ...prev,
                    laborRate: rate,
                    extendedPrice: prev.duration * rate,
                  }));
                }}
              >
                {settings ? (
                  <>
                    <option value={settings.hourlyRate1}>
                      Rate1: {settings.hourlyRate1}
                    </option>
                    <option value={settings.hourlyRate2}>
                      Rate2: {settings.hourlyRate2}
                    </option>
                    <option value={settings.hourlyRate3}>
                      Rate3: {settings.hourlyRate3}
                    </option>
                    <option value={settings.defaultHourlyRate}>
                      Default: {settings.defaultHourlyRate}
                    </option>
                  </>
                ) : (
                  <option value={140}>$140 (fallback)</option>
                )}
              </Form.Select>
            </Form.Group>
            {/* Extended Price Field */}
            <Form.Group className="mb-2">
              <Form.Label>Extended Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  type="number"
                  step="0.01"
                  value={
                    newLabor.extendedPrice === 0 ? "" : newLabor.extendedPrice
                  }
                  readOnly
                  placeholder="0" // Read-only field
                />
              </InputGroup>
            </Form.Group>
            {/* Tax Checkbox */}
            <Form.Group className="mt-3">
              <Form.Check
                type="checkbox"
                label={
                  noTax
                    ? "Override NoTax? (Apply Labor Tax)"
                    : "Don't Apply Labor Tax?"
                }
                checked={newLabor.applyLaborTax}
                onChange={(e) =>
                  setNewLabor({ ...newLabor, applyLaborTax: e.target.checked })
                }
              />
              <Form.Text className="text-muted">
                {noTax
                  ? "If you check this box, tax will be applied even if the profile has NoTax."
                  : "If you check this box, tax will not be applied for this labor."}
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseLaborModal}>
            Close
          </Button>
          <Button variant="primary" onClick={addLabor}>
            Add Labor
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal: Add Flat Fee */}
      <Modal show={showFlatFeeModal} onHide={handleCloseFlatFeeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Flat Fee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Description Field */}
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={newFlatFee.description}
                onChange={(e) =>
                  setNewFlatFee({ ...newFlatFee, description: e.target.value })
                }
                placeholder="Enter flat fee description"
                required
              />
            </Form.Group>
            {/* Flat Fee Price Field */}
            <Form.Group className="mb-3">
              <Form.Label>Flat Fee Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  type="number"
                  step="0.01"
                  value={
                    newFlatFee.flatFeePrice === 0 ? "" : newFlatFee.flatFeePrice
                  }
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setNewFlatFee((prev) => ({
                      ...prev,
                      flatFeePrice: val,
                      extendedPrice: val,
                    }));
                  }}
                  placeholder="Flat Fee Price"
                  required
                />
              </InputGroup>
            </Form.Group>
            {/* Extended Price Field */}
            <Form.Group className="mb-3">
              <Form.Label>Extended Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  type="number"
                  step="0.01"
                  value={
                    newFlatFee.extendedPrice === 0
                      ? ""
                      : newFlatFee.extendedPrice
                  }
                  readOnly
                  placeholder="0" // Read-only field
                />
              </InputGroup>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseFlatFeeModal}>
            Close
          </Button>
          <Button variant="primary" onClick={addFlatFee}>
            Add Flat Fee
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Estimate;
