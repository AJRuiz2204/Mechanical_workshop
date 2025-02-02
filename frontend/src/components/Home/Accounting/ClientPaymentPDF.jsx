/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
// src/components/Home/Payment/ClientPaymentPDF.jsx

/**
 * Component for generating a client payment summary PDF document
 * @module ClientPaymentPDF
 */

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

/**
 * PDF document styles definition
 * @constant {Object} styles
 */
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

/**
 * Main component for generating client payment PDF
 * @param {Object} props - Component props
 * @param {Object} props.pdfData - Payment data to display in PDF
 * @param {Object} props.pdfData.workshopData - Workshop information
 * @param {Object} props.pdfData.customer - Client information
 * @param {Object} props.pdfData.vehicle - Vehicle information
 * @param {Array} props.pdfData.payments - List of payment records
 * @returns {JSX.Element} PDF document structure
 */
const ClientPaymentPDF = ({ pdfData }) => {
  // Destructure PDF data with fallback defaults
  const workshopData = pdfData?.workshopData || {};
  const customer = pdfData?.customer || {};
  const vehicle = pdfData?.vehicle || {};
  const payments = pdfData?.payments || [];
  
  // Calculate payment totals
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remainingBalance = payments[0]?.remainingBalance || 0;
  const initialBalance = payments[0]?.initialBalance || 0;
  const formattedDate = dayjs().format("YYYY-MM-DD HH:mm:ss");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Document Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.logoSection}>
            <Image src={logo} style={{ width: "100%", height: "100%" }} />
          </View>
          <View style={styles.headerInfoContainer}>
            <Text style={styles.textLine}>{workshopData.workshopName}</Text>
            <Text style={styles.textLine}>{workshopData.address}</Text>
            <Text style={styles.textLine}>{workshopData.primaryPhone}</Text>
            <Text style={styles.textLine}>{workshopData.email}</Text>
            <Text style={styles.textLine}>Date: {formattedDate}</Text>
          </View>
        </View>

        {/* Divider Line */}
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#e0e0e0",
            marginBottom: 5,
          }}
        />

        {/* Client Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Client: {customer.fullName}</Text>
          <Text style={{ fontSize: 10 }}>Email: {customer.email}</Text>
          <Text style={{ fontSize: 10 }}>
            Phone: {customer.primaryPhone}
          </Text>
        </View>

        {/* Vehicle Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Vehicle:</Text>
          {vehicle ? (
            <Text style={{ fontSize: 10 }}>
              {vehicle.year} {vehicle.make} {vehicle.model} - {vehicle.vin}
            </Text>
          ) : (
            <Text style={{ fontSize: 10 }}>No vehicle information</Text>
          )}
        </View>

        {/* Payment Summary Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <Text style={{ fontSize: 10 }}>
            Initial Balance: ${Number(initialBalance).toFixed(2)}
          </Text>
          <Text style={{ fontSize: 10 }}>
            Total Paid: ${totalPaid.toFixed(2)}
          </Text>
          <Text style={{ fontSize: 10 }}>
            Remaining Balance: ${Number(remainingBalance).toFixed(2)}
          </Text>
        </View>

        {/* Payments Table Section */}
        <View style={styles.table}>
          {/* Table Header */}
          <View style={[styles.tableRow, { backgroundColor: "#f5f5f5" }]}>
            <Text
              style={[styles.tableCol, styles.tableHeaderText, { flex: 1 }]}
            >
              ID
            </Text>
            <Text
              style={[styles.tableCol, styles.tableHeaderText, { flex: 2 }]}
            >
              Amount
            </Text>
            <Text
              style={[styles.tableCol, styles.tableHeaderText, { flex: 3 }]}
            >
              Date
            </Text>
            <Text
              style={[styles.tableCol, styles.tableHeaderText, { flex: 2 }]}
            >
              Method
            </Text>
            <Text
              style={[styles.tableCol, styles.tableHeaderText, { flex: 3 }]}
            >
              Reference
            </Text>
          </View>

          {/* Table Rows */}
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

        {/* Document Footer */}
        <View style={styles.footer}>
          <Text style={{ textAlign: "center" }}>
            Printed on {formattedDate}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ClientPaymentPDF;