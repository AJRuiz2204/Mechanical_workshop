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
  Card,
  ListGroup,
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
import "./Estimate.css";

/**
 * Estimate Component
 *
 * This component handles the creation and editing of estimates.
 * It allows you to:
 * - Select a vehicle (only those with an extended diagnostic).
 * - Add parts, labor, and fixed charges.
 * - Calculate totals (subtotal, taxes, total).
 * - Check tax and markup settings.
 *
 * @returns {JSX.Element} Rendered component.
 */
const Estimate = () => {
  // Get the estimate ID (if editing) from URL parameters
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // States for data, UI, and calculations
  const [isLoading, setIsLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [owner, setOwner] = useState(null);
  const [parts, setParts] = useState([]);
  const [labors, setLabors] = useState([]);
  const [flatFees, setFlatFees] = useState([]);
  const [customerNote, setCustomerNote] = useState("");
  const [extendedDiagnostic, setExtendedDiagnostic] = useState("");
  const [diagnostic, setDiagnostic] = useState(null);
  const [authorizationStatus, setAuthorizationStatus] = useState("InReview");
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);
  const [settings, setSettings] = useState(null);
  const [noTax, setNoTax] = useState(false);
  const [workshopSettings, setWorkshopSettings] = useState(null);
  const [loadingWorkshop, setLoadingWorkshop] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  // States to control modal visibility
  const [showTaxSettingsModal, setShowTaxSettingsModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);
  const [showLaborModal, setShowLaborModal] = useState(false);
  const [showFlatFeeModal, setShowFlatFeeModal] = useState(false);

  // States for new items (part, labor, flat fee)
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
  const [isAddingPart, setIsAddingPart] = useState(false);

  // Reference for the PDF container (if needed)
  const pdfContainerRef = useRef(null);

  /**
   * useEffect: Initial data load when the component mounts.
   *
   * - Retrieves the workshop settings.
   * - Retrieves the tax and markup settings.
   * - Retrieves the list of vehicles, filtering only those with an extended diagnostic.
   *   For each vehicle passing the filter, detailed data is fetched (via getVehicleById)
   *   to include the workshop (owner) information.
   * - If in edit mode, loads the selected estimate information.
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get workshop settings
        const shopData = await getWorkshopSettings();
        setWorkshopSettings(shopData);

        // Get tax and markup settings
        const cfg = await getSettingsById(1);
        setSettings(cfg);

        // Get all vehicles
        const vList = await getAllVehicles();
        // Filter vehicles with an extended diagnostic and fetch detailed data for each
        const vehiclesWithExtendedDiag = await Promise.all(
          vList.map(async (vehicle) => {
            try {
              const diag = await getDiagnosticByVehicleId(vehicle.id);
              if (
                diag &&
                diag.extendedDiagnostic &&
                diag.extendedDiagnostic.trim() !== ""
              ) {
                // Fetch detailed vehicle info to get workshop (owner) information
                const detailedVehicle = await getVehicleById(vehicle.id);
                return detailedVehicle;
              }
              return null;
            } catch (error) {
              return null;
            }
          })
        );
        // Update state with valid vehicles (exclude nulls)
        setVehicles(vehiclesWithExtendedDiag.filter((v) => v !== null));

        // If editing an estimate, load the corresponding estimate information
        if (isEditMode) {
          const estimateData = await getEstimateById(id);
          setSelectedVehicle(estimateData.vehicle);
          setOwner(estimateData.owner);
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
          setParts(
            estimateData.parts.map((p) => ({
              ...p,
              applyPartTax:
                p.applyPartTax !== undefined ? p.applyPartTax : p.taxable,
            }))
          );
          setLabors(
            estimateData.labors.map((l) => ({
              ...l,
              applyLaborTax:
                l.applyLaborTax !== undefined ? l.applyLaborTax : l.taxable,
            }))
          );
          setFlatFees(
            estimateData.flatFees.map((f) => ({
              ...f,
              taxable: f.taxable,
            }))
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
   * useEffect: Recalculates totals (subtotal, taxes, and total)
   * whenever parts, labors, flat fees, or settings change.
   */
  useEffect(() => {
    if (!settings) return;

    let partsTotal = 0;
    let taxParts = 0;
    let laborTotal = 0;
    let taxLabors = 0;
    let othersTotal = 0;

    // Calculate total and tax for parts
    parts.forEach((part) => {
      const partExt = parseFloat(part.extendedPrice) || 0;
      partsTotal += partExt;
      if (part.applyPartTax) {
        taxParts += partExt * (parseFloat(settings.partTaxRate) / 100);
      }
    });

    // Calculate total and tax for labors
    labors.forEach((labor) => {
      const laborExt = parseFloat(labor.extendedPrice) || 0;
      laborTotal += laborExt;
      if (labor.applyLaborTax) {
        taxLabors += laborExt * (parseFloat(settings.laborTaxRate) / 100);
      }
    });

    // Sum total of flat fees (no tax)
    flatFees.forEach((fee) => {
      othersTotal += parseFloat(fee.extendedPrice) || 0;
    });

    // Calculate final total
    const totalCalc =
      partsTotal + laborTotal + othersTotal + taxParts + taxLabors;
    setSubtotal(partsTotal + laborTotal + othersTotal);
    setTax(taxParts + taxLabors);
    setTotal(totalCalc);
  }, [parts, labors, flatFees, settings]);

  /**
   * handleVehicleChange:
   * Handles vehicle selection by loading its details and extended diagnostic.
   *
   * @param {Object} e - Change event from the select.
   */
  const handleVehicleChange = async (e) => {
    const vehicleId = e.target.value;
    if (!vehicleId || parseInt(vehicleId, 10) <= 0) {
      setError("Select a valid vehicle (ID > 0).");
      setSelectedVehicleId("");
      return;
    }
    setSelectedVehicleId(vehicleId);
    // Reset data related to the vehicle when selecting a new one
    setParts([]);
    setLabors([]);
    setFlatFees([]);
    setSubtotal(0);
    setTax(0);
    setTotal(0);
    setExtendedDiagnostic("");
    setDiagnostic(null);

    try {
      // Get details of the selected vehicle
      const vehData = await getVehicleById(parseInt(vehicleId, 10));
      console.log("Payload recibido del back (usuario y vehiculo):", vehData);
      // Format vehicle data with default values
      const formattedVehicle = {
        vin: vehData.vin || vehData.VIN || "No VIN",
        year: vehData.year || vehData.Year || "N/A",
        make: vehData.make || vehData.Make || "N/A",
        model: vehData.model || vehData.Model || "N/A",
        engine: vehData.engine || vehData.Engine || "N/A",
        plate: vehData.plate || "N/A",
        state: vehData.state || "N/A",
        status: vehData.status || "N/A",
        userWorkshop: vehData.userWorkshop || null,
        ...vehData,
      };

      setSelectedVehicle(formattedVehicle);
      // If workshop (owner) information exists, update owner state and noTax flag
      if (vehData.userWorkshop) {
        setOwner(vehData.userWorkshop);
        setNoTax(vehData.userWorkshop.noTax);
      }
      // Get the diagnostic associated with the vehicle
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

  // Handlers for opening and closing modals
  const handleShowTaxSettingsModal = () => setShowTaxSettingsModal(true);
  const handleCloseTaxSettingsModal = () => setShowTaxSettingsModal(false);

  /**
   * handleShowPartModal:
   * Opens the modal to add a new part and sets default values.
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

  /**
   * handleClosePartModal:
   * Closes the add-part modal and resets the new part state.
   */
  const handleClosePartModal = () => {
    setShowPartModal(false);
    setNewPart({
      description: "",
      partNumber: "",
      quantity: 1,
      netPrice: 0,
      listPrice: 0,
      extendedPrice: 0,
      applyPartTax: noTax ? false : true,
    });
  };

  /**
   * handleShowLaborModal:
   * Opens the modal to add a new labor and sets default values.
   */
  const handleShowLaborModal = () => {
    const defaultTax = noTax ? false : true;
    let defaultRate = settings?.defaultHourlyRate || 0;
    setNewLabor({
      description: "",
      duration: 0,
      laborRate: defaultRate,
      extendedPrice: 0,
      applyLaborTax: defaultTax,
    });
    setShowLaborModal(true);
  };

  /**
   * handleCloseLaborModal:
   * Closes the add-labor modal and resets the new labor state.
   */
  const handleCloseLaborModal = () => {
    setShowLaborModal(false);
    setNewLabor({
      description: "",
      duration: 0,
      laborRate: settings?.defaultHourlyRate || 0,
      extendedPrice: 0,
      applyLaborTax: noTax ? false : true,
    });
  };

  /**
   * handleShowFlatFeeModal:
   * Opens the modal to add a new flat fee and sets default values.
   */
  const handleShowFlatFeeModal = () => {
    setNewFlatFee({
      description: "",
      flatFeePrice: 0,
      extendedPrice: 0,
    });
    setShowFlatFeeModal(true);
  };

  /**
   * handleCloseFlatFeeModal:
   * Closes the add-flat-fee modal and resets its state.
   */
  const handleCloseFlatFeeModal = () => {
    setShowFlatFeeModal(false);
    setNewFlatFee({
      description: "",
      flatFeePrice: 0,
      extendedPrice: 0,
    });
  };

  /**
   * addPart:
   * Validates and adds a new part to the estimate.
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
      if (!newPart.description || !newPart.partNumber) {
        setError("Description and part number are required.");
        return;
      }
      // Add the new part
      setParts([...parts, { ...newPart }]);
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
      setError(null);
    } catch (err) {
      setError("Error adding the part.");
    } finally {
      setIsAddingPart(false);
    }
  };

  /**
   * addLabor:
   * Validates and adds a new labor to the estimate.
   */
  const addLabor = () => {
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
   * addFlatFee:
   * Validates and adds a new flat fee to the estimate.
   */
  const addFlatFee = () => {
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
   * removeItem:
   * Removes an item (part, labor, or flat fee) from the estimate based on its type.
   *
   * @param {string} type - "PART", "LABOR", or "FLATFEE".
   * @param {number} idx - Index of the item in its array.
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
   * handleSave:
   * Constructs the DTO with the estimate information and calls the service
   * to create or update the estimate depending on the mode.
   *
   * @param {Event} e - Form submit event.
   */
  const handleSave = async (e) => {
    e.preventDefault();

    // Validation: In create mode, a vehicle must be selected.
    if (!isEditMode && (!selectedVehicleId || selectedVehicleId === "")) {
      setError("Please select a vehicle.");
      return;
    }

    // Validate that at least one item has been added.
    if (parts.length === 0 && labors.length === 0 && flatFees.length === 0) {
      setError("Add at least one item to the Estimate.");
      return;
    }
    // Check for duplicate part numbers.
    const partNumbers = parts.map((p) => p.partNumber);
    const hasDuplicates = partNumbers.some(
      (item, idx) => partNumbers.indexOf(item) !== idx
    );
    if (hasDuplicates) {
      setError("There are duplicate Part Numbers in the estimate.");
      return;
    }

    // Validate that the description of labor or services is not empty.
    if (!customerNote.trim()) {
      setError("The 'Description of labor or services' field cannot be empty.");
      return;
    }

    // Build the DTO with all collected information.
    const dto = {
      VehicleID: !isEditMode
        ? parseInt(selectedVehicleId, 10)
        : parseInt(selectedVehicleId, 10) || 0,
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
      if (!isEditMode) {
        // Create a new estimate.
        const created = await createEstimate(dto);
        setSuccess(`Estimate created successfully with ID: ${created.ID}`);
        navigate("/estimates");
      } else {
        // Update the existing estimate.
        const updateDto = { ID: parseInt(id, 10), ...dto };
        const updated = await updateEstimate(id, updateDto);
        setSuccess(`Estimate with ID ${updated.ID} updated successfully.`);
        navigate("/estimates");
      }
    } catch (err) {
      setError(
        err.message ||
          (isEditMode
            ? "Error updating the estimate."
            : "Error creating the estimate.")
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * combinedItems:
   * Combines parts, labors, and flat fees into a single array.
   * This array can be useful for operations like PDF generation.
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
        listPrice: "", // Not applicable for labor
        extendedPrice: l.extendedPrice,
        taxable: l.applyLaborTax,
        partNumber: "",
      })),
      ...flatFees.map((f) => ({
        type: "Flat Fee",
        description: f.description,
        quantity: "-", // Not applicable for flat fee
        price: f.flatFeePrice,
        listPrice: "", // Not applicable
        extendedPrice: f.extendedPrice,
        taxable: false,
        partNumber: "",
      })),
    ];
  }, [parts, labors, flatFees]);

  // If data is still loading, show a centered spinner.
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
    <Container className="p-4 border rounded mt-4 estimate-container">
      <h3 className="mb-4">
        {isEditMode ? "Edit Estimate" : "Create Estimate"}
      </h3>

      {/* Alerts for errors or success messages */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      {/* Button to open Tax & Markup settings modal */}
      <div className="text-end mb-3">
        <Button variant="info" onClick={handleShowTaxSettingsModal}>
          View Tax & Markup Settings
        </Button>
      </div>

      <Form onSubmit={handleSave}>
        {/* Create Mode: Vehicle selection */}
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
                      {`${v.vin} ${
                        v.userWorkshop && v.userWorkshop.name
                          ? v.userWorkshop.name + " " + v.userWorkshop.lastName
                          : "No Owner"
                      } ${v.make} ${v.model} ${v.year} ${v.plate}`}
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

        {/* Section: Complete vehicle information */}
        {selectedVehicle && (
          <Row className="mb-3">
            <Col>
              <Card>
                <Card.Body>
                  <Card.Title>Vehicle Information</Card.Title>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>VIN:</strong> {selectedVehicle.vin}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Make:</strong> {selectedVehicle.make}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Model:</strong> {selectedVehicle.model}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Year:</strong> {selectedVehicle.year}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Engine:</strong> {selectedVehicle.engine}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Plate:</strong> {selectedVehicle.plate}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>State:</strong> {selectedVehicle.state}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Status:</strong> {selectedVehicle.status}
                    </ListGroup.Item>
                    {selectedVehicle.userWorkshop && (
                      <ListGroup.Item>
                        <strong>Workshop Information:</strong>{" "}
                        {selectedVehicle.userWorkshop.name}{" "}
                        {selectedVehicle.userWorkshop.lastName} -{" "}
                        {selectedVehicle.userWorkshop.email}
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Edit Mode: Show vehicle and authorization info */}
        {isEditMode && (
          <Row className="mb-3">
            <Col md={6}>
              <p className="fw-bold">Vehicle:</p>
              {selectedVehicle ? (
                <p>
                  {selectedVehicle.vin}{" "}
                  {selectedVehicle.userWorkshop &&
                  selectedVehicle.userWorkshop.name
                    ? `${selectedVehicle.userWorkshop.name} ${selectedVehicle.userWorkshop.lastName}`
                    : "No Owner"}{" "}
                  {selectedVehicle.make} {selectedVehicle.model}{" "}
                  {selectedVehicle.year} {selectedVehicle.plate}
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

        {/* Edit Mode: Show owner information and tax settings */}
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

        {/* Section: Technician Diagnostic */}
        <Form.Group controlId="diagnostic" className="mb-3">
          <Form.Label>Extended Diagnostic</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={extendedDiagnostic}
            onChange={(e) => setExtendedDiagnostic(e.target.value)}
            placeholder="Enter technician diagnostic..."
            readOnly={isEditMode}
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

        {/* Table of items with data-label attributes for responsiveness */}
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
                {parts.map((p, idx) => (
                  <tr key={`p-${idx}`}>
                    <td data-label="TYPE">[PART]</td>
                    <td data-label="DESCRIPTION">{p.description}</td>
                    <td data-label="PART# / HOURS">
                      {p.partNumber} (QTY: {p.quantity})
                    </td>
                    <td data-label="NET / RATE">
                      ${parseFloat(p.netPrice).toFixed(2)}
                    </td>
                    <td data-label="QUANTITY">{p.quantity}</td>
                    <td data-label="LIST PRICE">
                      ${parseFloat(p.listPrice).toFixed(2)}
                    </td>
                    <td data-label="EXTENDED PRICE">
                      ${parseFloat(p.extendedPrice).toFixed(2)}
                    </td>
                    <td data-label="TAX?">{p.applyPartTax ? "Yes" : "No"}</td>
                    <td data-label="ACTION">
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
                {labors.map((l, idx) => (
                  <tr key={`l-${idx}`}>
                    <td data-label="TYPE">[LABOR]</td>
                    <td data-label="DESCRIPTION">{l.description}</td>
                    <td data-label="PART# / HOURS">{l.duration} hrs</td>
                    <td data-label="NET / RATE">
                      ${parseFloat(l.laborRate).toFixed(2)}
                    </td>
                    <td data-label="QUANTITY">{l.duration}</td>
                    <td data-label="LIST PRICE">-</td>
                    <td data-label="EXTENDED PRICE">
                      ${parseFloat(l.extendedPrice).toFixed(2)}
                    </td>
                    <td data-label="TAX?">{l.applyLaborTax ? "Yes" : "No"}</td>
                    <td data-label="ACTION">
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
                {flatFees.map((f, idx) => (
                  <tr key={`f-${idx}`}>
                    <td data-label="TYPE">[FLATFEE]</td>
                    <td data-label="DESCRIPTION">{f.description}</td>
                    <td data-label="PART# / HOURS">-</td>
                    <td data-label="NET / RATE">-</td>
                    <td data-label="QUANTITY">-</td>
                    <td data-label="LIST PRICE">-</td>
                    <td data-label="EXTENDED PRICE">
                      ${parseFloat(f.extendedPrice).toFixed(2)}
                    </td>
                    <td data-label="TAX?">No</td>
                    <td data-label="ACTION">
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

        {/* Field for description of labor or services */}
        <Form.Group className="mb-3">
          <Form.Label>Description of labor or services</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
          />
        </Form.Group>

        {/* Totals section */}
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

        {/* Buttons to save or cancel */}
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

      {/* Modal: Tax & Markup Settings */}
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
            {/* Field: Part description */}
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
            {/* Field: Part number */}
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
            {/* Field: Quantity */}
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
            {/* Field: Net Price */}
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
            {/* Field: List Price */}
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
            {/* Field: Extended Price (calculated) */}
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
                  placeholder="0"
                />
              </InputGroup>
            </Form.Group>
            {/* Checkbox: Apply tax for part */}
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
                  ? "If checked, tax will be applied even if NoTax is set."
                  : "If checked, tax will not be applied for this part."}
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
            {/* Field: Labor description */}
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
            {/* Field: Duration (hours) */}
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
            {/* Field: Labor Rate selection */}
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
            {/* Field: Extended Price (calculated) */}
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
                  placeholder="0"
                />
              </InputGroup>
            </Form.Group>
            {/* Checkbox: Apply tax for labor */}
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
                  ? "If checked, tax will be applied even if NoTax is set."
                  : "If checked, tax will not be applied for this labor."}
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
            {/* Field: Flat Fee description */}
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
            {/* Field: Flat Fee price */}
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
            {/* Field: Extended Price (calculated) */}
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
                  placeholder="0"
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
