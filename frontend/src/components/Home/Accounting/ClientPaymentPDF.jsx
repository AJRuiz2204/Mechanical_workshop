/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// src/components/Home/Payment/ClientPaymentPDF.jsx
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import dayjs from "dayjs";
import logo from "../../../images/logo.png";

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  logoSection: {
    width: 100,
    height: 100,
  },
  headerInfoContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end",
  },
  textLine: {
    fontSize: 9,
    marginBottom: 1,
  },
  infoSection: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
  },
  table: {
    display: "table",
    width: "auto",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginTop: 5,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    minHeight: 20,
    alignItems: "center",
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
  },
  tableText: {
    fontSize: 8,
  },
  tableCol: {
    padding: 2,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 5,
  },
});

const ClientPaymentPDF = ({ pdfData }) => {
  // pdfData debe tener: workshopData, customer, vehicle, payments
  const workshopData = pdfData?.workshopData || {};
  const customer = pdfData?.customer || {};
  const vehicle = pdfData?.vehicle || {};
  const payments = pdfData?.payments || [];
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remainingBalance = payments[0]?.remainingBalance || 0;
  const initialBalance = payments[0]?.initialBalance || 0;
  const formattedDate = dayjs().format("YYYY-MM-DD HH:mm:ss");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.headerContainer}>
          <View style={styles.logoSection}>
            <Image src={logo} style={{ width: "100%", height: "100%" }} />
          </View>
          <View style={styles.headerInfoContainer}>
            <Text style={styles.textLine}>{workshopData.workshopName}</Text>
            <Text style={styles.textLine}>{workshopData.address}</Text>
            <Text style={styles.textLine}>{workshopData.primaryPhone}</Text>
            <Text style={styles.textLine}>{workshopData.email}</Text>
            <Text style={styles.textLine}>Fecha: {formattedDate}</Text>
          </View>
        </View>

        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#e0e0e0",
            marginBottom: 5,
          }}
        />

        {/* Información del Cliente */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Cliente: {customer.fullName}</Text>
          <Text style={{ fontSize: 10 }}>Email: {customer.email}</Text>
          <Text style={{ fontSize: 10 }}>
            Teléfono: {customer.primaryPhone}
          </Text>
        </View>

        {/* Información del Vehículo */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Vehículo:</Text>
          {vehicle ? (
            <Text style={{ fontSize: 10 }}>
              {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.vin}
            </Text>
          ) : (
            <Text style={{ fontSize: 10 }}>Sin información de vehículo</Text>
          )}
        </View>

        {/* Resumen de Pagos */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Resumen de Pagos</Text>
          <Text style={{ fontSize: 10 }}>
            Saldo Inicial: ${Number(initialBalance).toFixed(2)}
          </Text>
          <Text style={{ fontSize: 10 }}>
            Total Pagado: ${totalPaid.toFixed(2)}
          </Text>
          <Text style={{ fontSize: 10 }}>
            Saldo Pendiente: ${Number(remainingBalance).toFixed(2)}
          </Text>
        </View>

        {/* Tabla de Pagos */}
        <View style={styles.table}>
          <View style={[styles.tableRow, { backgroundColor: "#f5f5f5" }]}>
            <Text
              style={[styles.tableCol, styles.tableHeaderText, { flex: 1 }]}
            >
              ID
            </Text>
            <Text
              style={[styles.tableCol, styles.tableHeaderText, { flex: 2 }]}
            >
              Monto
            </Text>
            <Text
              style={[styles.tableCol, styles.tableHeaderText, { flex: 3 }]}
            >
              Fecha
            </Text>
            <Text
              style={[styles.tableCol, styles.tableHeaderText, { flex: 2 }]}
            >
              Método
            </Text>
            <Text
              style={[styles.tableCol, styles.tableHeaderText, { flex: 3 }]}
            >
              Referencia
            </Text>
          </View>
          {payments.map((payment, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.tableText, { flex: 1 }]}>
                {payment.id}
              </Text>
              <Text style={[styles.tableCol, styles.tableText, { flex: 2 }]}>
                ${Number(payment.amount).toFixed(2)}
              </Text>
              <Text style={[styles.tableCol, styles.tableText, { flex: 3 }]}>
                {new Date(payment.paymentDate).toLocaleDateString()}
              </Text>
              <Text style={[styles.tableCol, styles.tableText, { flex: 2 }]}>
                {payment.method}
              </Text>
              <Text style={[styles.tableCol, styles.tableText, { flex: 3 }]}>
                {payment.transactionReference}
              </Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={{ textAlign: "center" }}>
            Impreso el {formattedDate}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ClientPaymentPDF;
