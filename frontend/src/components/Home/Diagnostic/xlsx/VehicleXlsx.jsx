// components/Home/Estimate/EstimateList.js
import { useState, useEffect } from "react";
import { Table, Button, Container, Alert, Spinner } from "react-bootstrap";
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
      setError(err.message || "Error al cargar la información");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /**
   * downloadExcel - Convierte los datos en formato JSON a una hoja de cálculo
   * y dispara la descarga del archivo XLSX.
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

  if (loading) {
    return (
      <Container fluid className="p-4">
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="p-4">
      <h3>Vehicle estimates list</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {/* Botón para exportar a XLSX */}
      <div className="mb-3 d-flex justify-content-end">
        <Button variant="primary" onClick={downloadExcel}>
          Descargar XLSX
        </Button>
      </div>
      {estimates.length === 0 ? (
        <Alert variant="info">No se encontraron registros</Alert>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Fecha de Creación</th>
              <th>ID Estimado</th>
              <th>VIN</th>
              <th>Cantidad</th>
              <th>Descripción</th>
              <th>Precio Neto</th>
              <th>Precio de Lista</th>
              <th>Precio Total</th>
              <th>Mano de Obra</th>
              <th>Suministros</th>
            </tr>
          </thead>
          <tbody>
            {estimates.map((item, index) => (
              <tr key={index}>
                <td>{new Date(item.createTime).toLocaleString()}</td>
                <td>{item.estimateId}</td>
                <td>{item.vin}</td>
                <td>{item.quantity !== undefined ? item.quantity : "-"}</td>
                <td>{item.description}</td>
                <td>{item.netPrice}</td>
                <td>{item.listPrice}</td>
                <td>{item.priceTo}</td>
                <td>{item.labor}</td>
                <td>{item.shopSupplies}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default VehicleXlsx;
