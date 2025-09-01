import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Link,
} from "@react-pdf/renderer";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import logo from "../../../images/logo.png";

// Define PDF styles with PaymentPDF structure
const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontFamily: "Helvetica",
    fontSize: 10,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottom: "1px solid #000",
  },
  logoSection: {
    width: 150,
  },
  companyName: {
    fontSize: 18,
    marginBottom: 3,
    color: "#2596be",
    textAlign: "right",
  },
  companyInfo: {
    flex: 1,
    textAlign: "right",
  },
  companyText: {
    fontSize: 12,
    marginBottom: 3,
    color: "#000000",
  },
  billSection: {
    flexDirection: "row",
    marginBottom: 25,
    paddingBottom: 10,
  },
  billTo: {
    flex: 1,
    paddingRight: 20,
  },
  vehicleInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: "bold",
  },
  infoText: {
    fontSize: 10,
    marginBottom: 8,
  },
  // Service description with border-bottom; displays extendedDiagnostic if available
  serviceDescription: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 10,
    marginBottom: 20,
    fontSize: 10,
    textTransform: "uppercase",
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 20,
  },
  // Table styles for combined items (Parts, Labors, FlatFees)
  table: {
    marginTop: 10,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 5,
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: "#000",
  },
  tableText: {
    fontSize: 9,
  },
  colType: {
    width: "12%",
    textAlign: "left",
    paddingLeft: 2,
  },
  colDesc: {
    width: "48%",
    paddingLeft: 2,
  },
  colPart: {
    width: "12%",
    textAlign: "left",
    paddingLeft: 2,
  },
  colQuantityHours: {
    width: "8%",
    textAlign: "center",
  },
  colListPrice: {
    width: "20%",
    textAlign: "right",
    paddingRight: 2,
  },
  colExtendedPrice: {
    width: "16%",
    textAlign: "center",
    paddingRight: 2,
  },
  historyAndTotals: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  paymentHistoryContainer: {
    width: "45%",
  },
  historyHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 5,
    marginBottom: 8,
  },
  historyRow: {
    flexDirection: "row",
    paddingVertical: 4,
  },
  colDate: {
    width: "30%",
    fontSize: 10,
  },
  colAmount: {
    width: "25%",
    fontSize: 10,
    textAlign: "right",
  },
  colReference: {
    width: "45%",
    fontSize: 10,
    paddingLeft: 5,
  },
  totalsSection: {
    marginLeft: "auto",
    width: "45%",
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  totalLabel: {
    fontSize: 10,
    width: 100,
    textAlign: "right",
    paddingRight: 10,
  },
  totalAmount: {
    fontSize: 10,
    width: 80,
    textAlign: "right",
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    alignSelf: "flex-end",
    marginVertical: 4,
    width: 120,
  },
  paymentOptions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 10,
  },
  // Disclaimer style for footer
  disclaimer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#000000",
    paddingTop: 8,
    backgroundColor: "#ffffff",
  },
  boldContentText: {
    fontWeight: "bold",
  },
  // Notes section styles
  notesSection: {
    marginTop: 15,
    marginBottom: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#000",
  },
  noteItem: {
    marginBottom: 8,
    paddingLeft: 5,
  },
  noteDate: {
    fontSize: 8,
    fontWeight: "bold",
    marginBottom: 2,
  },
  noteContent: {
    fontSize: 10,
    lineHeight: 1.2,
  },
  // Legacy styles for backward compatibility
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 5,
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
  infoSection: {
    flexDirection: "row",
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  noteSection: {
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
  },
  tableCol: {
    padding: 2,
  },
  colTax: {
    width: "16%",
    textAlign: "center",
  },
  grandTotal: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#000000",
  },
  grandTotalText: {
    fontWeight: "bold",
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
  mileage: {
    fontSize: 10,
    marginVertical: 4,
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
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image
              src={logo}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
              }}
            />
          </View>
          <View style={styles.headerInfoContainer}>
            {/* Workshop Information */}
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

            {/* Payment Invoice Information */}
            <View style={styles.quoteInfo}>
              <Text style={[styles.textLine, { fontWeight: "bold" }]}>
                Payment Statement # {quoteNumber}
              </Text>
              <Text style={styles.textLine}>
                Generated: {dayjs().format("MMM DD, YYYY")}
              </Text>
              <Text style={styles.textLine}>
                Last Updated: {formatLastUpdated(workshopData.lastUpdated)}
              </Text>
            </View>
          </View>
        </View>

        {/* Separator Line */}
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#e0e0e0",
            marginTop: 5,
            marginBottom: 5,
          }}
        />

        {/* Customer and Vehicle Information */}
        <View style={styles.infoSection}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.sectionTitle}>Customer</Text>
            <Text style={styles.textLine}>{customer.fullName || "N/A"}</Text>
            {customer.email && (
              <Text style={styles.textLine}>{customer.email}</Text>
            )}
            <Text style={styles.textLine}>
              {customer.primaryPhone || "N/A"}
            </Text>
            {customer.address && (
              <Text style={styles.textLine}>{customer.address}</Text>
            )}
            {customer.city && customer.state && (
              <Text style={styles.textLine}>
                {customer.city}, {customer.state} {customer.zip || ""}
              </Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Vehicle</Text>
            {vehicle &&
            (vehicle.year || vehicle.make || vehicle.model || vehicle.vin) ? (
              <>
                <Text style={styles.textLine}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </Text>
                <Text style={styles.textLine}>VIN: {vehicle.vin || "N/A"}</Text>
                {vehicle.color && (
                  <Text style={styles.textLine}>Color: {vehicle.color}</Text>
                )}
                {vehicle.licensePlate && (
                  <Text style={styles.textLine}>
                    License: {vehicle.licensePlate}
                  </Text>
                )}
              </>
            ) : (
              <Text style={styles.textLine}>
                No vehicle information available
              </Text>
            )}
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Initial Balance:</Text>
            <Text style={styles.totalAmount}>
              ${Number(initialBalance).toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Payments:</Text>
            <Text style={styles.totalAmount}>
              -${totalPaid.toFixed(2)}
            </Text>
          </View>
          <View style={styles.separator} />
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={[styles.totalLabel, styles.grandTotalText]}>
              Remaining Balance:
            </Text>
            <Text style={[styles.totalAmount, styles.grandTotalText]}>
              ${Number(remainingBalance).toFixed(2)}
            </Text>
          </View>
          {Number(remainingBalance) === 0 && (
            <Text
              style={{
                textAlign: "center",
                marginTop: 10,
                fontSize: 10,
                fontWeight: "bold",
              }}
            >
              ✓ ACCOUNT PAID IN FULL
            </Text>
          )}
        </View>

        {/* Payment Details Table */}
        <View style={styles.table}>
          {/* Table Headers */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text
              style={[styles.tableCol, styles.colType, styles.tableHeaderText]}
            >
              ID
            </Text>
            <Text
              style={[styles.tableCol, styles.colDesc, styles.tableHeaderText]}
            >
              Amount
            </Text>
            <Text
              style={[styles.tableCol, styles.colPart, styles.tableHeaderText]}
            >
              Date
            </Text>
            <Text
              style={[
                styles.tableCol,
                styles.colQuantityHours,
                styles.tableHeaderText,
              ]}
            >
              Method
            </Text>
            <Text
              style={[
                styles.tableCol,
                styles.colExtendedPrice,
                styles.tableHeaderText,
              ]}
            >
              Reference
            </Text>
          </View>

          {/* Table Rows */}
          {payments.length > 0 ? (
            payments.map((payment, index) => (
              <View
                key={payment.id || index}
                style={styles.tableRow}
              >
                <Text
                  style={[styles.tableCol, styles.colType, styles.tableText]}
                >
                  {payment.id}
                </Text>
                <Text
                  style={[
                    styles.tableCol,
                    styles.colDesc,
                    styles.tableText,
                    styles.boldContentText,
                  ]}
                >
                  ${Number(payment.amount).toFixed(2)}
                </Text>
                <Text
                  style={[styles.tableCol, styles.colPart, styles.tableText]}
                >
                  {dayjs(payment.paymentDate).format("MMM DD, YYYY")}
                </Text>
                <Text
                  style={[
                    styles.tableCol,
                    styles.colQuantityHours,
                    styles.tableText,
                  ]}
                >
                  {payment.method}
                </Text>
                <Text
                  style={[
                    styles.tableCol,
                    styles.colExtendedPrice,
                    styles.tableText,
                  ]}
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
                  { textAlign: "center", fontStyle: "italic", width: "100%" },
                ]}
              >
                No payments recorded
              </Text>
            </View>
          )}
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

ClientPaymentPDF.propTypes = {
  pdfData: PropTypes.shape({
    workshopData: PropTypes.shape({
      workshopName: PropTypes.string,
      address: PropTypes.string,
      primaryPhone: PropTypes.string,
      secondaryPhone: PropTypes.string,
      fax: PropTypes.string,
      websiteUrl: PropTypes.string,
      email: PropTypes.string,
      lastUpdated: PropTypes.string,
    }),
    customer: PropTypes.shape({
      fullName: PropTypes.string,
      email: PropTypes.string,
      primaryPhone: PropTypes.string,
      address: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      zip: PropTypes.string,
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    vehicle: PropTypes.shape({
      year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      make: PropTypes.string,
      model: PropTypes.string,
      color: PropTypes.string,
      licensePlate: PropTypes.string,
      vin: PropTypes.string,
    }),
    payments: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        paymentDate: PropTypes.string,
        method: PropTypes.string,
        transactionReference: PropTypes.string,
        remainingBalance: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),
        initialBalance: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),
      })
    ),
  }),
};

export default ClientPaymentPDF;
