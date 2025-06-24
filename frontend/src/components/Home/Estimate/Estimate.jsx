import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  createEstimate,
  getEstimateById,
  updateEstimate,
  getVehicleDiagnostics,
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
} from "antd";
import EditableCell from "./Editcell/EditableCell";
import PartModal from "./Modals/PartModal";
import LaborModal from "./Modals/LaborModal";
import FlatFeeModal from "./Modals/FlatFeeModal";

const { Option } = Select;
const { Column } = Table;

const Estimate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

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
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [saving, setSaving] = useState(false);

  const [showTaxSettingsModal, setShowTaxSettingsModal] = useState(false);
  const [showPartModal, setShowPartModal] = useState(false);
  const [showLaborModal, setShowLaborModal] = useState(false);
  const [showFlatFeeModal, setShowFlatFeeModal] = useState(false);

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

  useEffect(() => {
    const loadData = async () => {
      try {
        const cfg = await getSettingsById(1);
        setSettings(cfg);

        const vDiagnostics = await getVehicleDiagnostics();
        const options = [];
        vDiagnostics.forEach((vd) => {
          if (vd.diagnostics && vd.diagnostics.length > 0) {
            vd.diagnostics.forEach((diag) => {
              const validTechs = diag.technicianDiagnostics.filter(
                (td) =>
                  td.extendedDiagnostic && td.extendedDiagnostic.trim() !== ""
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
            setError("Estimate not found.");
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
        }
      } catch (err) {
        setError("Error loading data: " + (err.message || "Unknown error."));
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isEditMode, id]);

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

  const handleOptionChange = (e) => {
    const optionIndex = e.target.value;

    if (!optionIndex || optionIndex === "") {
      setError("Select a valid option.");
      setSelectedOption(null);
      return;
    }

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
  const handleClosePartModal = () => {
    setShowPartModal(false);
    setNewPart({
      description: "",
      partNumber: "",
      quantity: 1.0,
      netPrice: 0.0,
      listPrice: 0.0,
      extendedPrice: 0.0,
      applyPartTax: owner?.noTax ? false : settings?.partTaxByDefault ?? false,
    });
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
  const handleCloseLaborModal = () => {
    setShowLaborModal(false);
    setNewLabor({
      description: "",
      duration: 0.25,
      laborRate: settings?.defaultHourlyRate ?? 0.0,
      extendedPrice: 0.0,
      applyLaborTax: owner?.noTax
        ? false
        : settings?.laborTaxByDefault ?? false,
    });
  };

  const addPart = async () => {
    if (isAddingPart) return;
    if (
      newPart.quantity === "" ||
      newPart.netPrice === "" ||
      newPart.listPrice === ""
    ) {
      setError("Quantity, Net Price and List Price are required.");
      return;
    }
    try {
      // Only check for duplicates if partNumber is provided and not empty
      if (newPart.partNumber && newPart.partNumber.trim()) {
        const duplicate = parts.find(
          (part) => part.partNumber && part.partNumber === newPart.partNumber
        );
        if (duplicate) {
          setError(
            `The part with Part Number ${newPart.partNumber} already exists in this estimate.`
          );
          return;
        }
      }
      if (!newPart.description) {
        setError("Description is required.");
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
      setSuccess("Part added successfully.");
      setShowPartModal(false);
      setError(null);
    } catch {
      setError("Error adding the part.");
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
    setShowLaborModal(false);
  };

  const addFlatFee = () => {
    if (
      !newFlatFee.description ||
      newFlatFee.flatFeePrice === "" ||
      parseFloat(newFlatFee.flatFeePrice) <= 0
    ) {
      setError("Please fill out all flat fee fields correctly.");
      return;
    }
    const price = parseFloat(newFlatFee.flatFeePrice) || 0;
    const newItem = { ...newFlatFee, extendedPrice: price };
    setFlatFees([...flatFees, newItem]);
    setError(null);
    setShowFlatFeeModal(false);
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
    } else if (type === "FLATFEE") {
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
    if (!isEditMode && (!selectedOption || selectedOption === "")) {
      setError("Please select a vehicle.");
      return;
    }

    if (parts.length === 0 && labors.length === 0 && flatFees.length === 0) {
      setError("Add at least one item to the Estimate.");
      return;
    }
    
    // Only check for duplicates among non-empty part numbers
    const nonEmptyPartNumbers = parts
      .map((p) => p.partNumber)
      .filter((partNum) => partNum && partNum.trim() !== "");
    const hasDuplicates = nonEmptyPartNumbers.some(
      (item, idx) => nonEmptyPartNumbers.indexOf(item) !== idx
    );
    if (hasDuplicates) {
      setError("There are duplicate Part Numbers in the estimate.");
      return;
    }

    if (!customerNote.trim()) {
      setError("The 'Description of labor or services' field cannot be empty.");
      return;
    }

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

    // Validate all parts
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part.description?.trim()) {
        setError(`Part ${i + 1}: Description is required.`);
        return;
      }
      // Part number validation removed - it's now optional
      if (safeParseFloat(part.quantity) <= 0) {
        setError(`Part ${i + 1}: Quantity must be greater than 0.`);
        return;
      }
      if (safeParseFloat(part.netPrice) < 0 || safeParseFloat(part.listPrice) < 0) {
        setError(`Part ${i + 1}: Prices cannot be negative.`);
        return;
      }
    }

    // Validate all labors
    for (let i = 0; i < labors.length; i++) {
      const labor = labors[i];
      if (!labor.description?.trim()) {
        setError(`Labor ${i + 1}: Description is required.`);
        return;
      }
      if (safeParseFloat(labor.duration) <= 0) {
        setError(`Labor ${i + 1}: Duration must be greater than 0.`);
        return;
      }
      if (safeParseFloat(labor.laborRate) < 0) {
        setError(`Labor ${i + 1}: Labor rate cannot be negative.`);
        return;
      }
    }

    // Validate all flat fees
    for (let i = 0; i < flatFees.length; i++) {
      const fee = flatFees[i];
      if (!fee.description?.trim()) {
        setError(`Flat Fee ${i + 1}: Description is required.`);
        return;
      }
      if (safeParseFloat(fee.flatFeePrice) < 0) {
        setError(`Flat Fee ${i + 1}: Price cannot be negative.`);
        return;
      }
    }

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
        PartNumber: (p.partNumber || "").trim(), // Allow empty string
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

    // Final validation
    if (dto.VehicleID <= 0) {
      setError("Invalid vehicle ID.");
      return;
    }

    try {
      setSaving(true);
      console.log("Sending estimate data:", dto);
      
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
      console.error("Save estimate error:", err);
      
      // Extract detailed error message
      let errorMessage = "Error creating the estimate.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        errorMessage = Array.isArray(errors) 
          ? errors.map(e => `${e.Field}: ${e.Errors.join(', ')}`).join('; ')
          : JSON.stringify(errors);
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
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

      {error && (
        <Alert
          type="error"
          message={error}
          closable
          onClose={() => setError(null)}
        />
      )}
      {success && (
        <Alert
          type="success"
          message={success}
          closable
          onClose={() => setSuccess(null)}
        />
      )}

      <div style={{ textAlign: "right", marginBottom: 16 }}>
        <Button onClick={handleShowTaxSettingsModal}>
          View Tax &amp; Markup Settings
        </Button>
      </div>

      <Form layout="vertical" onFinish={handleSave}>
        {!isEditMode && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="vehicleDiagnosticSelect"
                label="Select Vehicle (only those with TechnicianDiagnostic)"
                rules={[{ required: true, message: "Select a valid option." }]}
              >
                <Select
                  placeholder="-- Select Option --"
                  onChange={(value) =>
                    handleOptionChange({ target: { value } })
                  }
                >
                  <Option value="">-- Select Option --</Option>
                  {vehicleDiagnosticOptions.map((opt, idx) => (
                    <Option key={idx} value={idx}>
                      {`${opt.vehicle.vin} - ${opt.owner.name} ${opt.owner.lastName} - Diagnostic ID: ${opt.diagnostic.diagnosticId} - Extended: ${opt.technicianDiagnostics[0].extendedDiagnostic}`}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="authorizationStatus"
                label="Authorization Status"
                initialValue="Pending"
              >
                <Select>
                  <Option value="Pending">Pending</Option>
                  <Option value="Approved">Approved</Option>
                  <Option value="Not aproved">Not aproved</Option>
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
                    {mileage} km
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
              onClick={() => setShowFlatFeeModal(true)}
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
          <Column
            title="TYPE"
            dataIndex="type"
            key="type"
          />
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
            title="PART# / HOURS"
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
                <EditableCell
                  type="number"
                  value={record.quantity}
                  onChange={(v) =>
                    updateLaborField(record.rowIndex, "duration", v)
                  }
                />
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
                <span>{parseFloat(val).toFixed(2)}</span>
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
                      else updateLaborField(record.rowIndex, "applyLaborTax", v);
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
            render={(_, record) => (
              <Button
                type="link"
                danger
                onClick={() =>
                  removeItem(record.type.toUpperCase(), record.rowIndex)
                }
              >
                Remove
              </Button>
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
              {isEditMode ? "Update Estimate" : "Create Estimate"}
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
        onHide={handleClosePartModal}
        newPart={newPart}
        setNewPart={setNewPart}
        addPart={addPart}
        noTax={noTax}
        settings={settings}
      />
      <LaborModal
        show={showLaborModal}
        onHide={handleCloseLaborModal}
        newLabor={newLabor}
        setNewLabor={setNewLabor}
        addLabor={addLabor}
        noTax={noTax}
        settings={settings}
      />
      <FlatFeeModal
        show={showFlatFeeModal}
        onHide={() => setShowFlatFeeModal(false)}
        newFlatFee={newFlatFee}
        setNewFlatFee={setNewFlatFee}
        addFlatFee={addFlatFee}
        settings={settings}
      />
    </div>
  );
};

export default Estimate;
