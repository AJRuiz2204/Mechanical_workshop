import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Link,
  Image,
} from "@react-pdf/renderer";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import logo from "../../../images/logo.png";

// Define PDF styles - Updated with PaymentPDF styles
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
 * EstimatePDF Component
 *
 * Description:
 * This component generates a PDF document for an estimate using the @react-pdf/renderer library.
 * It shows workshop information, customer and vehicle details, a list of items (parts, labor, flat rates),
 * calculated totals, and customer notes. The PDF also includes a header with the workshop logo
 * and a footer with disclaimers.
 *
 * Props:
 * - pdfData: An object containing all necessary data to populate the PDF, including workshopData,
 *   customer, vehicle, items, totals, and customerNote.
 */
const EstimatePDF = ({ pdfData }) => {
  // Handle data safely with default values to avoid undefined errors
  const safeWorkshopData = pdfData?.workshopData || {};
  const safeCustomer = pdfData?.customer || {};
  const safeVehicle = pdfData?.vehicle || {};
  const safeItems = pdfData?.items || [];
  const totals = pdfData?.totals || {};
  const customerNote = pdfData?.customerNote || "";
  const mileage = pdfData?.mileage || 0;
  const estimateId = pdfData?.estimateId || pdfData?.estimate?.id;
  const isInvoice = pdfData?.isInvoice || false; // Flag to determine if this is an invoice or quote

  /**
   * Formats the date string for "Last Updated".
   * Adjusts the time according to the time zone if necessary.
   *
   * @param {string} dateString - The date string to format.
   * @returns {string} - The formatted date string.
   */
  const formatLastUpdated = (dateString) => {
    if (!dateString) return "";
    return dayjs(dateString)
      .subtract(6, "hour") // Adjust according to your time zone
      .format("YYYY-MM-DD HH:mm:ss");
  };

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

          {/* Container for Workshop and Quote Information */}
          <View style={styles.headerInfoContainer}>
            {/* Workshop Information */}
            <View style={styles.workshopInfo}>
              <Text style={styles.textLine}>
                {safeWorkshopData.workshopName}
              </Text>
              <Text style={styles.textLine}>
                {safeWorkshopData.address || ""}
              </Text>
              <Text style={styles.textLine}>
                {safeWorkshopData.primaryPhone || ""}
              </Text>
              {safeWorkshopData.secondaryPhone && (
                <Text style={styles.textLine}>
                  {safeWorkshopData.secondaryPhone}
                </Text>
              )}
              <Text style={styles.textLine}>
                Fax: {safeWorkshopData.fax || ""}
              </Text>
              <Text style={styles.textLine}>
                {safeWorkshopData.email || ""}
              </Text>
              {safeWorkshopData.websiteUrl && (
                <Link src={safeWorkshopData.websiteUrl} style={styles.link}>
                  {safeWorkshopData.websiteUrl}
                </Link>
              )}
            </View>

            {/* Quote Information */}
            <View style={styles.quoteInfo}>
              <Text style={[styles.textLine, { fontWeight: "bold" }]}>
                {isInvoice ? "Invoice" : "Quote"} # {estimateId || "N/A"}
              </Text>
              <Text style={styles.textLine}>
                Date: {dayjs().format("MMM DD, YYYY")}
              </Text>
              <Text style={styles.textLine}>
                Last Updated: {formatLastUpdated(safeWorkshopData.lastUpdated)}
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
            <Text style={styles.textLine}>
              {safeCustomer.name} {safeCustomer.lastName}
            </Text>
            {safeCustomer.email && (
              <Text style={styles.textLine}>{safeCustomer.email}</Text>
            )}
            <Text style={styles.textLine}>
              {safeCustomer.primaryNumber || "N/A"}{" "}
              {/* Mostrar primaryNumber */}
            </Text>
            {safeCustomer.address && (
              <Text style={styles.textLine}>{safeCustomer.address}</Text>
            )}
            {safeCustomer.city && safeCustomer.state && (
              <Text style={styles.textLine}>
                {safeCustomer.city}, {safeCustomer.state}{" "}
                {safeCustomer.zip || ""}
              </Text>
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.sectionTitle}>Vehicle</Text>
            <Text style={styles.textLine}>
              {safeVehicle.year} {safeVehicle.make} {safeVehicle.model}
            </Text>
            <Text style={styles.textLine}>
              Engine: {safeVehicle.engine || "N/A"}
            </Text>
            <Text style={styles.textLine}>VIN: {safeVehicle.vin || "N/A"}</Text>
            <Text style={styles.textLine}>
              Mileage: {mileage.toLocaleString()} miles {/* Mostrar mileage */}
            </Text>
          </View>
        </View>

        {/* Customer Notes Section */}
        {customerNote && (
          <View style={styles.noteSection}>
            <Text style={styles.sectionTitle}>
              Description of labor or services:
            </Text>
            <Text>{customerNote}</Text>
          </View>
        )}

        {/* Items Table */}
        <View style={styles.table}>
          {/* Table Headers */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text
              style={[styles.tableCol, styles.colType, styles.tableHeaderText]}
            >
              Item
            </Text>
            <Text
              style={[styles.tableCol, styles.colDesc, styles.tableHeaderText]}
            >
              description
            </Text>
            <Text
              style={[styles.tableCol, styles.colPart, styles.tableHeaderText]}
            >
              Part#
            </Text>
            <Text
              style={[
                styles.tableCol,
                styles.colQuantityHours,
                styles.tableHeaderText,
              ]}
            >
              Qty/Hrs
            </Text>
            <Text
              style={[
                styles.tableCol,
                styles.colExtendedPrice,
                styles.tableHeaderText,
              ]}
            >
              Price
            </Text>
            <Text
              style={[styles.tableCol, styles.colTax, styles.tableHeaderText]}
            >
              Extended
            </Text>
          </View>

          {/* Table Rows */}
          {safeItems.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.colType, styles.tableText]}>
                {item.type || "N/A"}
              </Text>
              <Text style={[styles.tableCol, styles.colDesc, styles.tableText]}>
                {item.description || ""}
              </Text>
              <Text style={[styles.tableCol, styles.colPart, styles.tableText]}>
                {item.type === "Part" ? item.partNumber || "N/A" : "-"}
              </Text>
              <Text
                style={[
                  styles.tableCol,
                  styles.colQuantityHours,
                  styles.tableText,
                ]}
              >
                {item.type === "Labor"
                  ? "-"
                  : parseFloat(item.quantity || 0).toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.tableCol,
                  styles.colExtendedPrice,
                  styles.tableText,
                ]}
              >
                ${parseFloat(item.listPrice || 0).toFixed(2)}
              </Text>
              <Text style={[styles.tableCol, styles.colTax, styles.tableText]}>
                ${parseFloat(item.extendedPrice || 0).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Totals Section */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Parts Total:</Text>
            <Text style={styles.totalAmount}>
              ${(totals?.partsTotal || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Labor Total:</Text>
            <Text style={styles.totalAmount}>
              ${(totals?.laborTotal || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Others Total:</Text>
            <Text style={styles.totalAmount}>
              ${(totals?.othersTotal || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Parts Tax:</Text>
            <Text style={styles.totalAmount}>
              ${(totals?.partsTax || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Labor Tax:</Text>
            <Text style={styles.totalAmount}>
              ${(totals?.laborTax || 0).toFixed(2)}
            </Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={[styles.totalLabel, styles.grandTotalText]}>
              Total:
            </Text>
            <Text style={[styles.totalAmount, styles.grandTotalText]}>
              ${(totals?.total || 0).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Footer Section */}
        <View style={styles.footer}>
          {safeWorkshopData.disclaimer && (
            <Text style={{ marginBottom: 5 }}>
              {safeWorkshopData.disclaimer}
            </Text>
          )}
          <Text style={{ textAlign: "right" }}>Page 1/1</Text>
        </View>
      </Page>
    </Document>
  );
};

EstimatePDF.propTypes = {
  pdfData: PropTypes.shape({
    workshopData: PropTypes.shape({
      workshopName: PropTypes.string,
      address: PropTypes.string,
      primaryPhone: PropTypes.string,
      secondaryPhone: PropTypes.string,
      fax: PropTypes.string,
      websiteUrl: PropTypes.string,
      email: PropTypes.string,
      disclaimer: PropTypes.string,
    }),
    customer: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
      primaryPhone: PropTypes.string,
      secondaryPhone: PropTypes.string,
      address: PropTypes.string,
    }),
    vehicle: PropTypes.shape({
      year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      make: PropTypes.string,
      model: PropTypes.string,
      color: PropTypes.string,
      licensePlate: PropTypes.string,
      vin: PropTypes.string,
    }),
    items: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string,
        description: PropTypes.string,
        quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        unitPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        taxAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      })
    ),
    totals: PropTypes.shape({
      partsTotal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      laborTotal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      othersTotal: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      partsTax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      laborTax: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    customerNote: PropTypes.string,
    mileage: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    estimateId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    isInvoice: PropTypes.bool,
    estimate: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  }),
};

export default EstimatePDF;
