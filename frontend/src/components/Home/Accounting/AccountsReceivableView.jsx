/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col, Form, Badge } from "react-bootstrap";
import {
  getAccountsReceivable,
  getAccountReceivableById,
  createPayment,
  getPaymentsByAccount,
} from "../../../services/accountReceivableService";
import { useLocation } from "react-router-dom";

const AccountsReceivableView = () => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null); // Datos completos de la cuenta
  const [payments, setPayments] = useState([]);
  const [selectedAccountId, setSelectedAccountId] = useState(null);
  const [showPayments, setShowPayments] = useState(false);
  // Se agrega la propiedad 'notes' en el estado del formulario
  const [formData, setFormData] = useState({
    amount: "",
    method: "Cash",
    transactionReference: "",
    notes: "", // Agregado: por defecto cadena vacía
  });

  const location = useLocation();

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    // Si en la URL existe ?accountId=... seleccionamos esa cuenta
    const query = new URLSearchParams(location.search);
    const accountIdQuery = query.get("accountId");
    if (accountIdQuery) {
      selectAccount(parseInt(accountIdQuery));
    }
  }, [location.search]);

  const loadAccounts = async () => {
    try {
      const data = await getAccountsReceivable();
      console.log("Cuentas cargadas:", data);
      setAccounts(data);
    } catch (error) {
      console.error("Error cargando cuentas:", error);
      alert("Error cargando cuentas: " + error.message);
    }
  };

  const selectAccount = async (accountId) => {
    try {
      setSelectedAccountId(accountId);
      setShowPayments(true);

      // Se obtienen la cuenta y sus pagos
      const [accountDetails, paymentsData] = await Promise.all([
        getAccountReceivableById(accountId),
        getPaymentsByAccount(accountId),
      ]);

      setSelectedAccount(accountDetails);
      setPayments(paymentsData);
      console.log("Cuenta seleccionada:", accountDetails);
      console.log("Pagos actuales:", paymentsData);
    } catch (error) {
      console.error("Error cargando detalles de la cuenta:", error);
      alert("Error cargando detalles: " + error.message);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAccountId) return;

    const paymentAmount = parseFloat(formData.amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      console.log("Monto ingresado inválido:", formData.amount);
      alert("Ingrese un monto válido");
      return;
    }

    if (selectedAccount) {
      console.log("Saldo de la cuenta:", selectedAccount.balance);
      console.log("Monto ingresado:", paymentAmount);
      if (paymentAmount > selectedAccount.balance) {
        alert("El monto ingresado excede el saldo pendiente de la cuenta");
        return;
      }
    }

    // Construir el payload usando los nombres exactos que espera el DTO en el servidor
    const payload = {
      AccountReceivableId: selectedAccountId,
      Amount: paymentAmount,
      Method: formData.method,
      TransactionReference: formData.transactionReference,
      Notes: formData.notes, // Se agrega la propiedad 'Notes'
    };

    console.log("Payload a enviar:", payload);

    try {
      const response = await createPayment(payload);
      console.log("Respuesta de createPayment:", response);

      // Actualizar el historial de pagos y la cuenta
      const updatedPayments = await getPaymentsByAccount(selectedAccountId);
      setPayments(updatedPayments);
      console.log("Pagos actualizados:", updatedPayments);

      const updatedAccount = await getAccountReceivableById(selectedAccountId);
      setSelectedAccount(updatedAccount);
      console.log("Cuenta actualizada:", updatedAccount);

      setFormData({
        amount: "",
        method: "Cash",
        transactionReference: "",
        notes: "",
      });
      alert("¡Pago registrado exitosamente!");
    } catch (error) {
      console.error("Error en createPayment:", error);
      alert("Error registrando pago: " + error.message);
    }
  };

  return (
    <div className="container py-5">
      <h1 className="mb-4 text-center">Gestión de Cuentas por Cobrar</h1>

      {/* Sección de Cuentas */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Cuentas por Cobrar</h5>
              <Button variant="primary" onClick={loadAccounts}>
                Actualizar Listado
              </Button>
            </Card.Header>
            <Card.Body>
              <Row className="row-cols-1 row-cols-md-2 g-4">
                {accounts.map((account) => (
                  <Col key={account.id}>
                    <Card
                      className="account-card h-100"
                      onClick={() => selectAccount(account.id)}
                      style={{ cursor: "pointer", transition: "all 0.3s" }}
                    >
                      <Card.Body>
                        <Card.Title>Cuenta #{account.id}</Card.Title>
                        <Card.Text className="mb-1">
                          Cliente: {account.customer.fullName}
                        </Card.Text>
                        <Card.Text className="mb-1">
                          Vehículo: {account.vehicle.make}{" "}
                          {account.vehicle.model}
                        </Card.Text>
                        <Card.Text className="mb-1">
                          Total: ${account.originalAmount.toFixed(2)}
                        </Card.Text>
                        <Card.Text className="mb-0">
                          Saldo: ${account.balance.toFixed(2)}
                        </Card.Text>
                        <Badge
                          bg={account.status === "Paid" ? "success" : "warning"}
                        >
                          {account.status}
                        </Badge>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sección de Pagos */}
      {showPayments && (
        <Row>
          <Col md={8}>
            <Card className="shadow mb-4">
              <Card.Header>
                <h5 className="mb-0">Registro de Pagos</h5>
                {selectedAccount && (
                  <small className="text-muted">
                    Saldo pendiente: ${selectedAccount.balance.toFixed(2)}
                  </small>
                )}
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
                    {/* Puedes agregar un campo opcional para "Notes" si el usuario debe poder ingresarlo */}
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
          </Col>

          <Col md={4}>
            <Card className="shadow">
              <Card.Header>
                <h5 className="mb-0">Historial de Pagos</h5>
              </Card.Header>
              <Card.Body
                className="payment-list"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
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
          </Col>
        </Row>
      )}
    </div>
  );
};

export default AccountsReceivableView;
