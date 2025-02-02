/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Link,
} from "@react-pdf/renderer";
import dayjs from "dayjs";
import logo from "../../../images/logo.png";

/**
 * Styles for the Payment PDF with a unified header.
 * Includes styles for the page, header, client info section, table, and footer.
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
    alignItems: "flex-start",
    marginBottom: 5,
  },
  logoSection: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  headerInfoContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end",
    padding: 0,
  },
  workshopInfo: {
    marginBottom: 3,
    alignItems: "flex-end",
  },
  quoteInfo: {
    alignItems: "flex-end",
    padding: 0,
  },
  textLine: {
    fontSize: 9,
    marginBottom: 1,
  },
  link: {
    textDecoration: "underline",
    color: "blue",
    fontSize: 9,
  },
  // Styles for the rest of the content
  infoSection: {
    flexDirection: "row",
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
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
  totalsSection: {
    marginTop: 10,
    alignItems: "flex-end",
    paddingRight: 5,
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
 * Formats the "Last Updated" date string.
 * If the date string is not provided, returns an empty string.
 * Otherwise, subtracts 6 hours from the date and formats it as "YYYY-MM-DD HH:mm:ss".
 *
 * @param {string} dateString - The original date string.
 * @returns {string} The formatted date string.
 */
const formatLastUpdated = (dateString) => {
  if (!dateString) return "";
  return dayjs(dateString).subtract(6, "hour").format("YYYY-MM-DD HH:mm:ss");
};

/**
 * PaymentPDF Component
 *
 * Generates a PDF document for a payment summary.
 * Expected pdfData includes:
 * - workshopData: Workshop information.
 * - customer: Customer information.
 * - payments: Array of payment records.
 *
 * The document contains a unified header with workshop details, a section for client information,
 * a table displaying payment details, and a footer with the print date.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.pdfData - The payment summary data.
 * @returns {JSX.Element} The rendered PDF document.
 */
const PaymentPDF = ({ pdfData }) => {
  // Extract workshop, customer, and payments information from pdfData.
  const workshopData = pdfData?.workshopData || {};
  const customer = pdfData?.customer || {};
  const payments = pdfData?.payments || [];
  // Format the current date for the footer.
  const formattedDate = dayjs().format("YYYY-MM-DD HH:mm:ss");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Unified Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoSection}>
            {/* Render the workshop logo */}
            <Image src={logo} style={{ width: "100%", height: "100%" }} />
          </View>
          <View style={styles.headerInfoContainer}>
            {/* Workshop Information Section */}
            <View style={styles.workshopInfo}>
              <Text style={styles.textLine}>
                {workshopData.workshopName || "Nombre del Taller"}
              </Text>
              <Text style={styles.textLine}>
                {workshopData.address || "Dirección del Taller"}
              </Text>
              <Text style={styles.textLine}>
                {workshopData.primaryPhone || "Teléfono Principal"}
              </Text>
              {workshopData.secondaryPhone && (
                <Text style={styles.textLine}>
                  {workshopData.secondaryPhone}
                </Text>
              )}
              <Text style={styles.textLine}>Fax: {workshopData.fax || ""}</Text>
              <Text style={styles.textLine}>{workshopData.email || ""}</Text>
              {workshopData.websiteUrl && (
                <Link src={workshopData.websiteUrl} style={styles.link}>
                  {workshopData.websiteUrl}
                </Link>
              )}
            </View>
            {/* Quote Information Section */}
            <View style={styles.quoteInfo}>
              <Text style={styles.textLine}>
                Quote # {workshopData.quoteNumber || ""}
              </Text>
              <Text style={styles.textLine}>
                Last Updated: {formatLastUpdated(workshopData.lastUpdated)}
              </Text>
              <Text style={styles.textLine}>
                Expires: {workshopData.expiryDate || ""}
              </Text>
            </View>
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
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Client</Text>
            <Text style={styles.textLine}>{customer.fullName}</Text>
            <Text style={styles.textLine}>{customer.email}</Text>
            <Text style={styles.textLine}>{customer.primaryPhone}</Text>
          </View>
        </View>

        {/* Payments Table */}
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
          {/* Render Payment Rows */}
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

        {/* Footer Section */}
        <View style={styles.footer}>
          <Text style={{ textAlign: "center" }}>
            Printed on {formattedDate}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default PaymentPDF;
