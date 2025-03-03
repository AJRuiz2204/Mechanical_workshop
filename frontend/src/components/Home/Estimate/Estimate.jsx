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
  getEstimateById,
  updateEstimate,
  getVehicleDiagnostics, // nuevo endpoint
} from "../../../services/EstimateService";
import { getSettingsById } from "../../../services/laborTaxMarkupSettingsService";
import { getWorkshopSettings } from "../../../services/workshopSettingsService";
import "./Estimate.css";

/**
 * @component Estimate
 * @description Main component for creating and editing estimates in the application.
 * Features:
 * - Vehicle selection with diagnostic information
 * - Parts management with pricing and tax calculations
 * - Labor charges with different rates
 * - Flat fee additions
 * - Total calculations including tax
 * - PDF generation capability
 */

/**
 * Main Estimate component handling estimate creation and editing
 * @returns {JSX.Element} Rendered Estimate form
 */
const Estimate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  /**
   * @state vehicleDiagnosticOptions 
   * @description List of vehicles with their associated diagnostics
   * @type {Array<{vehicle: Object, owner: Object, diagnostic: Object, technicianDiagnostics: Array}>}
   */
  const [vehicleDiagnosticOptions, setVehicleDiagnosticOptions] = useState([]);
  /**
   * @state selectedOption
   * @description Currently selected vehicle diagnostic option
   * @type {Object|null}
   */
  const [selectedOption, setSelectedOption] = useState(null);
  // Estos estados se asignan al seleccionar una opción
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [owner, setOwner] = useState(null);
  const [diagnostic, setDiagnostic] = useState(null);
  const [extendedDiagnostic, setExtendedDiagnostic] = useState("");

  // States for data, UI, and calculations
  const [isLoading, setIsLoading] = useState(true);
  /**
   * @state parts
   * @description List of parts added to the estimate
   * @type {Array<{
   *   description: string,
   *   partNumber: string,
   *   quantity: number,
   *   netPrice: number,
   *   listPrice: number,
   *   extendedPrice: number,
   *   applyPartTax: boolean
   * }>}
   */
  const [parts, setParts] = useState([]);
  /**
   * @state labors
   * @description List of labor charges added to the estimate
   * @type {Array<{
   *   description: string,
   *   duration: number,
   *   laborRate: number,
   *   extendedPrice: number,
   *   applyLaborTax: boolean
   * }>}
   */
  const [labors, setLabors] = useState([]);
  /**
   * @state flatFees
   * @description List of flat fees added to the estimate
   * @type {Array<{
   *   description: string,
   *   flatFeePrice: number,
   *   extendedPrice: number
   * }>}
   */
  const [flatFees, setFlatFees] = useState([]);
  const [customerNote, setCustomerNote] = useState("");
  const [authorizationStatus, setAuthorizationStatus] = useState("Pending");
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
   * @effect
   * @description Loads initial data when component mounts:
   * - Workshop settings
   * - Tax and markup settings
   * - Vehicle diagnostics
   * - Existing estimate data (in edit mode)
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get workshop settings
        const shopData = await getWorkshopSettings();
        console.log("Payload workshop settings:", shopData);
        setWorkshopSettings(shopData);

        // Get tax and markup settings
        const cfg = await getSettingsById(1);
        console.log("Payload tax & markup settings:", cfg);
        setSettings(cfg);

        // Usar el endpoint que trae vehículos con sus diagnósticos
        const vDiagnostics = await getVehicleDiagnostics();
        console.log("Payload vehicle diagnostics:", vDiagnostics);
        const options = [];
        vDiagnostics.forEach((vd) => {
          if (vd.diagnostics && vd.diagnostics.length > 0) {
            vd.diagnostics.forEach((diag) => {
              // Filtrar technicianDiagnostics válidos (extendedDiagnostic no vacío)
              const validTechs = diag.technicianDiagnostics.filter(
                (td) =>
                  td.extendedDiagnostic && td.extendedDiagnostic.trim() !== ""
              );
              if (validTechs.length > 0) {
                // Agregar una opción por cada diagnóstico válido
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
          console.log("Payload estimate (edit mode):", estimateData);
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
          setParts(estimateData.parts || []);
          setLabors(estimateData.labors || []);
          setFlatFees(estimateData.flatFees || []);
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
   * @effect
   * @description Recalculates totals whenever parts, labors, or flat fees change
   * Updates:
   * - Subtotal
   * - Tax amount
   * - Total amount
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
   * @function handleOptionChange
   * @description Handles selection of a vehicle diagnostic option
   * @param {Event} e - Change event from select element
   */
  const handleOptionChange = (e) => {
    const optionIndex = e.target.value;
    if (!optionIndex || optionIndex === "") {
      setError("Select a valid option.");
      setSelectedOption(null);
      return;
    }
    const selected = vehicleDiagnosticOptions[optionIndex];
    setSelectedOption(selected);
    setSelectedVehicle(selected.vehicle);
    setOwner(selected.owner);
    setDiagnostic(selected.diagnostic);
    // Se toma el extendedDiagnostic del primer TechnicianDiagnostic válido
    setExtendedDiagnostic(
      selected.technicianDiagnostics[0].extendedDiagnostic || ""
    );
  };

  // Handlers for opening and closing modals
  const handleShowTaxSettingsModal = () => setShowTaxSettingsModal(true);
  const handleCloseTaxSettingsModal = () => setShowTaxSettingsModal(false);

  /**
   * handleShowPartModal: Abre el modal para agregar una nueva parte y establece los valores por defecto.
   */
  const handleShowPartModal = () => {
    const defaultTax = noTax ? false : true;
    setNewPart({
      description: "",
      partNumber: "",
      quantity: "",
      netPrice: "",
      listPrice: "",
      extendedPrice: 0,
      applyPartTax: defaultTax,
    });
    setShowPartModal(true);
  };

  /**
   * handleClosePartModal: Cierra el modal de agregar parte y resetea el estado newPart.
   */
  const handleClosePartModal = () => {
    setShowPartModal(false);
    setNewPart({
      description: "",
      partNumber: "",
      quantity: "",
      netPrice: "",
      listPrice: "",
      extendedPrice: 0,
      applyPartTax: noTax ? false : true,
    });
  };

  /**
   * handleShowLaborModal: Abre el modal para agregar labor y establece los valores por defecto.
   */
  const handleShowLaborModal = () => {
    const defaultTax = noTax ? false : true;
    let defaultRate = settings?.defaultHourlyRate || "";
    setNewLabor({
      description: "",
      duration: "",
      laborRate: defaultRate,
      extendedPrice: 0,
      applyLaborTax: defaultTax,
    });
    setShowLaborModal(true);
  };

  /**
   * handleCloseLaborModal: Cierra el modal de agregar labor y resetea el estado newLabor.
   */
  const handleCloseLaborModal = () => {
    setShowLaborModal(false);
    setNewLabor({
      description: "",
      duration: "",
      laborRate: settings?.defaultHourlyRate || "",
      extendedPrice: 0,
      applyLaborTax: noTax ? false : true,
    });
  };

  /**
   * handleShowFlatFeeModal: Abre el modal para agregar flat fee y establece los valores por defecto.
   */
  const handleShowFlatFeeModal = () => {
    setNewFlatFee({
      description: "",
      flatFeePrice: "",
      extendedPrice: 0,
    });
    setShowFlatFeeModal(true);
  };

  /**
   * handleCloseFlatFeeModal: Cierra el modal de agregar flat fee y resetea su estado.
   */
  const handleCloseFlatFeeModal = () => {
    setShowFlatFeeModal(false);
    setNewFlatFee({
      description: "",
      flatFeePrice: "",
      extendedPrice: 0,
    });
  };

  /**
   * @function addPart
   * @description Validates and adds a new part to the estimate
   * @async
   */
  const addPart = async () => {
    if (isAddingPart) return;
    // Validar que los campos numéricos no sean vacíos
    if (
      newPart.quantity === "" ||
      newPart.netPrice === "" ||
      newPart.listPrice === ""
    ) {
      setError("Quantity, Net Price and List Price are required.");
      return;
    }
    try {
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
      setParts([...parts, { ...newPart }]);
      setNewPart({
        description: "",
        partNumber: "",
        quantity: "",
        netPrice: "",
        listPrice: "",
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
   * @function addLabor
   * @description Validates and adds a new labor charge to the estimate
   */
  const addLabor = () => {
    if (!newLabor.description || newLabor.duration === "" || parseFloat(newLabor.duration) <= 0) {
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
   * @function addFlatFee
   * @description Validates and adds a new flat fee to the estimate
   */
  const addFlatFee = () => {
    if (!newFlatFee.description || newFlatFee.flatFeePrice === "" || parseFloat(newFlatFee.flatFeePrice) <= 0) {
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
   * @function removeItem
   * @description Removes an item from parts, labors, or flat fees
   * @param {string} type - Type of item ("PART", "LABOR", or "FLATFEE")
   * @param {number} idx - Index of item in its respective array
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
   * @function handleSave
   * @description Validates and saves the estimate
   * @param {Event} e - Form submission event
   * @async
   */
  const handleSave = async (e) => {
    e.preventDefault();

    if (!isEditMode && (!selectedOption || selectedOption === "")) {
      setError("Please select a vehicle.");
      return;
    }

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

    const dto = {
      VehicleID: !isEditMode
        ? parseInt(selectedOption.vehicle.id, 10)
        : parseInt(selectedVehicle.id, 10) || 0,
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
        const created = await createEstimate(dto);
        console.log("Payload createEstimate:", created);
        setSuccess(`Estimate created successfully with ID: ${created.ID}`);
        navigate("/estimates");
      } else {
        const updateDto = { ID: parseInt(id, 10), ...dto };
        const updated = await updateEstimate(id, updateDto);
        console.log("Payload updateEstimate:", updated);
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
   * @computed combinedItems
   * @description Combines parts, labors, and flat fees into a single array
   * @type {Array<{
   *   type: string,
   *   description: string,
   *   quantity: number|string,
   *   price: number,
   *   listPrice: string|number,
   *   extendedPrice: number,
   *   taxable: boolean,
   *   partNumber: string
   * }>}
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
        listPrice: "",
        extendedPrice: l.extendedPrice,
        taxable: l.applyLaborTax,
        partNumber: "",
      })),
      ...flatFees.map((f) => ({
        type: "Flat Fee",
        description: f.description,
        quantity: "-",
        price: f.flatFeePrice,
        listPrice: "",
        extendedPrice: f.extendedPrice,
        taxable: false,
        partNumber: "",
      })),
    ];
  }, [parts, labors, flatFees]);

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

      <div className="text-end mb-3">
        <Button variant="info" onClick={handleShowTaxSettingsModal}>
          View Tax &amp; Markup Settings
        </Button>
      </div>

      <Form onSubmit={handleSave}>
        {/* Dropdown: Selección de opción de vehículo con diagnóstico extendido */}
        {!isEditMode && (
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group controlId="vehicleDiagnosticSelect">
                <Form.Label>
                  Select Vehicle (only those with TechnicianDiagnostic)
                </Form.Label>
                <Form.Control
                  as="select"
                  onChange={handleOptionChange}
                  required
                >
                  <option value="">-- Select Option --</option>
                  {vehicleDiagnosticOptions.map((opt, index) => (
                    <option key={index} value={index}>
                      {`${opt.vehicle.vin} - ${opt.owner.name} ${opt.owner.lastName} - Diagnostic ID: ${opt.diagnostic.diagnosticId} - Extended: ${opt.technicianDiagnostics[0].extendedDiagnostic}`}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="authorizationStatus">
                <Form.Label>Authorization Status</Form.Label>
                <Form.Control
                  as="select"
                  value={"Pending"}
                  onChange={(e) => {}}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Not aproved">Not aproved</option>
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
                    {owner && (
                      <ListGroup.Item>
                        <strong>Workshop:</strong> {owner.name} {owner.lastName}{" "}
                        - {owner.email}
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}

        {/* Edit Mode: Información adicional en edición */}
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
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Not aproved">Not aproved</option>
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
        )}

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

        {/* Botones para agregar items */}
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

        {/* Tabla de items */}
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

        {/* Campo para la descripción de labor o servicios */}
        <Form.Group className="mb-3">
          <Form.Label>Description of labor or services</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
          />
        </Form.Group>

        {/* Sección de Totales */}
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

        {/* Botones para guardar o cancelar */}
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
      <Modal centered show={showTaxSettingsModal} onHide={handleCloseTaxSettingsModal} size="sm">
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
      <Modal centered show={showPartModal} onHide={handleClosePartModal} size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Add Part</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
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
            <Form.Group className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={newPart.quantity}
                onChange={(e) => {
                  const qty = e.target.value;
                  const parsedQty = qty === "" ? "" : parseInt(qty, 10);
                  const list = newPart.listPrice === "" ? 0 : parseFloat(newPart.listPrice);
                  setNewPart({
                    ...newPart,
                    quantity: qty,
                    extendedPrice: qty === "" ? 0 : list * parsedQty,
                  });
                }}
                placeholder="Quantity"
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Net Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  type="number"
                  step="0.01"
                  value={newPart.netPrice}
                  onChange={(e) => {
                    const price = e.target.value;
                    setNewPart({
                      ...newPart,
                      netPrice: price,
                    });
                  }}
                  placeholder="Net Price"
                  required
                />
              </InputGroup>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>List Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  type="number"
                  step="0.01"
                  value={newPart.listPrice}
                  onChange={(e) => {
                    const price = e.target.value;
                    const parsedPrice = price === "" ? "" : parseFloat(price);
                    const qty = newPart.quantity === "" ? 0 : parseInt(newPart.quantity, 10);
                    setNewPart({
                      ...newPart,
                      listPrice: price,
                      extendedPrice: newPart.quantity === "" ? 0 : parsedPrice * qty,
                    });
                  }}
                  placeholder="List Price"
                  required
                />
              </InputGroup>
            </Form.Group>
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
      <Modal centered show={showLaborModal} onHide={handleCloseLaborModal} size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Add Labor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
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
            <Form.Group className="mb-2">
              <Form.Label>Duration (hours)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={newLabor.duration}
                onChange={(e) => {
                  const dur = e.target.value;
                  const parsedDur = dur === "" ? "" : parseFloat(dur);
                  const rate = newLabor.laborRate === "" ? 0 : parseFloat(newLabor.laborRate);
                  setNewLabor({
                    ...newLabor,
                    duration: dur,
                    extendedPrice: dur === "" ? 0 : parsedDur * rate,
                  });
                }}
                placeholder="Hours"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Labor Rate</Form.Label>
              <Form.Select
                value={newLabor.laborRate}
                onChange={(e) => {
                  const rate = e.target.value;
                  const parsedRate = rate === "" ? "" : parseFloat(rate);
                  const dur = newLabor.duration === "" ? 0 : parseFloat(newLabor.duration);
                  setNewLabor({
                    ...newLabor,
                    laborRate: rate,
                    extendedPrice: newLabor.duration === "" ? 0 : dur * parsedRate,
                  });
                }}
              >
                {settings ? (
                  <>
                    <option value={settings.hourlyRate1}>Rate1: {settings.hourlyRate1}</option>
                    <option value={settings.hourlyRate2}>Rate2: {settings.hourlyRate2}</option>
                    <option value={settings.hourlyRate3}>Rate3: {settings.hourlyRate3}</option>
                    <option value={settings.defaultHourlyRate}>Default: {settings.defaultHourlyRate}</option>
                  </>
                ) : (
                  <option value={140}>$140 (fallback)</option>
                )}
              </Form.Select>
            </Form.Group>
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
      <Modal centered show={showFlatFeeModal} onHide={handleCloseFlatFeeModal} size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Add Flat Fee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
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
            <Form.Group className="mb-3">
              <Form.Label>Flat Fee Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  type="number"
                  step="0.01"
                  value={newFlatFee.flatFeePrice}
                  onChange={(e) => {
                    const val = e.target.value;
                    const parsedVal = val === "" ? "" : parseFloat(val);
                    setNewFlatFee({
                      ...newFlatFee,
                      flatFeePrice: val,
                      extendedPrice: val === "" ? 0 : parsedVal,
                    });
                  }}
                  placeholder="Flat Fee Price"
                  required
                />
              </InputGroup>
            </Form.Group>
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
