// components/Home/Estimate/EstimateList.js
import { useState, useEffect } from "react";
import { Table, Button, Row, Spin, Alert, Empty } from "antd";
import { getEstimateData } from "../../../../services/EstimateServiceXslx";
import * as XLSX from "xlsx";

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
  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(estimates);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Estimates");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const dataBlob = new Blob([excelBuffer], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "estimates.xlsx");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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