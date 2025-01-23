/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo, useRef } from "react";
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
import { PDFDownloadLink } from "@react-pdf/renderer";
import EstimatePDF from "./EstimatePDF";

const Estimate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

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

  const [showTaxSettingsModal, setShowTaxSettingsModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);
  const [showLaborModal, setShowLaborModal] = useState(false);
  const [showFlatFeeModal, setShowFlatFeeModal] = useState(false);

  const [pdfTotals, setPdfTotals] = useState({
    partsTotal: 0,
    laborTotal: 0,
    othersTotal: 0,
    partsTax: 0,
    laborTax: 0,
    total: 0,
  });

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

  const [generatedPdfData, setGeneratedPdfData] = useState(null);

  const pdfContainerRef = useRef(null);

  useEffect(() => {
    if (generatedPdfData && pdfContainerRef.current) {
      const linkElement = pdfContainerRef.current.querySelector("a");
      if (linkElement) {
        linkElement.click();
      }
    }
  }, [generatedPdfData]);

  const handleDownloadPDF = () => {
    const itemsPayload = [
      ...parts.map((p) => ({
        type: "Part",
        description: p.description,
        quantity: p.quantity,
        price: p.netPrice,
        listPrice: p.listPrice,
        extended: p.extendedPrice,
        taxable: p.applyPartTax,
        partNumber: p.partNumber,
      })),
      ...labors.map((l) => ({
        type: "Labor",
        description: l.description,
        quantity: l.duration,
        price: l.laborRate,
        extended: l.extendedPrice,
        taxable: l.applyLaborTax,
      })),
      ...flatFees.map((f) => ({
        type: "Flat Fee",
        description: f.description,
        quantity: "-",
        price: f.flatFeePrice,
        extended: f.extendedPrice,
        taxable: false,
        partNumber: "",
      })),
    ];
    const payload = {
      workshopData: workshopSettings,
      vehicle: selectedVehicle,
      customer: owner,
      items: itemsPayload,
      totals: pdfTotals,
      customerNote,
    };
    setGeneratedPdfData(payload);
  };

  // Cargar la configuración y el Estimate si es edición
  useEffect(() => {
    const loadData = async () => {
      try {
        const shopData = await getWorkshopSettings();
        setWorkshopSettings(shopData);

        const cfg = await getSettingsById(1);
        setSettings(cfg);

        const vList = await getAllVehicles();
        setVehicles(vList);

        if (isEditMode) {
          const estimateData = await getEstimateById(id);
          setSelectedVehicle(estimateData.vehicle);
          setOwner(estimateData.owner);
          setParts(estimateData.parts);
          setLabors(estimateData.labors);
          setFlatFees(estimateData.flatFees);
          setDiagnostic(estimateData.technicianDiagnostic);
          setExtendedDiagnostic(estimateData.technicianDiagnostic?.extendedDiagnostic || "");
          setCustomerNote(estimateData.customerNote || "");
          setSubtotal(estimateData.subtotal || 0);
          setTax(estimateData.tax || 0);
          setTotal(estimateData.total || 0);
          setAuthorizationStatus(estimateData.authorizationStatus || "InReview");
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

  // Calcular totales en cada cambio de parts/labors/flatFees
  useEffect(() => {
    if (!settings) return;
    let partsTotal = 0;
    let taxParts = 0;
    let laborTotal = 0;
    let taxLabors = 0;
    let othersTotal = 0;

    parts.forEach((part) => {
      partsTotal += parseFloat(part.extendedPrice) || 0;
      if (part.applyPartTax) {
        taxParts +=
          (parseFloat(part.extendedPrice) || 0) *
          (parseFloat(settings.partTaxRate) / 100);
      }
    });

    labors.forEach((labor) => {
      laborTotal += parseFloat(labor.extendedPrice) || 0;
      if (labor.applyLaborTax) {
        taxLabors +=
          (parseFloat(labor.extendedPrice) || 0) *
          (parseFloat(settings.laborTaxRate) / 100);
      }
    });

    flatFees.forEach((fee) => {
      othersTotal += parseFloat(fee.extendedPrice) || 0;
    });

    const totalCalc =
      partsTotal + laborTotal + othersTotal + taxParts + taxLabors;

    setPdfTotals({
      partsTotal,
      laborTotal,
      othersTotal,
      partsTax: taxParts,
      laborTax: taxLabors,
      total: totalCalc,
    });

    setSubtotal(partsTotal + laborTotal + othersTotal);
    setTax(taxParts + taxLabors);
    setTotal(totalCalc);
  }, [parts, labors, flatFees, settings]);

  const handleVehicleChange = async (e) => {
    const vehicleId = e.target.value; // Mantener como string
    if (!vehicleId || parseInt(vehicleId, 10) <= 0) {
      setError("Selecciona un vehículo válido (ID > 0).");
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

    if (!vehicleId) {
      setSelectedVehicle(null);
      setOwner(null);
      setNoTax(false);
      return;
    }
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

  // Modales para Tax Settings
  const handleShowTaxSettingsModal = () => setShowTaxSettingsModal(true);
  const handleCloseTaxSettingsModal = () => setShowTaxSettingsModal(false);

  // Modales para items
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
      applyPartTax: noTax ? false : true, // Establecer según noTax
    });
  };
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
      applyLaborTax: noTax ? false : true, // Establecer según noTax
    });
  };
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

  // Añadir Part
  const addPart = async () => {
    if (isAddingPart) return;
    setIsAddingPart(true);
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
        quantity: 1,
        netPrice: 0,
        listPrice: 0,
        extendedPrice: 0,
        applyPartTax: noTax ? false : true,
      });
      setSuccess("Part added successfully.");
      setShowPartModal(false);
      setError(null); // Limpiar errores
    } catch (err) {
      setError("Error adding the part.");
    } finally {
      setIsAddingPart(false);
    }
  };

  // Añadir Labor
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

  // Añadir FlatFee
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

  // Eliminar item
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

  // Guardar
  const handleSave = async (e) => {
    e.preventDefault();

    // Validar que se haya seleccionado un vehículo solo en modo creación
    if (!isEditMode && (!selectedVehicleId || selectedVehicleId === "")) {
      setError("Por favor, seleccione un vehículo.");
      return;
    }

    // Validaciones básicas
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

    // Modo creación
    if (!isEditMode) {
      const vehicleIdParsed = parseInt(selectedVehicleId, 10);
      if (!vehicleIdParsed || vehicleIdParsed <= 0) {
        setError("Vehicle ID must be greater than 0.");
        return;
      }
      // Armar objeto estilo CreateDto
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
        navigate("/estimates");
      } catch (err) {
        setError(err.message || "Error creating the estimate.");
      } finally {
        setSaving(false);
      }
    }
    // Modo edición
    else {
      const updateDto = {
        ID: parseInt(id, 10),
        VehicleID: selectedVehicle ? parseInt(selectedVehicleId, 10) || 0 : 0, // Asegurar que sea número
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
        navigate("/estimates");
      } catch (err) {
        setError(err.message || "Error updating the estimate.");
      } finally {
        setSaving(false);
      }
    }
  };

  // Para la vista previa del PDF
  const combinedItems = useMemo(() => {
    return [
      ...parts.map((p) => ({
        type: "Part",
        description: p.description,
        quantity: p.quantity,
        price: p.netPrice,
        listPrice: p.listPrice,
        extended: p.extendedPrice,
        taxable: p.applyPartTax,
        partNumber: p.partNumber,
      })),
      ...labors.map((l) => ({
        type: "Labor",
        description: l.description,
        quantity: l.duration,
        price: l.laborRate,
        extended: l.extendedPrice,
        taxable: l.applyLaborTax,
      })),
      ...flatFees.map((f) => ({
        type: "Flat Fee",
        description: f.description,
        quantity: "-",
        price: f.flatFeePrice,
        extended: f.extendedPrice,
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
    <Container className="p-4 border rounded mt-4">
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
          View Tax & Markup Settings
        </Button>
      </div>

      <Form onSubmit={handleSave}>
        {/* ---------------------------------------------
            Modo CREACIÓN => Elegir Vehículo, etc.
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
            Modo EDICIÓN => Muestra info del Vehicle y Owner
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
            readOnly={isEditMode} // Considera eliminar si deseas permitir la edición
          />
        </Form.Group>

        {/* Botones para añadir items */}
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

        {/* Lista de Items */}
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
                  <th>LIST</th>
                  <th>EXTENDED</th>
                  <th>TAX?</th>
                  <th>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {parts.map((p, idx) => (
                  <tr key={`p-${idx}`}>
                    <td>[PART]</td>
                    <td>{p.description}</td>
                    <td>
                      {p.partNumber} (QTY: {p.quantity})
                    </td>
                    <td>${parseFloat(p.netPrice).toFixed(2)}</td>
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
                {labors.map((l, idx) => (
                  <tr key={`l-${idx}`}>
                    <td>[LABOR]</td>
                    <td>{l.description}</td>
                    <td>{l.duration} hrs</td>
                    <td>${parseFloat(l.laborRate).toFixed(2)}</td>
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
                {flatFees.map((f, idx) => (
                  <tr key={`f-${idx}`}>
                    <td>[FLATFEE]</td>
                    <td>{f.description}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>${parseFloat(f.flatFeePrice).toFixed(2)}</td>
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

        {/* Nota para el cliente */}
        <Form.Group className="mb-3">
          <Form.Label>Description of labor or services</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
          />
        </Form.Group>

        {/* Totales */}
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

        {/* Botones finales */}
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

            <Button
              variant="success"
              className="me-2"
              onClick={handleDownloadPDF}
              disabled={!workshopSettings || !selectedVehicle || !owner}
            >
              Descargar PDF
            </Button>
            <div style={{ display: "none" }} ref={pdfContainerRef}>
              {generatedPdfData && (
                <PDFDownloadLink
                  document={<EstimatePDF pdfData={generatedPdfData} />}
                  fileName={`Estimate_${id || "New"}.pdf`}
                >
                  Oculto
                </PDFDownloadLink>
              )}
            </div>

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
                  const qty = parseInt(e.target.value, 10) || 1;
                  const ext = newPart.netPrice * qty;
                  setNewPart((prev) => ({
                    ...prev,
                    quantity: qty,
                    extendedPrice: ext,
                  }));
                }}
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
                    const price = parseFloat(e.target.value) || 0;
                    const ext = price * newPart.quantity;
                    setNewPart((prev) => ({
                      ...prev,
                      netPrice: price,
                      extendedPrice: ext,
                    }));
                  }}
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
                    const price = parseFloat(e.target.value) || 0;
                    const ext = price * newPart.quantity;
                    setNewPart((prev) => ({
                      ...prev,
                      listPrice: price,
                      extendedPrice: ext,
                    }));
                  }}
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
                  value={newPart.extendedPrice}
                  readOnly
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
                  ? "Si marcas esta casilla, se aplicará el impuesto incluso si el perfil tiene NoTax."
                  : "Si marcas esta casilla, no se aplicará el impuesto para este ítem."}
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
                  const dur = parseFloat(e.target.value) || 0;
                  setNewLabor((prev) => ({
                    ...prev,
                    duration: dur,
                    extendedPrice: dur * prev.laborRate,
                  }));
                }}
              />
            </Form.Group>
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
            <Form.Group className="mb-2">
              <Form.Label>Extended Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  type="number"
                  step="0.01"
                  value={newLabor.extendedPrice}
                  readOnly
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
                  ? "Si marcas esta casilla, se aplicará el impuesto incluso si el perfil tiene NoTax."
                  : "Si marcas esta casilla, no se aplicará el impuesto para esta labor."}
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

      {/* Modal: Add FlatFee */}
      <Modal show={showFlatFeeModal} onHide={handleCloseFlatFeeModal}>
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
                    const val = parseFloat(e.target.value) || 0;
                    setNewFlatFee((prev) => ({
                      ...prev,
                      flatFeePrice: val,
                      extendedPrice: val,
                    }));
                  }}
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
                  value={newFlatFee.extendedPrice}
                  readOnly
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
