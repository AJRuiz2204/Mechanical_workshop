/* eslint-disable no-unused-vars */
// src/components/VehicleList/VehicleList.jsx
import React from "react";
import { Table, Button, Form } from "react-bootstrap";
import "./VehicleList.css"; // Ensure to create this file for styles

const VehicleList = () => {
  // Example data for the vehicle table
  const exampleVehicles = [
    {
      vin: "JH4KA3151KC019450",
      make: "Acura",
      model: "Legend",
      owner: "John Smith",
      engine: "2.0L",
      plate: "ABC123",
    },
    {
      vin: "1HGCM82633A123456",
      make: "Honda",
      model: "Accord",
      owner: "Jane Doe",
      engine: "1.8L",
      plate: "DEF456",
    },
    {
      vin: "2FTRX18W1XCA12345",
      make: "Ford",
      model: "F-150",
      owner: "Mike Johnson",
      engine: "3.5L",
      plate: "GHI789",
    },
    {
      vin: "3GNDA13D76S123456",
      make: "Chevrolet",
      model: "HHR",
      owner: "Sarah Connor",
      engine: "2.4L",
      plate: "JKL012",
    },
    {
      vin: "4T1BF1FK5HU123456",
      make: "Toyota",
      model: "Camry",
      owner: "Tom Cruise",
      engine: "2.5L",
      plate: "MNO345",
    },
    {
      vin: "5NPE24AF4FH123456",
      make: "Hyundai",
      model: "Sonata",
      owner: "Emma Watson",
      engine: "2.4L",
      plate: "PQR678",
    },
  ];

  return (
    <div className="p-4 border rounded">
      <h3>VEHICLE LIST</h3>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Form.Control
          type="text"
          placeholder="Search by VIN"
          className="me-3"
          disabled // Disabled since there is no search logic
        />
        <Button variant="primary" disabled>
          Add Customer
        </Button>
      </div>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>VIN</th>
            <th>Make</th>
            <th>Model</th>
            <th>Owner</th>
            <th>Engine</th>
            <th>Plate</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exampleVehicles.map((vehicle, index) => (
            <tr key={index}>
              <td>{vehicle.vin}</td>
              <td>{vehicle.make}</td>
              <td>{vehicle.model}</td>
              <td>{vehicle.owner}</td>
              <td>{vehicle.engine}</td>
              <td>{vehicle.plate}</td>
              <td>
                <Button variant="warning" className="me-2" disabled>
                  Edit
                </Button>
                <Button variant="info" disabled>
                  Reception
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default VehicleList;
