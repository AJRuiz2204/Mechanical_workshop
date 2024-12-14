/* eslint-disable no-unused-vars */
import React from 'react';
import { Table, Form, Button } from 'react-bootstrap';

const DiagnosticList = () => {
  return (
    <div className="p-4 border rounded">
      <h3>DIAGNOSTIC LIST</h3>

      {/* Search Bar */}
      <Form.Group controlId="search" className="mb-3">
        <Form.Label>Search</Form.Label>
        <Form.Control type="text" placeholder="Search by VIN, Owner, Technician, or Status" />
      </Form.Group>

      {/* Diagnostic Table */}
      <Table striped bordered hover>
        <thead>
          <tr>
            <th></th>
            <th>VIN, Owner, Make, Model, Assign Technician</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Form.Check type="checkbox" />
            </td>
            <td>SALAE25425A328687, John Smith, Land Rover, LR3, Mauricio</td>
            <td>
              <Button variant="primary">In Progress</Button>
            </td>
          </tr>
          <tr>
            <td>
              <Form.Check type="checkbox" />
            </td>
            <td>JH4DA1850KS007231, David Russo, Acura, Integra, Fernando</td>
            <td>
              <Button variant="primary">In Progress</Button>
            </td>
          </tr>
          <tr>
            <td>
              <Form.Check type="checkbox" />
            </td>
            <td>1FTEX14HORKA51281, Larry McCoy, Ford, F150, Tom</td>
            <td>
              <Button variant="secondary">Pending</Button>
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default DiagnosticList;
