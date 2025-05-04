// components/Home/Estimate/EstimateList.js
import { useState, useEffect } from "react";
import { Table, Button, Row, Spin, Alert, Empty } from "antd";
import { getEstimateData } from "../../../../services/EstimateServiceXslx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

const VehicleXlsx = () => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getEstimateData();
      setEstimates(data);
    } catch (err) {
      setError(err.message || "Error loading information");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /**
   * downloadExcel - Converts JSON data into a spreadsheet
   * and triggers the download of the XLSX file.
   */
  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Estimates");

    // Definir encabezados de columna
    sheet.columns = [
      { header: "Creation Date", key: "createTime", width: 20 },
      { header: "Estimate ID", key: "estimateId", width: 15 },
      { header: "VIN", key: "vin", width: 20 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Description", key: "description", width: 30 },
      { header: "Net Price", key: "netPrice", width: 12 },
      { header: "List Price", key: "listPrice", width: 12 },
      { header: "Total Price", key: "priceTo", width: 12 },
      { header: "Labor", key: "labor", width: 10 },
      { header: "Supplies", key: "shopSupplies", width: 12 },
    ];

    // Agregar filas
    estimates.forEach(item => {
      sheet.addRow({
        ...item,
        createTime: new Date(item.createTime).toLocaleString(),
      });
    });

    // Generar buffer y disparar descarga
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "estimates.xlsx");
  };

  // Columns for Antd Table
  const columns = [
    {
      title: "Creation Date",
      dataIndex: "createTime",
      key: "createTime",
      render: (val) => new Date(val).toLocaleString(),
    },
    { title: "Estimate ID", dataIndex: "estimateId", key: "estimateId" },
    { title: "VIN", dataIndex: "vin", key: "vin" },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (val) => (val !== undefined ? val : "-"),
    },
    { title: "Description", dataIndex: "description", key: "description" },
    { title: "Net Price", dataIndex: "netPrice", key: "netPrice" },
    { title: "List Price", dataIndex: "listPrice", key: "listPrice" },
    { title: "Total Price", dataIndex: "priceTo", key: "priceTo" },
    { title: "Labor", dataIndex: "labor", key: "labor" },
    { title: "Supplies", dataIndex: "shopSupplies", key: "shopSupplies" },
  ];

  if (loading) {
    return (
      <Row justify="center" style={{ padding: 24 }}>
        <Spin size="large" />
      </Row>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h3>Vehicle estimates list</h3>
      {error && <Alert message={error} type="error" showIcon />}
      <div style={{ marginBottom: 16, textAlign: "right" }}>
        <Button type="primary" onClick={downloadExcel}>
          Download XLSX
        </Button>
      </div>
      {estimates.length === 0 ? (
        <Empty description="No records found" />
      ) : (
        <Table
          columns={columns}
          dataSource={estimates}
          rowKey={(record, idx) => idx}
          pagination={false}
        />
      )}
    </div>
  );
};

export default VehicleXlsx;