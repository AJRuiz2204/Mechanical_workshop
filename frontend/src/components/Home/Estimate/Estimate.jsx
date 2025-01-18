/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
// src/components/Estimate/Estimate.jsx

import React, { useState, useEffect } from "react";
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
  getDiagnosticByVehicleId, // Import the new function
} from "../../../services/EstimateService";
import { getSettingsById } from "../../../services/laborTaxMarkupSettingsService";
import { PDFDownloadLink } from "@react-pdf/renderer";
import EstimatePDF from "./EstimatePDF";

const Estimate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  // Loading spinner
  const [isLoading, setIsLoading] = useState(true);

  // Arrays for items + general fields
  const [parts, setParts] = useState([]);
  const [labors, setLabors] = useState([]);
  const [flatFees, setFlatFees] = useState([]);
  const [customerNote, setCustomerNote] = useState("");
  const [extendedDiagnostic, setExtendedDiagnostic] = useState("");

  // Totals
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  // Authorization status
  const [authorizationStatus, setAuthorizationStatus] = useState("InReview");

  // Vehicle selection
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [owner, setOwner] = useState(null);

  // Technician Diagnostic
  const [diagnostic, setDiagnostic] = useState(null); // New state to store the diagnostic

  // If the workshop is noTax => by default we consider no tax,
  // but user can override (see below).
  const [noTax, setNoTax] = useState(false);

  // Error / success messages
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // The modal to show the Tax & Markup info
  const [showTaxSettingsModal, setShowTaxSettingsModal] = useState(false);

  // Modals for Part / Labor / Flat Fee
  const [showPartModal, setShowPartModal] = useState(false);
  const [showLaborModal, setShowLaborModal] = useState(false);
  const [showFlatFeeModal, setShowFlatFeeModal] = useState(false);

  // The new Part data
  const [newPart, setNewPart] = useState({
    description: "",
    partNumber: "",
    quantity: 1,
    netPrice: 0,
    listPrice: 0,
    extendedPrice: 0,
    applyPartTax: false, // If true => we apply DB rate
  });

  // The new Labor data
  const [newLabor, setNewLabor] = useState({
    description: "",
    duration: 0,
    laborRate: 0,
    extendedPrice: 0,
    applyLaborTax: false, // If true => we apply DB rate
  });

  // The new FlatFee data
  const [newFlatFee, setNewFlatFee] = useState({
    description: "",
    flatFeePrice: 0,
    extendedPrice: 0,
    // applyFlatFeeTax: false, if we want that
  });

  // The settings from DB
  const [settings, setSettings] = useState(null);

  // New state to handle loading state when adding a part
  const [isAddingPart, setIsAddingPart] = useState(false);

  // Estado para los totales del PDF
  const [pdfTotals, setPdfTotals] = useState({
    partsTotal: 0,
    laborTotal: 0,
    othersTotal: 0,
    partsTax: 0,
    laborTax: 0,
    total: 0,
  });

  const [saving, setSaving] = useState(false);

  //------------------------------------------------------------
  // LOAD (Vehicles, existing Estimate if editing, plus Settings)
  //------------------------------------------------------------
  useEffect(() => {
    async function loadData() {
      try {
        // 1) Load the tax/markup settings from DB
        const cfg = await getSettingsById(1); // ID=1 by default
        setSettings(cfg);

        // 2) Load vehicles
        const vList = await getAllVehicles();
        setVehicles(vList);

        // 3) If editing, load existing estimate
        if (isEditMode) {
          console.log("Edit Mode: Cargando existingEstimate");
          const existingEstimate = await getEstimateById(id);
          console.log("existingEstimate:", existingEstimate);

          if (existingEstimate?.VehicleID) {
            setSelectedVehicleId(existingEstimate.VehicleID.toString());
            const vehicleData = await getVehicleById(existingEstimate.VehicleID);
            console.log("vehicleData:", vehicleData);
            console.log("vehicleData.owner:", vehicleData?.owner);

            setSelectedVehicle(vehicleData);
            setOwner(vehicleData?.owner || null);
            if (vehicleData?.owner?.noTax) {
              setNoTax(true);
            }
          }

          setParts(existingEstimate.parts || []);
          setLabors(existingEstimate.labors || []);
          setFlatFees(existingEstimate.flatFees || []);
          setCustomerNote(existingEstimate.customerNote || "");
          setExtendedDiagnostic(
            existingEstimate.technicianDiagnostic?.extendedDiagnostic || ""
          );
          setSubtotal(existingEstimate.subtotal || 0);
          setTax(existingEstimate.tax || 0);
          setTotal(existingEstimate.total || 0);
          setAuthorizationStatus(
            existingEstimate.authorizationStatus || "InReview"
          );

          if (existingEstimate.vehicle && existingEstimate.vehicle.id) {
            const vehId = existingEstimate.vehicle.id.toString();
            setSelectedVehicleId(vehId);

            const foundVeh = vList.find(
              (x) => x.id === existingEstimate.vehicle.id
            );
            if (foundVeh) {
              setSelectedVehicle(foundVeh);
              setOwner(existingEstimate.owner);
              setNoTax(existingEstimate.owner.noTax);
              console.log("Owner Data:", existingEstimate.owner); // Verificar en consola
            }
          }

          // Set the existing diagnostic
          if (existingEstimate.technicianDiagnostic) {
            setDiagnostic(existingEstimate.technicianDiagnostic);
          }
        } else {
          console.log("View Mode: Creando nueva Estimate (sin ID)");
        }
      } catch (err) {
        setError("Error loading data: " + err.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [isEditMode, id]);

  //------------------------------------------------------------
  // CALCULATE TOTALS
  //------------------------------------------------------------
  useEffect(() => {
    const calculatePdfTotals = () => {
      let partsTotal = 0;
      let taxParts = 0;
      parts.forEach((part) => {
        partsTotal += parseFloat(part.extendedPrice) || 0;
        if (part.applyPartTax && settings) {
          taxParts +=
            (parseFloat(part.extendedPrice) || 0) *
            (parseFloat(settings.partTaxRate) / 100);
        }
      });

      let laborTotal = 0;
      let taxLabors = 0;
      labors.forEach((labor) => {
        laborTotal += parseFloat(labor.extendedPrice) || 0;
        if (labor.applyLaborTax && settings) {
          taxLabors +=
            (parseFloat(labor.extendedPrice) || 0) *
            (parseFloat(settings.laborTaxRate) / 100);
        }
      });

      let othersTotal = 0;
      flatFees.forEach((fee) => {
        othersTotal += parseFloat(fee.extendedPrice) || 0;
      });

      const total =
        partsTotal + laborTotal + othersTotal + taxParts + taxLabors;

      return {
        partsTotal,
        laborTotal,
        othersTotal,
        partsTax: taxParts,
        laborTax: taxLabors,
        total,
      };
    };

    const totals = calculatePdfTotals();
    setPdfTotals(totals);

    // Además, actualiza los estados de subtotal, tax y total
    setSubtotal(totals.partsTotal + totals.laborTotal + totals.othersTotal);
    setTax(totals.partsTax + totals.laborTax);
    setTotal(totals.total);
  }, [parts, labors, flatFees, settings, noTax]);

  //------------------------------------------------------------
  // HANDLE VEHICLE SELECT
  //------------------------------------------------------------
  const handleVehicleChange = async (e) => {
    const val = e.target.value;
    setSelectedVehicleId(val);

    // Clear items if a new vehicle is selected
    setParts([]);
    setLabors([]);
    setFlatFees([]);
    setSubtotal(0);
    setTax(0);
    setTotal(0);
    setExtendedDiagnostic("");
    setDiagnostic(null); // Clear previous diagnostic

    if (!val) {
      setSelectedVehicle(null);
      setOwner(null);
      setNoTax(false);
      return;
    }

    try {
      const vehData = await getVehicleById(val);
      setSelectedVehicle(vehData);
      setOwner(vehData.userWorkshop);
      setNoTax(vehData.userWorkshop.noTax);

      // Get the diagnostic associated with the vehicle
      const fetchedDiagnostic = await getDiagnosticByVehicleId(val);
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

  //------------------------------------------------------------
  // SHOW / HIDE the Tax Settings Modal
  //------------------------------------------------------------
  const handleShowTaxSettingsModal = () => setShowTaxSettingsModal(true);
  const handleCloseTaxSettingsModal = () => setShowTaxSettingsModal(false);

  //------------------------------------------------------------
  // SHOW / HIDE PART MODAL
  //------------------------------------------------------------
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
      applyPartTax: false,
    });
  };

  //------------------------------------------------------------
  // SHOW / HIDE LABOR MODAL
  //------------------------------------------------------------
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
      laborRate: 0,
      extendedPrice: 0,
      applyLaborTax: false,
    });
  };

  //------------------------------------------------------------
  // SHOW / HIDE FLAT FEE MODAL
  //------------------------------------------------------------
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

  //------------------------------------------------------------
  // ADD PART
  //------------------------------------------------------------
  const addPart = async () => {
    if (isAddingPart) return; // Prevent multiple calls
    setIsAddingPart(true);
    try {
      // Verificar si el Part Number ya existe
      const duplicate = parts.find(
        (part) => part.partNumber === newPart.partNumber
      );
      if (duplicate) {
        setError(
          `The part with Part Number ${newPart.partNumber} already exists in this estimate.`
        );
        setIsAddingPart(false);
        return;
      }

      // Validar datos antes de agregar
      if (!newPart.description || !newPart.partNumber) {
        setError("Description and part number are required.");
        setIsAddingPart(false);
        return;
      }

      // Agregar la parte al estado
      setParts([...parts, { ...newPart }]);

      // Limpiar el formulario de la nueva parte
      setNewPart({
        description: "",
        partNumber: "",
        quantity: 1,
        netPrice: 0,
        listPrice: 0,
        extendedPrice: 0,
        applyPartTax: false,
      });

      setSuccess("Part added successfully.");
      setShowPartModal(false); // Cerrar el modal de partes
    } catch (err) {
      setError("Error adding the part.");
      console.error(err);
    } finally {
      setIsAddingPart(false);
    }
  };

  //------------------------------------------------------------
  // ADD LABOR
  //------------------------------------------------------------
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
    };

    const updatedLabors = [...labors, newItem];
    setLabors(updatedLabors);
    // Totales se recalculan mediante useEffect, no es necesario llamar a calculateTotals()

    setError(null);
    handleCloseLaborModal();
  };

  //------------------------------------------------------------
  // ADD FLAT FEE
  //------------------------------------------------------------
  const addFlatFee = () => {
    if (!newFlatFee.description || newFlatFee.flatFeePrice <= 0) {
      setError("Please fill out all flat fee fields correctly.");
      return;
    }

    const price = parseFloat(newFlatFee.flatFeePrice) || 0;
    const newItem = {
      ...newFlatFee,
      extendedPrice: price,
    };

    const updatedFlatFees = [...flatFees, newItem];
    setFlatFees(updatedFlatFees);
    // Totales se recalculan mediante useEffect, no es necesario llamar a calculateTotals()

    setError(null);
    handleCloseFlatFeeModal();
  };

  //------------------------------------------------------------
  // REMOVE ITEM
  //------------------------------------------------------------
  const removeItem = (type, idx) => {
    let updatedList = [];
    if (type === "PART") {
      updatedList = [...parts];
      updatedList.splice(idx, 1);
      setParts(updatedList);
    } else if (type === "LABOR") {
      updatedList = [...labors];
      updatedList.splice(idx, 1);
      setLabors(updatedList);
    } else if (type === "FLATFEE") {
      updatedList = [...flatFees];
      updatedList.splice(idx, 1);
      setFlatFees(updatedList);
    }
    // Totales se recalculan automáticamente mediante useEffect
  };

  //------------------------------------------------------------
  // SAVE ESTIMATE
  //------------------------------------------------------------
  const handleSave = async (e) => {
    e.preventDefault(); // Prevent default form submission
    if (!selectedVehicleId) {
      setError("Please select a vehicle.");
      return;
    }
    if (parts.length === 0 && labors.length === 0 && flatFees.length === 0) {
      setError("Add at least one item to the Estimate.");
      return;
    }

    // Verificar si hay partes duplicadas antes de enviar
    const partNumbers = parts.map((part) => part.partNumber);
    const hasDuplicates = partNumbers.some(
      (item, index) => partNumbers.indexOf(item) !== index
    );
    if (hasDuplicates) {
      setError("There are duplicate Part Numbers in the estimate.");
      return;
    }

    const combinedItems = [
      ...parts.map((p) => ({
        type: "Part",
        description: p.description,
        partNumber: p.partNumber,
        quantity: p.quantity,
        price: p.netPrice,
        listPrice: p.listPrice,
        extended: p.extendedPrice,
        taxable: p.applyPartTax ? "Yes" : "No",
      })),
      ...labors.map((l) => ({
        type: "Labor",
        description: l.description,
        duration: l.duration,
        quantity: l.duration,
        price: l.laborRate,
        extended: l.extendedPrice,
        taxable: l.applyLaborTax ? "Yes" : "No",
      })),
      ...flatFees.map((f) => ({
        type: "Flat Fee",
        description: f.description,
        partNumber: "-",
        quantity: "-",
        price: f.flatFeePrice,
        listPrice: "-",
        extended: f.extendedPrice,
        taxable: "No",
      })),
    ];

    const estimateData = {
      VehicleID: parseInt(selectedVehicleId),
      CustomerNote: customerNote,
      // Include TechnicianDiagnostic if it exists
      TechnicianDiagnostic: extendedDiagnostic
        ? {
            DiagnosticId: diagnostic?.diagnosticId || 0, // Assign 0 if it doesn't exist
            Mileage: diagnostic?.mileage || 0, // Assign 0 if it doesn't exist
            ExtendedDiagnostic: extendedDiagnostic,
          }
        : null,
      Subtotal: subtotal,
      Tax: tax,
      Total: total,
      AuthorizationStatus: authorizationStatus,
      Parts: parts.map((p) => ({
        description: p.description,
        partNumber: p.partNumber,
        quantity: p.quantity,
        netPrice: p.netPrice,
        listPrice: p.listPrice,
        extendedPrice: p.extendedPrice,
        taxable: p.applyPartTax,
      })),
      Labors: labors.map((l) => ({
        description: l.description,
        duration: l.duration,
        laborRate: l.laborRate,
        extendedPrice: l.extendedPrice,
        taxable: l.applyLaborTax,
      })),
      FlatFees: flatFees.map((f) => ({
        description: f.description,
        flatFeePrice: f.flatFeePrice,
        extendedPrice: f.extendedPrice,
        // taxable: f.applyFlatFeeTax, // Add if implemented
      })),
    };

    try {
      setSaving(true);
      if (isEditMode) {
        await updateEstimate(id, estimateData);
        setSuccess(`Estimate with ID ${id} updated successfully.`);
        navigate("/estimates");
      } else {
        const created = await createEstimate(estimateData);
        setSuccess(`Estimate created successfully with ID: ${created.ID}`);
        navigate("/estimates");
      }
      setError(null);
    } catch (err) {
      setError("Error saving the Estimate: " + err.message);
      setSuccess(null);
    } finally {
      setSaving(false);
    }
  };

  //------------------------------------------------------------
  // RENDER
  //------------------------------------------------------------
  if (isLoading) {
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

  const combinedItems = [
    ...parts.map((part) => ({
      type: "Part",
      description: part.description,
      quantity: part.quantity,
      price: part.netPrice,
      extended: part.extendedPrice,
    })),
    ...labors.map((labor) => ({
      type: "Labor",
      description: labor.description,
      quantity: labor.duration,
      price: labor.laborRate,
      extended: labor.extendedPrice,
    })),
    ...flatFees.map((fee) => ({
      type: "Flat Fee",
      description: fee.description,
      quantity: "-",
      price: fee.flatFeePrice,
      extended: fee.extendedPrice,
    })),
  ];

  return (
    <Container className="p-4 border rounded mt-4">
      <h3 className="mb-4">
        {isEditMode ? "Edit Estimate" : "Create Estimate"}
      </h3>

      {/* Mensaje de Error */}
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {/* Mensaje de Éxito */}
      {success && (
        <Alert variant="success" onClose={() => setSuccess(null)} dismissible>
          {success}
        </Alert>
      )}

      {/* Button: View Tax & Markup Settings */}
      <div className="text-end mb-3">
        <Button variant="info" onClick={handleShowTaxSettingsModal}>
          View Tax & Markup Settings
        </Button>
      </div>

      <Form onSubmit={handleSave}>
        <Row>
          {/* Selección de Vehículo */}
          <Col md={6} className="mb-3">
            <Form.Group controlId="vehicleSelect">
              <Form.Label>Select Vehicle (VIN)</Form.Label>
              <Form.Control
                as="select"
                value={selectedVehicleId}
                onChange={handleVehicleChange}
                required
                disabled={isEditMode} // Disable selection in edit mode
              >
                <option value="">-- Select Vehicle --</option>
                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {`${vehicle.vin} - ${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>

          {/* Estado de Autorización */}
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

        {/* Información del Vehículo y del Propietario */}
        {selectedVehicle && owner && (
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

        {/* Extended Diagnostic */}
        <Form.Group controlId="diagnostic" className="mb-3">
          <Form.Label>Extended Diagnostic</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={extendedDiagnostic}
            onChange={(e) => setExtendedDiagnostic(e.target.value)}
            placeholder="Enter technician diagnostic..."
            readOnly={isEditMode} // Make read-only in edit mode
          />
        </Form.Group>

        {/* Botones para Agregar Ítems */}
        <Row className="mb-3">
          <Col>
            <Button
              variant="primary"
              onClick={handleShowPartModal}
              className="me-2"
              disabled={!selectedVehicleId && !isEditMode}
            >
              Add Part
            </Button>
            <Button
              variant="secondary"
              onClick={handleShowLaborModal}
              className="me-2"
              disabled={!selectedVehicleId && !isEditMode}
            >
              Add Labor
            </Button>
            <Button
              variant="info"
              onClick={handleShowFlatFeeModal}
              disabled={!selectedVehicleId && !isEditMode}
            >
              Add Flat Fee
            </Button>
          </Col>
        </Row>

        {/* Tabla de Ítems */}
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

        {/* Customer Note */}
        <Form.Group className="mb-3">
          <Form.Label>Customer Note</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            placeholder="Enter any notes for the customer..."
          />
        </Form.Group>

        {/* Totals */}
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

        {/* Buttons to Save and Download PDF */}
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
            {settings && selectedVehicle && owner ? (
              <PDFDownloadLink
                document={
                  <EstimatePDF
                    workshopData={settings}
                    vehicle={selectedVehicle}
                    customer={owner}
                    items={combinedItems}
                    totals={pdfTotals}
                    customerNote={customerNote}
                  />
                }
                fileName={`Estimate_${id || "New"}.pdf`}
                className="btn btn-primary"
              >
                {({ loading }) =>
                  loading ? <span>Generating PDF...</span> : <span>Download PDF</span>
                }
              </PDFDownloadLink>
            ) : (
              <Button variant="primary" className="me-2" disabled>
                Download PDF
              </Button>
            )}
            <Button variant="secondary" onClick={() => navigate("/estimates")}>
              Cancel
            </Button>
          </Col>
        </Row>
      </Form>

      {/* =========== MODAL: TAX & MARKUP SETTINGS =========== */}
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

      {/* =========== MODAL: ADD PART =========== */}
      <Modal show={showPartModal} onHide={handleClosePartModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Part</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Description */}
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

            {/* Part Number */}
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

            {/* Quantity */}
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

            {/* Net Price */}
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

            {/* List Price */}
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

            {/* Extended Price (Read Only) */}
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

            {/* Taxable Checkbox */}
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
                If the workshop is NoTax, checking this box overrides it. If the
                workshop is Taxable, uncheck to remove tax for this item.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClosePartModal}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={addPart}
            disabled={isAddingPart} // Disable the button while adding
          >
            {isAddingPart ? "Adding..." : "Add Part"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* =========== MODAL: ADD LABOR =========== */}
      <Modal show={showLaborModal} onHide={handleCloseLaborModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Labor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* DESCRIPTION */}
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

            {/* DURATION */}
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

            {/* SELECT RATE */}
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

            {/* EXTENDED PRICE */}
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

            {/* TAX CHECKBOX */}
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
                If workshop is NoTax, checking this box overrides it. If
                workshop is Taxable, uncheck to remove tax for this labor.
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

      {/* =========== MODAL: ADD FLAT FEE =========== */}
      <Modal show={showFlatFeeModal} onHide={handleCloseFlatFeeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Flat Fee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Description */}
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

            {/* Flat Fee Price */}
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
                      extendedPrice: val, // same
                    }));
                  }}
                  required
                />
              </InputGroup>
            </Form.Group>

            {/* Extended Price (Read Only) */}
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
          <Button
            variant="secondary"
            onClick={handleCloseFlatFeeModal}
          >
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
