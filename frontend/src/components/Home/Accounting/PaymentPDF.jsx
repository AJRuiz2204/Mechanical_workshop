/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// src/components/Home/Payment/PaymentPDF.jsx
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image
} from "@react-pdf/renderer";
import dayjs from "dayjs";
import logo from "../../../images/logo.png";

// Definir estilos para el documento PDF
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff"
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5
  },
  logoSection: {
    width: 100,
    height: 100,
    marginRight: 10
  },
  headerInfoContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end"
  },
  textLine: {
    fontSize: 9,
    marginBottom: 1
  },
  infoSection: {
    flexDirection: "row",
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0"
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2
  },
  table: {
    display: "table",
    width: "auto",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginTop: 5
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    minHeight: 20,
    alignItems: "center"
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: "bold"
  },
  tableText: {
    fontSize: 8
  },
  tableCol: {
    padding: 2
  },
  totalsSection: {
    marginTop: 10,
    alignItems: "flex-end",
    paddingRight: 5
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 5
  }
});

const PaymentPDF = ({ pdfData }) => {
  // pdfData debe incluir:
  // - workshopData: { workshopName, address, primaryPhone, email, ... }
  // - customer: { fullName, email, primaryPhone }
  // - payments: array de pagos (cada pago debe tener id, amount, paymentDate, method, transactionReference, notes)
  // - (opcional) totals, etc.

  const workshopData = pdfData?.workshopData || {};
  const customer = pdfData?.customer || {};
  const payments = pdfData?.payments || [];
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
            {workshopData.email && (
              <Text style={styles.textLine}>{workshopData.email}</Text>
            )}
            <Text style={styles.textLine}>Fecha: {formattedDate}</Text>
          </View>
        </View>

        <View
          style={{ borderBottomWidth: 1, borderBottomColor: "#e0e0e0", marginBottom: 5 }}
        />

        {/* Información del Cliente */}
        <View style={styles.infoSection}>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Cliente</Text>
            <Text style={styles.textLine}>{customer.fullName}</Text>
            <Text style={styles.textLine}>{customer.email}</Text>
            <Text style={styles.textLine}>{customer.primaryPhone}</Text>
          </View>
        </View>

        {/* Tabla de Pagos */}
        <View style={styles.table}>
          <View style={[styles.tableRow, { backgroundColor: "#f5f5f5" }]}>
            <Text style={[styles.tableCol, styles.tableHeaderText, { flex: 1 }]}>ID</Text>
            <Text style={[styles.tableCol, styles.tableHeaderText, { flex: 2 }]}>Monto</Text>
            <Text style={[styles.tableCol, styles.tableHeaderText, { flex: 3 }]}>Fecha</Text>
            <Text style={[styles.tableCol, styles.tableHeaderText, { flex: 2 }]}>Método</Text>
            <Text style={[styles.tableCol, styles.tableHeaderText, { flex: 3 }]}>Referencia</Text>
          </View>
          {payments.map((payment, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.tableText, { flex: 1 }]}>{payment.id}</Text>
              <Text style={[styles.tableCol, styles.tableText, { flex: 2 }]}>
                ${Number(payment.amount).toFixed(2)}
              </Text>
              <Text style={[styles.tableCol, styles.tableText, { flex: 3 }]}>
                {new Date(payment.paymentDate).toLocaleDateString()}
              </Text>
              <Text style={[styles.tableCol, styles.tableText, { flex: 2 }]}>{payment.method}</Text>
              <Text style={[styles.tableCol, styles.tableText, { flex: 3 }]}>{payment.transactionReference}</Text>
            </View>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={{ textAlign: "center" }}>Impreso el {formattedDate}</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PaymentPDF;
