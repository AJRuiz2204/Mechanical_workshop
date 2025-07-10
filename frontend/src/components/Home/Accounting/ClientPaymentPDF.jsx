/* eslint-disable react/prop-types */
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
 * Styles for the document, including a unified header.
 */
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    lineHeight: 1.4,
  },
  // Header Styles
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#0056b3",
  },
  logoSection: {
    width: 100,
    height: 100,
    marginRight: 15,
  },
  headerInfoContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end",
    padding: 0,
  },
  workshopInfo: {
    marginBottom: 8,
    alignItems: "flex-end",
  },
  quoteInfo: {
    alignItems: "flex-end",
    backgroundColor: "#f0f8ff",
    padding: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#0056b3",
  },
  textLine: {
    fontSize: 9,
    marginBottom: 2,
    color: "#333",
  },
  link: {
    textDecoration: "underline",
    color: "#0056b3",
    fontSize: 9,
  },
  // Document Title
  documentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    color: "#0056b3",
    marginBottom: 20,
    paddingVertical: 10,
    backgroundColor: "#f0f8ff",
    borderRadius: 5,
  },
  // Section Styles
  infoSection: {
    marginBottom: 15,
    backgroundColor: "#fafafa",
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#0056b3",
    paddingBottom: 3,
  },
  infoText: {
    fontSize: 10,
    marginBottom: 3,
    color: "#444",
  },
  // Payment Summary Styles
  summarySection: {
    marginBottom: 20,
    backgroundColor: "#e7f3ff",
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#0056b3",
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0056b3",
    textAlign: "center",
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
    paddingHorizontal: 10,
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#333",
  },
  summaryValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0056b3",
  },
  summaryTotal: {
    borderTopWidth: 1,
    borderTopColor: "#0056b3",
    paddingTop: 8,
    marginTop: 8,
  },
  // Table Styles
  tableSection: {
    marginBottom: 20,
  },
  tableTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0056b3",
    marginBottom: 10,
    textAlign: "center",
  },
  table: {
    borderWidth: 1,
    borderColor: "#0056b3",
    borderRadius: 5,
    overflow: "hidden",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    minHeight: 25,
    alignItems: "center",
  },
  tableHeader: {
    backgroundColor: "#0056b3",
    borderBottomWidth: 2,
    borderBottomColor: "#003d82",
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#ffffff",
    textAlign: "center",
  },
  tableText: {
    fontSize: 9,
    color: "#333",
    textAlign: "center",
  },
  tableCol: {
    padding: 6,
    justifyContent: "center",
  },
  // Notes Styles
  notesSection: {
    marginBottom: 20,
    backgroundColor: "#fff9e6",
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#f0ad4e",
  },
  noteItem: {
    marginBottom: 8,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#f0ad4e",
  },
  noteDate: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#8a6d3b",
  },
  noteContent: {
    fontSize: 9,
    color: "#444",
    marginTop: 2,
  },
  // Footer Styles
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#0056b3",
    paddingTop: 8,
    textAlign: "center",
    color: "#666",
  },
});

/**
 * Formats the "Last Updated" date string.
 * If no date string is provided, returns an empty string.
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
 * ClientPaymentPDF Component
 *
 * Main component to generate a client payment summary PDF.
 *
 * Expected pdfData structure:
 * - workshopData: workshop details.
 * - customer: customer details.
 * - vehicle: vehicle details.
 * - payments: array of payment objects.
 *
 * The component displays a unified header with workshop information,
 * client information, vehicle information, payment summary, and a table listing individual payments.
 *
 * @param {Object} props - The component props.
 * @param {Object} props.pdfData - The data for the PDF.
 * @returns {JSX.Element} The rendered PDF document.
 */
const ClientPaymentPDF = ({ pdfData }) => {
  // Destructure data with default empty objects/arrays
  const workshopData = pdfData?.workshopData || {};
  const customer = pdfData?.customer || {};
  const vehicle = pdfData?.vehicle || {};
  const payments = pdfData?.payments || [];

  // Calculate totals
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remainingBalance = payments[0]?.remainingBalance || 0;
  const initialBalance = payments[0]?.initialBalance || 0;
  // Format the current date for the footer
  const formattedDate = dayjs().format("YYYY-MM-DD HH:mm:ss");

  // Use customer ID or first payment ID for quote number
  const quoteNumber = customer.id || payments[0]?.id || "N/A";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          <View style={styles.logoSection}>
            <Image src={logo} style={{ width: "100%", height: "100%" }} />
          </View>
          <View style={styles.headerInfoContainer}>
            <View style={styles.workshopInfo}>
              <Text style={styles.textLine}>
                {workshopData.workshopName || "Workshop Name"}
              </Text>
              <Text style={styles.textLine}>
                {workshopData.address || "Workshop Address"}
              </Text>
              <Text style={styles.textLine}>
                {workshopData.primaryPhone || "Primary Phone"}
              </Text>
              {workshopData.secondaryPhone && (
                <Text style={styles.textLine}>
                  {workshopData.secondaryPhone}
                </Text>
              )}
              <Text style={styles.textLine}>
                Fax: {workshopData.fax || "N/A"}
              </Text>
              <Text style={styles.textLine}>{workshopData.email || "N/A"}</Text>
              {workshopData.websiteUrl && (
                <Link src={workshopData.websiteUrl} style={styles.link}>
                  {workshopData.websiteUrl}
                </Link>
              )}
            </View>
            <View style={styles.quoteInfo}>
              <Text style={[styles.textLine, { fontWeight: "bold" }]}>
                Invoice # {quoteNumber}
              </Text>
              <Text style={styles.textLine}>
                Date: {dayjs().format("MMM DD, YYYY")}
              </Text>
              <Text style={styles.textLine}>
                Updated: {formatLastUpdated(workshopData.lastUpdated)}
              </Text>
            </View>
          </View>
        </View>

        {/* Document Title */}
        <Text style={styles.documentTitle}>PAYMENT STATEMENT</Text>

        {/* Customer Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "bold" }}>Name: </Text>
            {customer.fullName || "N/A"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "bold" }}>Email: </Text>
            {customer.email || "N/A"}
          </Text>
          <Text style={styles.infoText}>
            <Text style={{ fontWeight: "bold" }}>Phone: </Text>
            {customer.primaryPhone || "N/A"}
          </Text>
          {customer.address && (
            <Text style={styles.infoText}>
              <Text style={{ fontWeight: "bold" }}>Address: </Text>
              {customer.address}
              {customer.city && customer.state && (
                <Text>
                  , {customer.city}, {customer.state} {customer.zip || ""}
                </Text>
              )}
            </Text>
          )}
        </View>

        {/* Vehicle Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          {vehicle &&
          (vehicle.year || vehicle.make || vehicle.model || vehicle.vin) ? (
            <>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: "bold" }}>Vehicle: </Text>
                {vehicle.year} {vehicle.make} {vehicle.model}
              </Text>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: "bold" }}>VIN: </Text>
                {vehicle.vin || "N/A"}
              </Text>
            </>
          ) : (
            <Text style={styles.infoText}>
              No vehicle information available
            </Text>
          )}
        </View>

        {/* Payment Summary - Enhanced */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>PAYMENT SUMMARY</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Initial Balance:</Text>
            <Text style={styles.summaryValue}>
              ${Number(initialBalance).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Payments:</Text>
            <Text style={[styles.summaryValue, { color: "#28a745" }]}>
              -${totalPaid.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal]}>
            <Text style={[styles.summaryLabel, { fontSize: 12 }]}>
              Remaining Balance:
            </Text>
            <Text
              style={[
                styles.summaryValue,
                {
                  fontSize: 12,
                  color: Number(remainingBalance) > 0 ? "#dc3545" : "#28a745",
                },
              ]}
            >
              ${Number(remainingBalance).toFixed(2)}
            </Text>
          </View>
          {Number(remainingBalance) === 0 && (
            <Text
              style={{
                textAlign: "center",
                marginTop: 10,
                fontSize: 12,
                fontWeight: "bold",
                color: "#28a745",
              }}
            >
              ✓ ACCOUNT PAID IN FULL
            </Text>
          )}
        </View>

        {/* Payment Details Table */}
        <View style={styles.tableSection}>
          <Text style={styles.tableTitle}>PAYMENT DETAILS</Text>
          <View style={styles.table}>
            {/* Table Header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
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
                style={[styles.tableCol, styles.tableHeaderText, { flex: 2.5 }]}
              >
                Date
              </Text>
              <Text
                style={[styles.tableCol, styles.tableHeaderText, { flex: 1.5 }]}
              >
                Method
              </Text>
              <Text
                style={[styles.tableCol, styles.tableHeaderText, { flex: 2.5 }]}
              >
                Reference
              </Text>
            </View>

            {/* Table Rows */}
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <View
                  key={payment.id || index}
                  style={[
                    styles.tableRow,
                    {
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                    },
                  ]}
                >
                  <Text
                    style={[styles.tableCol, styles.tableText, { flex: 1 }]}
                  >
                    {payment.id}
                  </Text>
                  <Text
                    style={[
                      styles.tableCol,
                      styles.tableText,
                      { flex: 2, fontWeight: "bold", color: "#28a745" },
                    ]}
                  >
                    ${Number(payment.amount).toFixed(2)}
                  </Text>
                  <Text
                    style={[styles.tableCol, styles.tableText, { flex: 2.5 }]}
                  >
                    {dayjs(payment.paymentDate).format("MMM DD, YYYY")}
                  </Text>
                  <Text
                    style={[styles.tableCol, styles.tableText, { flex: 1.5 }]}
                  >
                    {payment.method}
                  </Text>
                  <Text
                    style={[styles.tableCol, styles.tableText, { flex: 2.5 }]}
                  >
                    {payment.transactionReference || "No reference"}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.tableRow}>
                <Text
                  style={[
                    styles.tableCol,
                    styles.tableText,
                    { flex: 1, textAlign: "center", fontStyle: "italic" },
                  ]}
                >
                  No payments recorded
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Recent Notes Section */}
        {(() => {
          const allNotes = [];
          payments.forEach((payment) => {
            if (payment.estimate?.technicianDiagnostic?.notes) {
              allNotes.push(...payment.estimate.technicianDiagnostic.notes);
            }
            if (payment.technicianDiagnostic?.notes) {
              allNotes.push(...payment.technicianDiagnostic.notes);
            }
          });

          const sortedNotes = allNotes
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 3);

          return sortedNotes.length > 0 ? (
            <View style={styles.notesSection}>
              <Text style={styles.sectionTitle}>Recent Service Notes</Text>
              {sortedNotes.map((note, index) => (
                <View key={note.id || index} style={styles.noteItem}>
                  <Text style={styles.noteDate}>
                    {dayjs(note.createdAt).format("MMM DD, YYYY HH:mm")}
                  </Text>
                  <Text style={styles.noteContent}>{note.content}</Text>
                </View>
              ))}
            </View>
          ) : null;
        })()}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Generated on {formattedDate} | Thank you for your business!
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default ClientPaymentPDF;
