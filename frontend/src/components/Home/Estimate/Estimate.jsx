/* eslint-disable no-unused-vars */
// Frontend: src/components/Estimate/Estimate.jsx

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
} from "react-bootstrap";
import {
  createEstimate,
  getAllVehicles,
  getVehicleById,
} from "../../../services/EstimateService";

const Estimate = () => {
  // States to handle modals
  const [showPartModal, setShowPartModal] = useState(false);
  const [showLaborModal, setShowLaborModal] = useState(false);
  const [showFlatFeeModal, setShowFlatFeeModal] = useState(false);

  // States for new items
  const [newPart, setNewPart] = useState({
    description: "",
    partNumber: "",
    quantity: 1,
    netPrice: 0.0,
    listPrice: 0.0,
    extendedPrice: 0.0,
    taxable: true, // Fixed value (per item)
  });

  const [newLabor, setNewLabor] = useState({
    description: "",
    duration: 0,
    laborRate: 140.0,
    extendedPrice: 0.0,
    taxable: true, // Fixed value
  });

  const [newFlatFee, setNewFlatFee] = useState({
    description: "",
    flatFeePrice: 0.0,
    extendedPrice: 0.0,
    taxable: true, // Fixed value
  });

  // States for Estimate
  const [parts, setParts] = useState([]);
  const [labors, setLabors] = useState([]);
  const [flatFees, setFlatFees] = useState([]);
  const [customerNote, setCustomerNote] = useState("");
  const [extendedDiagnostic, setExtendedDiagnostic] = useState("");
  const [subtotal, setSubtotal] = useState(0.0);
  const [tax, setTax] = useState(0.0);
  const [total, setTotal] = useState(0.0);

  // States for vehicles
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [owner, setOwner] = useState(null);

  // Nuevo estado para noTax
  const [noTax, setNoTax] = useState(false);

  // States for error handling
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modals: mostrar/ocultar
  const handleShowPartModal = () => setShowPartModal(true);
  const handleClosePartModal = () => {
    setShowPartModal(false);
    setNewPart({
      description: "",
      partNumber: "",
      quantity: 1,
      netPrice: 0.0,
      listPrice: 0.0,
      extendedPrice: 0.0,
      taxable: true,
    });
  };

  const handleShowLaborModal = () => setShowLaborModal(true);
  const handleCloseLaborModal = () => {
    setShowLaborModal(false);
    setNewLabor({
      description: "",
      duration: 0,
      laborRate: 140.0,
      extendedPrice: 0.0,
      taxable: true,
    });
  };

  const handleShowFlatFeeModal = () => setShowFlatFeeModal(true);
  const handleCloseFlatFeeModal = () => {
    setShowFlatFeeModal(false);
    setNewFlatFee({
      description: "",
      flatFeePrice: 0.0,
      extendedPrice: 0.0,
      taxable: true,
    });
  };

  // Agregar items
  const addPart = () => {
    if (!newPart.description || !newPart.partNumber) {
      setError("Please fill out all part fields.");
      return;
    }

    const updatedParts = [...parts, { ...newPart }];
    setParts(updatedParts);
    calculateTotals(updatedParts, labors, flatFees);
    handleClosePartModal();
    setError(null);
  };

  const addLabor = () => {
    if (!newLabor.description || newLabor.duration <= 0) {
      setError("Please fill out all labor fields correctly.");
      return;
    }

    const updatedLabors = [...labors, { ...newLabor }];
    setLabors(updatedLabors);
    calculateTotals(parts, updatedLabors, flatFees);
    handleCloseLaborModal();
    setError(null);
  };

  const addFlatFee = () => {
    if (!newFlatFee.description || newFlatFee.flatFeePrice <= 0) {
      setError("Please fill out all flat fee fields correctly.");
      return;
    }

    const updatedFlatFees = [...flatFees, { ...newFlatFee }];
    setFlatFees(updatedFlatFees);
    calculateTotals(parts, labors, updatedFlatFees);
    handleCloseFlatFeeModal();
    setError(null);
  };

  // Eliminar items
  const removeItem = (type, index) => {
    let updatedParts = [...parts];
    let updatedLabors = [...labors];
    let updatedFlatFees = [...flatFees];

    if (type === "PART") {
      updatedParts.splice(index, 1);
      setParts(updatedParts);
    } else if (type === "LABOR") {
      updatedLabors.splice(index, 1);
      setLabors(updatedLabors);
    } else if (type === "FLATFEE") {
      updatedFlatFees.splice(index, 1);
      setFlatFees(updatedFlatFees);
    }

    calculateTotals(updatedParts, updatedLabors, updatedFlatFees);
  };

  // Calcular subtotal, impuesto y total
  const calculateTotals = (currentParts, currentLabors, currentFlatFees) => {
    const newSubtotal =
      currentParts.reduce(
        (acc, part) => acc + parseFloat(part.extendedPrice),
        0
      ) +
      currentLabors.reduce(
        (acc, labor) => acc + parseFloat(labor.extendedPrice),
        0
      ) +
      currentFlatFees.reduce(
        (acc, fee) => acc + parseFloat(fee.extendedPrice),
        0
      );

    let newTax = 0;
    // Si noTax es true => tax = 0
    if (!noTax) {
      newTax = newSubtotal * 0.018; // Ejemplo: 1.8%
    }

    const newTotal = newSubtotal + newTax;

    setSubtotal(newSubtotal);
    setTax(newTax);
    setTotal(newTotal);
  };

  // Maneja el cambio de vehículo seleccionado
  const handleVehicleChange = async (e) => {
    const vehicleId = e.target.value;
    setSelectedVehicleId(vehicleId);

    if (vehicleId === "") {
      setSelectedVehicle(null);
      setOwner(null);
      setNoTax(false);
      return;
    }

    try {
      const vehicleData = await getVehicleById(vehicleId);
      setSelectedVehicle(vehicleData);
      setOwner(vehicleData.userWorkshop);
      setNoTax(vehicleData.userWorkshop.noTax);
    } catch (error) {
      setError("Error fetching vehicle details: " + error.message);
    }
  };

  // Guardar Estimate
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
      Parts: parts.map((part) => ({
        description: part.description,
        partNumber: part.partNumber,
        quantity: part.quantity,
        netPrice: part.netPrice,
        listPrice: part.listPrice,
        extendedPrice: part.extendedPrice,
        taxable: part.taxable,
      })),
      Labors: labors.map((labor) => ({
        description: labor.description,
        duration: labor.duration,
        laborRate: labor.laborRate,
        extendedPrice: labor.extendedPrice,
        taxable: labor.taxable,
      })),
      FlatFees: flatFees.map((fee) => ({
        description: fee.description,
        flatFeePrice: fee.flatFeePrice,
        extendedPrice: fee.extendedPrice,
        taxable: fee.taxable,
      })),
    };

    try {
      const createdEstimate = await createEstimate(estimateData);
      setSuccess(
        `Estimate created successfully with ID: ${createdEstimate.ID}`
      );
      setError(null);

      // Limpiar
      setParts([]);
      setLabors([]);
      setFlatFees([]);
      setCustomerNote("");
      setExtendedDiagnostic("");
      setSubtotal(0.0);
      setTax(0.0);
      setTotal(0.0);
      setSelectedVehicleId(null);
      setSelectedVehicle(null);
      setOwner(null);
      setNoTax(false);
    } catch (error) {
      setError("Error creating the Estimate: " + error.message);
      setSuccess(null);
    }
  };

  // Cargar la lista de vehículos al montar
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const vehicleList = await getAllVehicles();
        setVehicles(vehicleList);
      } catch (error) {
        setError("Error loading the vehicle list: " + error.message);
      }
    };

    fetchVehicles();
  }, []);

  return (
    <div className="p-4 border rounded">
      <h3>ESTIMATE</h3>

      {/* Error and Success Messages */}
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

      {/* Vehicle Selection */}
      <div className="mb-3">
        <Form.Group controlId="selectVehicle">
          <Form.Label>Select Vehicle (VIN)</Form.Label>
          <Form.Control
            as="select"
            value={selectedVehicleId || ""}
            onChange={handleVehicleChange}
          >
            <option value="">-- Select a VIN --</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.vin}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </div>

      {/* Vehicle and Customer Information */}
      {selectedVehicle && owner && (
        <div className="mb-3">
          <Row>
            <Col md={8}>
              <div>
                <span role="img" aria-label="vehicle">
                  🚗
                </span>{" "}
                {`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model} (${selectedVehicle.engine})`}
              </div>
              <div>
                <strong>Plate:</strong> {selectedVehicle.plate} |{" "}
                <strong>State:</strong> {selectedVehicle.state} |{" "}
                <strong>Status:</strong> {selectedVehicle.status}
              </div>
            </Col>
            <Col md={4}>
              <div>
                <span role="img" aria-label="customer">
                  👤
                </span>{" "}
                {`${owner.name} ${owner.lastName}`}
              </div>
              <div>
                <strong>Email:</strong> {owner.email}
              </div>
              <div className="mt-2">
                <strong>Tax:</strong>{" "}
                {owner.noTax ? (
                  <span style={{ color: "red", fontWeight: "bold" }}>
                    No Tax
                  </span>
                ) : (
                  <span style={{ color: "green", fontWeight: "bold" }}>
                    Taxable
                  </span>
                )}
              </div>
              {owner.noTax && (
                <div className="mt-2">
                  <Alert variant="info" className="p-1">
                    <strong>No Tax:</strong> This workshop is tax-exempt.
                  </Alert>
                </div>
              )}
            </Col>
          </Row>
        </div>
      )}

      {/* Add Item Buttons */}
      <div className="mb-3">
        <Button
          variant="primary"
          onClick={handleShowPartModal}
          className="me-2"
          disabled={!selectedVehicleId}
        >
          Add Part
        </Button>
        <Button
          variant="primary"
          onClick={handleShowLaborModal}
          className="me-2"
          disabled={!selectedVehicleId}
        >
          Add Labor
        </Button>
        <Button
          variant="primary"
          onClick={handleShowFlatFeeModal}
          disabled={!selectedVehicleId}
        >
          Add Flat Fee
        </Button>
      </div>

      {/* Estimate Table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>TYPE</th>
            <th>DESCRIPTION</th>
            <th>PART#</th>
            <th>QTY</th>
            <th>NET PRICE</th>
            <th>LIST PRICE</th>
            <th>EXTENDED</th>
            <th>TAXABLE</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part, index) => (
            <tr key={`part-${index}`}>
              <td>[PART]</td>
              <td>{part.description}</td>
              <td>{part.partNumber}</td>
              <td>{part.quantity}</td>
              <td>${parseFloat(part.netPrice).toFixed(2)}</td>
              <td>${parseFloat(part.listPrice).toFixed(2)}</td>
              <td>${parseFloat(part.extendedPrice).toFixed(2)}</td>
              <td>✔</td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeItem("PART", index)}
                >
                  &times;
                </Button>
              </td>
            </tr>
          ))}
          {labors.map((labor, index) => (
            <tr key={`labor-${index}`}>
              <td>[LABOR]</td>
              <td>{labor.description}</td>
              <td></td>
              <td>{labor.duration}</td>
              <td>${parseFloat(labor.laborRate).toFixed(2)}</td>
              <td>${(labor.duration * labor.laborRate).toFixed(2)}</td>
              <td>${parseFloat(labor.extendedPrice).toFixed(2)}</td>
              <td>✔</td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeItem("LABOR", index)}
                >
                  &times;
                </Button>
              </td>
            </tr>
          ))}
          {flatFees.map((fee, index) => (
            <tr key={`flatfee-${index}`}>
              <td>[FLATFEE]</td>
              <td>{fee.description}</td>
              <td></td>
              <td></td>
              <td></td>
              <td>${parseFloat(fee.flatFeePrice).toFixed(2)}</td>
              <td>${parseFloat(fee.extendedPrice).toFixed(2)}</td>
              <td>✔</td>
              <td>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeItem("FLATFEE", index)}
                >
                  &times;
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Extended Diagnostic Info */}
      <Form.Group controlId="extended-diagnostic" className="mb-3">
        <Form.Label>Extended Diagnostic</Form.Label>
        <Form.Control
          as="textarea"
          rows={6}
          value={extendedDiagnostic}
          onChange={(e) => setExtendedDiagnostic(e.target.value)}
        />
      </Form.Group>

      {/* Customer Note */}
      <Form.Group controlId="customer-note" className="mb-3">
        <Form.Label>Customer Note</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          placeholder="Add additional notes for the customer..."
          value={customerNote}
          onChange={(e) => setCustomerNote(e.target.value)}
        />
      </Form.Group>

      {/* Totals Section */}
      <div className="mb-3">
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
      </div>

      {/* Action Buttons */}
      <div className="text-end">
        <Button variant="secondary" className="me-2">
          Cancel
        </Button>
        <Button variant="success" onClick={handleSave}>
          Save
        </Button>
      </div>

      {/* =============== MODALS =============== */}

      {/* Modal to add Part */}
      {/* Modal to add Part */}
      <Modal show={showPartModal} onHide={handleClosePartModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Part</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="partDescription" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={newPart.description}
                onChange={(e) =>
                  setNewPart({ ...newPart, description: e.target.value })
                }
                placeholder="Enter part description"
              />
            </Form.Group>

            <Form.Group controlId="partNumber" className="mb-3">
              <Form.Label>Part Number</Form.Label>
              <Form.Control
                type="text"
                value={newPart.partNumber}
                onChange={(e) =>
                  setNewPart({ ...newPart, partNumber: e.target.value })
                }
                placeholder="Enter part number"
              />
            </Form.Group>

            <Form.Group controlId="partQuantity" className="mb-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                min="1"
                value={newPart.quantity}
                onChange={(e) => {
                  const quantity = parseInt(e.target.value) || 1;
                  // Recalcular extendedPrice basado en listPrice
                  const newExtended = newPart.listPrice * quantity;
                  setNewPart({
                    ...newPart,
                    quantity,
                    extendedPrice: newExtended,
                  });
                }}
              />
            </Form.Group>

            <Form.Group controlId="partNetPrice" className="mb-3">
              <Form.Label>Net Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPart.netPrice}
                  onChange={(e) => {
                    const netPrice = parseFloat(e.target.value) || 0.0;
                    // NO afecta el extendedPrice
                    setNewPart({
                      ...newPart,
                      netPrice,
                    });
                  }}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group controlId="partListPrice" className="mb-3">
              <Form.Label>List Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPart.listPrice}
                  onChange={(e) => {
                    const listPrice = parseFloat(e.target.value) || 0.0;
                    // Recalcular extendedPrice basado en listPrice
                    const newExtended = listPrice * newPart.quantity;
                    setNewPart({
                      ...newPart,
                      listPrice,
                      extendedPrice: newExtended,
                    });
                  }}
                />
              </InputGroup>
            </Form.Group>

            <Form.Group controlId="partExtendedPrice" className="mb-3">
              <Form.Label>Extended Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  type="number"
                  min="0"
                  step="0.01"
                  value={newPart.extendedPrice}
                  readOnly
                />
              </InputGroup>
            </Form.Group>
            {/* Taxable is fixed per part, but globally we might ignore it if noTax */}
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

      {/* Modal to add Labor */}
      <Modal show={showLaborModal} onHide={handleCloseLaborModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Labor</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="laborDescription" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={newLabor.description}
                onChange={(e) =>
                  setNewLabor({ ...newLabor, description: e.target.value })
                }
                placeholder="Enter labor description"
              />
            </Form.Group>
            <Form.Group controlId="laborDuration" className="mb-3">
              <Form.Label>Duration (hours)</Form.Label>
              <Form.Control
                type="number"
                min="0"
                value={newLabor.duration}
                onChange={(e) => {
                  const duration = parseInt(e.target.value) || 0;
                  setNewLabor({
                    ...newLabor,
                    duration,
                    extendedPrice: duration * newLabor.laborRate,
                  });
                }}
              />
            </Form.Group>
            <Form.Group controlId="laborRate" className="mb-3">
              <Form.Label>Labor Rate</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  type="number"
                  min="0"
                  step="0.01"
                  value={newLabor.laborRate}
                  onChange={(e) => {
                    const rate = parseFloat(e.target.value) || 0.0;
                    setNewLabor({
                      ...newLabor,
                      laborRate: rate,
                      extendedPrice: newLabor.duration * rate,
                    });
                  }}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group controlId="laborExtendedPrice" className="mb-3">
              <Form.Label>Extended Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  type="number"
                  min="0"
                  step="0.01"
                  value={newLabor.extendedPrice}
                  readOnly
                />
              </InputGroup>
            </Form.Group>
            {/* Taxable es fijo por labor, pero se ignora si noTax */}
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

      {/* Modal to add Flat Fee */}
      <Modal show={showFlatFeeModal} onHide={handleCloseFlatFeeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Flat Fee</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="flatFeeDescription" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                value={newFlatFee.description}
                onChange={(e) =>
                  setNewFlatFee({ ...newFlatFee, description: e.target.value })
                }
                placeholder="Enter flat fee description"
              />
            </Form.Group>
            <Form.Group controlId="flatFeePrice" className="mb-3">
              <Form.Label>Flat Fee Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  type="number"
                  min="0"
                  step="0.01"
                  value={newFlatFee.flatFeePrice}
                  onChange={(e) => {
                    const price = parseFloat(e.target.value) || 0.0;
                    setNewFlatFee({
                      ...newFlatFee,
                      flatFeePrice: price,
                      extendedPrice: price,
                    });
                  }}
                />
              </InputGroup>
            </Form.Group>
            <Form.Group controlId="flatFeeExtendedPrice" className="mb-3">
              <Form.Label>Extended Price</Form.Label>
              <InputGroup>
                <InputGroup.Text>$</InputGroup.Text>
                <FormControl
                  type="number"
                  min="0"
                  step="0.01"
                  value={newFlatFee.extendedPrice}
                  readOnly
                />
              </InputGroup>
            </Form.Group>
            {/* Taxable es fijo, pero se ignora globalmente si noTax */}
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
    </div>
  );
};

export default Estimate;
