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
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import {
  createEstimate,
  getAllVehicles,
  getVehicleById,
  getEstimateById,
  updateEstimate,
} from "../../../services/EstimateService";
import { getSettingsById } from "../../../services/laborTaxMarkupSettingsService";

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
          const existingEstimate = await getEstimateById(id);

          setParts(existingEstimate.parts || []);
          setLabors(existingEstimate.labors || []);
          setFlatFees(existingEstimate.flatFees || []);
          setCustomerNote(existingEstimate.customerNote || "");
          setExtendedDiagnostic(existingEstimate.extendedDiagnostic || "");
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
            }
          }
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
      // If the workshop is noTax => everything defaults to no taxes
      setNoTax(vehData.userWorkshop.noTax);
    } catch (err) {
      setError("Error fetching vehicle details: " + err.message);
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
    // If noTax => default checkbox = false
    // else => default = true to reflect "Taxable" scenario
    // BUT we can also consider the DB config partTaxByDefault
    // final logic: if noTax => false, else => true
    const defaultTax = noTax ? false : true;

    // If you want to honor "partTaxByDefault" from DB:
    //   const defaultTax = noTax ? false : settings ? settings.partTaxByDefault : false;

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
    // If noTax => defaultTax = false
    // else => true
    const defaultTax = noTax ? false : true;

    // If you want to honor "laborTaxByDefault" from DB:
    //   const defaultTax = noTax ? false : settings ? settings.laborTaxByDefault : false;

    // Also set a default laborRate => defaultHourlyRate from DB if you want
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
    // If we want a "applyFlatFeeTax" => set default here
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
  const addPart = () => {
    if (!newPart.description || !newPart.partNumber) {
      setError("Please fill out all part fields.");
      return;
    }

    const q = parseFloat(newPart.quantity) || 1;
    let finalListPrice = parseFloat(newPart.listPrice) || 0;

    // If there's a markup from DB
    if (settings && settings.partMarkup > 0) {
      finalListPrice *= 1 + settings.partMarkup / 100;
    }
    const ext = finalListPrice * q;

    const newItem = {
      ...newPart,
      quantity: q,
      listPrice: finalListPrice,
      extendedPrice: ext,
    };

    const updatedParts = [...parts, newItem];
    setParts(updatedParts);
    calculateTotals(updatedParts, labors, flatFees);

    setError(null);
    handleClosePartModal();
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
    calculateTotals(parts, updatedLabors, flatFees);

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
    calculateTotals(parts, labors, updatedFlatFees);

    setError(null);
    handleCloseFlatFeeModal();
  };

  //------------------------------------------------------------
  // REMOVE ITEM
  //------------------------------------------------------------
  const removeItem = (type, idx) => {
    let updatedParts = [...parts];
    let updatedLabors = [...labors];
    let updatedFlatFees = [...flatFees];

    if (type === "PART") {
      updatedParts.splice(idx, 1);
      setParts(updatedParts);
    } else if (type === "LABOR") {
      updatedLabors.splice(idx, 1);
      setLabors(updatedLabors);
    } else if (type === "FLATFEE") {
      updatedFlatFees.splice(idx, 1);
      setFlatFees(updatedFlatFees);
    }

    calculateTotals(updatedParts, updatedLabors, updatedFlatFees);
  };

  //------------------------------------------------------------
  // CALCULATE TOTALS
  //------------------------------------------------------------
  const calculateTotals = (currentParts, currentLabors, currentFlatFees) => {
    const partSub = currentParts.reduce((acc, p) => acc + p.extendedPrice, 0);
    const laborSub = currentLabors.reduce((acc, l) => acc + l.extendedPrice, 0);
    const feeSub = currentFlatFees.reduce((acc, f) => acc + f.extendedPrice, 0);

    const newSubtotal = partSub + laborSub + feeSub;
    let newTax = 0;

    if (settings) {
      // PARTS: check "applyPartTax"
      const partRate = parseFloat(settings.partTaxRate) / 100 || 0;
      const partTaxable = currentParts.filter((p) => p.applyPartTax === true);
      const partTaxAmount = partTaxable.reduce(
        (acc, p) => acc + p.extendedPrice * partRate,
        0
      );

      // LABORS: check "applyLaborTax"
      const laborRate = parseFloat(settings.laborTaxRate) / 100 || 0;
      const laborTaxable = currentLabors.filter(
        (l) => l.applyLaborTax === true
      );
      const laborTaxAmount = laborTaxable.reduce(
        (acc, l) => acc + l.extendedPrice * laborRate,
        0
      );

      // FlatFee if you want it: you can define "applyFlatFeeTax"
      // For now, skip

      // sum them
      newTax = partTaxAmount + laborTaxAmount;
    }

    // If workshop is "NoTax" => the default is user sets apply*Tax = false
    // But if user manually checked => we do the override as above
    // So no additional logic needed. The item checkboxes decide.

    const newTotal = newSubtotal + newTax;

    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  };

  //------------------------------------------------------------
  // SAVE ESTIMATE
  //------------------------------------------------------------
  const handleSave = async () => {
    if (!selectedVehicleId) {
      setError("Please select a vehicle.");
      return;
    }
    if (parts.length === 0 && labors.length === 0 && flatFees.length === 0) {
      setError("Add at least one item to the Estimate.");
      return;
    }

    const estimateData = {
      VehicleID: parseInt(selectedVehicleId),
      CustomerNote: customerNote,
      ExtendedDiagnostic: extendedDiagnostic,
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
        // store "taxable" or "applyPartTax" => same meaning in DB
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
        // if you had a checkbox => taxable: f.applyFlatFeeTax
      })),
    };

    try {
      if (isEditMode) {
        await updateEstimate(id, estimateData);
        setSuccess(`Estimate with ID ${id} updated successfully.`);
        navigate("/estimates");
      } else {
        const created = await createEstimate(estimateData);
        setSuccess(`Estimate created successfully with ID: ${created.ID}`);

        // reset
        setParts([]);
        setLabors([]);
        setFlatFees([]);
        setCustomerNote("");
        setExtendedDiagnostic("");
        setSubtotal(0);
        setTax(0);
        setTotal(0);
        setSelectedVehicleId("");
        setSelectedVehicle(null);
        setOwner(null);
        setNoTax(false);
        setAuthorizationStatus("InReview");

        navigate("/estimates");
      }
      setError(null);
    } catch (err) {
      setError("Error saving the Estimate: " + err.message);
      setSuccess(null);
    }
  };

  //------------------------------------------------------------
  // RENDER
  //------------------------------------------------------------
  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "70vh" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading Estimate...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded">
      <h4>{isEditMode ? "Edit Estimate" : "Create Estimate"}</h4>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Button: View Tax & Markup Settings */}
      <div className="text-end mb-3">
        <Button variant="info" onClick={handleShowTaxSettingsModal}>
          View Tax & Markup Settings
        </Button>
      </div>

      {/* Vehicle selection */}
      <Form.Group className="mb-3">
        <Form.Label>Select Vehicle (VIN)</Form.Label>
        {!isEditMode ? (
          <Form.Control
            as="select"
            value={selectedVehicleId}
            onChange={handleVehicleChange}
          >
            <option value="">-- Select a VIN --</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vin}
              </option>
            ))}
          </Form.Control>
        ) : (
          <Form.Control
            type="text"
            readOnly
            value={selectedVehicle ? selectedVehicle.vin : ""}
          />
        )}
      </Form.Group>

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

      {/* Buttons to add items */}
      <div className="mb-3">
        <Button
          variant="primary"
          className="me-2"
          onClick={handleShowPartModal}
          disabled={!selectedVehicleId && !isEditMode}
        >
          Add Part
        </Button>
        <Button
          variant="primary"
          className="me-2"
          onClick={handleShowLaborModal}
          disabled={!selectedVehicleId && !isEditMode}
        >
          Add Labor
        </Button>
        <Button
          variant="primary"
          onClick={handleShowFlatFeeModal}
          disabled={!selectedVehicleId && !isEditMode}
        >
          Add Flat Fee
        </Button>
      </div>

      {/* MAIN TABLE */}
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
                  &times;
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
                  &times;
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
                  &times;
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Extended Diagnostic */}
      <Form.Group className="mb-3">
        <Form.Label>Extended Diagnostic</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={extendedDiagnostic}
          onChange={(e) => setExtendedDiagnostic(e.target.value)}
        />
      </Form.Group>

      {/* Customer Note */}
      <Form.Group className="mb-3">
        <Form.Label>Customer Note</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={customerNote}
          onChange={(e) => setCustomerNote(e.target.value)}
        />
      </Form.Group>

      {/* Authorization Status */}
      <Form.Group className="mb-3">
        <Form.Label>Authorization Status</Form.Label>
        <Form.Select
          value={authorizationStatus}
          onChange={(e) => setAuthorizationStatus(e.target.value)}
        >
          <option value="InReview">InReview</option>
          <option value="Authorized">Authorized</option>
          <option value="Denied">Denied</option>
        </Form.Select>
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

      {/* Buttons to Save or Cancel */}
      <div className="text-end mt-3">
        <Button
          variant="secondary"
          className="me-2"
          onClick={() => navigate("/estimates")}
        >
          Cancel
        </Button>
        <Button variant="success" onClick={handleSave}>
          {isEditMode ? "Update" : "Save"}
        </Button>
      </div>

      {/* =========== MODAL: TAX SETTINGS =========== */}
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
            {/* DESCRIPTION */}
            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={newPart.description}
                onChange={(e) =>
                  setNewPart({ ...newPart, description: e.target.value })
                }
                placeholder="Part description"
              />
            </Form.Group>

            {/* PART NUMBER */}
            <Form.Group className="mb-2">
              <Form.Label>Part Number</Form.Label>
              <Form.Control
                type="text"
                value={newPart.partNumber}
                onChange={(e) =>
                  setNewPart({ ...newPart, partNumber: e.target.value })
                }
                placeholder="Part #"
              />
            </Form.Group>

            {/* QUANTITY */}
            <Form.Group className="mb-2">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={newPart.quantity}
                onChange={(e) => {
                  const q = parseFloat(e.target.value) || 1;
                  const ext = newPart.listPrice * q;
                  setNewPart({ ...newPart, quantity: q, extendedPrice: ext });
                }}
              />
            </Form.Group>

            {/* NET PRICE */}
            <Form.Group className="mb-2">
              <Form.Label>Net Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  type="number"
                  step="0.01"
                  value={newPart.netPrice}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setNewPart({ ...newPart, netPrice: val });
                  }}
                />
              </InputGroup>
            </Form.Group>

            {/* LIST PRICE */}
            <Form.Group className="mb-2">
              <Form.Label>List Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  type="number"
                  step="0.01"
                  value={newPart.listPrice}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    const ext = val * newPart.quantity;
                    setNewPart({
                      ...newPart,
                      listPrice: val,
                      extendedPrice: ext,
                    });
                  }}
                />
              </InputGroup>
            </Form.Group>

            {/* EXTENDED PRICE (read-only) */}
            <Form.Group className="mb-2">
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

            {/* TAX CHECKBOX */}
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
          <Button variant="primary" onClick={addPart}>
            Add Part
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
            {/* DESCRIPTION */}
            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={newFlatFee.description}
                onChange={(e) =>
                  setNewFlatFee({ ...newFlatFee, description: e.target.value })
                }
                placeholder="Flat fee description"
              />
            </Form.Group>

            {/* FLAT FEE PRICE */}
            <Form.Group className="mb-2">
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
                />
              </InputGroup>
            </Form.Group>

            {/* EXTENDED PRICE (readonly) */}
            <Form.Group className="mb-2">
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

            {/* If you want "Apply Tax?" for FlatFee, add a checkbox here */}
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
    </div>
  );
};

export default Estimate;
