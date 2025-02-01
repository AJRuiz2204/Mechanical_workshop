/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Modal, Card, Button, Row, Col, Form, Badge } from "react-bootstrap";
import {
  getAccountReceivableById,
  createPayment,
  getPaymentsByAccount,
} from "../../../services/accountReceivableService";

const AccountPaymentModal = ({ show, onHide, accountId }) => {
  const [account, setAccount] = useState(null);
  const [payments, setPayments] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    method: "Cash",
    transactionReference: "",
    notes: "",
  });

  useEffect(() => {
    if (accountId && show) {
      fetchAccountData(accountId);
    }
  }, [accountId, show]);

  const fetchAccountData = async (accId) => {
    try {
      const accountData = await getAccountReceivableById(accId);
      const paymentsData = await getPaymentsByAccount(accId);
      setAccount(accountData);
      setPayments(paymentsData);
      console.log("Modal - Cuenta cargada:", accountData);
      console.log("Modal - Pagos cargados:", paymentsData);
    } catch (error) {
      console.error("Modal - Error cargando cuenta:", error);
      alert("Error al cargar los datos de la cuenta: " + error.message);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    const paymentAmount = parseFloat(formData.amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert("Ingrese un monto válido");
      return;
    }
    if (account && paymentAmount > account.balance) {
      alert("El monto ingresado excede el saldo pendiente");
      return;
    }
    const payload = {
      AccountReceivableId: accountId,
      Amount: paymentAmount,
      Method: formData.method,
      TransactionReference: formData.transactionReference,
      Notes: formData.notes,
    };
    console.log("Modal - Payload a enviar:", payload);
    try {
      const response = await createPayment(payload);
      console.log("Modal - Respuesta de createPayment:", response);
      await fetchAccountData(accountId);
      setFormData({
        amount: "",
        method: "Cash",
        transactionReference: "",
        notes: "",
      });
      alert("¡Pago registrado exitosamente!");
    } catch (error) {
      console.error("Modal - Error en createPayment:", error);
      alert("Error registrando pago: " + error.message);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Cuenta por Cobrar #{account ? account.id : accountId}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {account ? (
          <>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Cliente: {account.customer.fullName}</Card.Title>
                <Card.Text>
                  Vehículo: {account.vehicle.make} {account.vehicle.model}
                </Card.Text>
                <Card.Text>
                  Total: ${account.originalAmount.toFixed(2)}
                </Card.Text>
                <Card.Text>Saldo: ${account.balance.toFixed(2)}</Card.Text>
                <Badge bg={account.status === "Paid" ? "success" : "warning"}>
                  {account.status}
                </Badge>
              </Card.Body>
            </Card>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">Registro de Pagos</h5>
              </Card.Header>
              <Card.Body>
                <Form onSubmit={handlePaymentSubmit}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label>Monto</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        required
                        value={formData.amount}
                        onChange={(e) =>
                          setFormData({ ...formData, amount: e.target.value })
                        }
                      />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Método de Pago</Form.Label>
                      <Form.Select
                        value={formData.method}
                        onChange={(e) =>
                          setFormData({ ...formData, method: e.target.value })
                        }
                        required
                      >
                        <option value="Cash">Efectivo</option>
                        <option value="CreditCard">Tarjeta de Crédito</option>
                        <option value="Transfer">Transferencia</option>
                        <option value="Check">Cheque</option>
                      </Form.Select>
                    </Col>
                    <Col xs={12}>
                      <Form.Label>Referencia</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.transactionReference}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            transactionReference: e.target.value,
                          })
                        }
                      />
                    </Col>
                    <Col xs={12}>
                      <Form.Label>Notas</Form.Label>
                      <Form.Control
                        type="text"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            notes: e.target.value,
                          })
                        }
                      />
                    </Col>
                    <Col xs={12}>
                      <Button variant="success" type="submit" className="w-100">
                        Registrar Pago
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>
            <Card>
              <Card.Header>
                <h5 className="mb-0">Historial de Pagos</h5>
              </Card.Header>
              <Card.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
                {payments.map((payment) => (
                  <Card key={payment.id} className="mb-2">
                    <Card.Body className="p-3">
                      <div className="d-flex justify-content-between">
                        <div>
                          <h6 className="mb-0">${payment.amount.toFixed(2)}</h6>
                          <small className="text-muted">
                            {new Date(payment.paymentDate).toLocaleDateString()}
                          </small>
                        </div>
                        <div>
                          <Badge bg="primary">{payment.method}</Badge>
                        </div>
                      </div>
                      {payment.transactionReference && (
                        <small className="text-muted">
                          Ref: {payment.transactionReference}
                        </small>
                      )}
                    </Card.Body>
                  </Card>
                ))}
              </Card.Body>
            </Card>
          </>
        ) : (
          <div>Cargando detalles de la cuenta...</div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cerrar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AccountPaymentModal;
