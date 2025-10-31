import PropTypes from "prop-types";
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

// --- Helper Functions ---
const formatDate = (date) => dayjs(date).format("MMM-DD-YYYY");
const formatCurrency = (amount) =>
  isNaN(Number(amount)) ? "$0.00" : `$${Number(amount).toFixed(2)}`;

// --- Styles for @react-pdf/renderer ("J BENZ" Format) ---
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Courier",
    fontSize: 9,
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 5,
    borderBottom: "2px solid #eeeeee",
    backgroundColor: "#f9f9f9",
    minHeight: 60,
  },
  headerInfoLeft: {
    width: "30%",
    padding: 5,
  },
  headerLogo: {
    width: "40%",
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  logoImage: {
    maxHeight: 50,
    objectFit: "contain",
  },
  headerInfoRight: {
    width: "30%",
    padding: 5,
    textAlign: "right",
  },
  boldText: {
    fontFamily: "Courier-Bold",
  },
  infoSection: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 10,
  },
  infoBoxLeft: {
    width: "50%",
    padding: 5,
    borderRight: "1px solid #eeeeee",
  },
  infoBoxRight: {
    width: "50%",
    padding: 5,
    paddingLeft: 10,
  },
  mileage: {
    position: "absolute",
    right: 5,
    top: 28,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eeeeee",
    borderTop: "2px solid black",
    borderBottom: "2px solid black",
    paddingVertical: 3,
    paddingHorizontal: 2,
    fontFamily: "Courier-Bold",
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottom: "1px solid #cccccc",
    paddingVertical: 3,
    paddingHorizontal: 2,
  },
  colItem: { width: "10%" },
  colDesc: { width: "35%" },
  colPart: { width: "15%" },
  colQty: { width: "10%", textAlign: "center" },
  colPrice: { width: "15%", textAlign: "right" },
  colExt: { width: "15%", textAlign: "right", paddingRight: 2 },
  tableRowsContainer: {
    minHeight: 250,
  },
  footerSection: {
    flexDirection: "row",
    marginTop: 15,
    marginBottom: 80,
  },
  footerLeft: {
    width: "60%",
    paddingRight: 10,
  },
  footerRight: {
    width: "40%",
    paddingLeft: 10,
  },
  notesSection: {
    marginTop: 10,
    paddingTop: 5,
    borderTop: "1px solid #eeeeee",
  },
  noteItem: {
    marginTop: 3,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  totalFinal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    paddingTop: 5,
    borderTop: "1px solid #cccccc",
    fontFamily: "Courier-Bold",
    fontSize: 10,
  },
  signatureSection: {
    flexDirection: "row",
    marginTop: "auto",
    paddingTop: 20,
    paddingBottom: 60,
    alignItems: "flex-end",
  },
  signatureX: {
    fontSize: 14,
    fontFamily: "Courier-Bold",
  },
  signatureLine: {
    flexGrow: 1,
    borderBottom: "1px solid black",
    marginHorizontal: 10,
    height: 10,
  },
  signatureDate: {
    width: 80,
  },
  signatureLabel: {
    fontSize: 8,
    textAlign: "center",
    position: "absolute",
    bottom: 50,
    left: 40,
    width: 150,
  },
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
    textAlign: "justify",
  },
});

/**
 * PaymentPDF Component
 */
const PaymentPDF = ({ pdfData }) => {
  // --- 1. PaymentPDF Data Extraction Logic ---
  let wrapper = Array.isArray(pdfData) ? { payments: pdfData } : pdfData;
  const payments = wrapper.payments || [];
  const payment = payments.length > 0 ? payments[0] : wrapper;
  const customer = payment.customer || {};
  const vehicle = payment.vehicle || {};
  const estimate = payment.estimate || {};
  const paymentId = payment.id || payments[0]?.id;
  const safeWorkshopData = wrapper.workshopData || {};

  const combinedItems = [
    ...(estimate.parts || []),
    ...(estimate.labors || []),
    ...(estimate.flatFees || []),
  ];

  const calculatePartsTotal = (parts) =>
    parts?.reduce((total, part) => total + (part.extendedPrice || 0), 0) || 0;
  const calculateLaborTotal = (labors) =>
    labors?.reduce((total, labor) => total + (labor.extendedPrice || 0), 0) ||
    0;

  const partsTotal = calculatePartsTotal(estimate.parts);
  const laborTotal = calculateLaborTotal(estimate.labors);

  const getNotes = () => {
    const notes = estimate.technicianDiagnostic?.notes || [];
    return notes
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
  };
  const getPaymentNotes = () => {
    return payments.filter(
      (p) =>
        p.notes &&
        p.notes.trim() !== "" &&
        p.notes !== "No notes" &&
        p.notes !== "No notes"
    );
  };

  const notesToDisplay = getNotes();
  const paymentNotesToDisplay = getPaymentNotes();

  // --- 2. PDF Document Rendering ---

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ===== HEADER SECTION ===== */}
        <View style={styles.header} fixed>
          <View style={styles.headerInfoLeft}>
            <Text style={styles.boldText}>{safeWorkshopData.workshopName}</Text>
            <Text>{safeWorkshopData.address || ""}</Text>
            <Text>Ph: {safeWorkshopData.primaryPhone || ""}</Text>
            {safeWorkshopData.secondaryPhone && (
              <Text>Ph2: {safeWorkshopData.secondaryPhone}</Text>
            )}
            {safeWorkshopData.email && <Text>{safeWorkshopData.email}</Text>}
          </View>

          <View style={styles.headerLogo}>
            <Image src={logo} style={styles.logoImage} />
          </View>

          <View style={styles.headerInfoRight}>
            <Text style={styles.boldText}>Invoice #: {paymentId || "N/A"}</Text>
            <Text>Date: {formatDate(payment.paymentDate)}</Text>
            <Text>Page 1 of 1</Text>
          </View>
        </View>

        {/* ===== CUSTOMER AND VEHICLE INFO ===== */}
        <View style={styles.infoSection}>
          <View style={styles.infoBoxLeft}>
            <Text style={styles.boldText}>
              {customer.fullName || ""} (Authorizer)
            </Text>
            <Text>{estimate.owner?.address || customer.address || ""}</Text>
            {(estimate.owner?.city || customer.city) && (
              <Text>
                {estimate.owner?.city || customer.city},{" "}
                {estimate.owner?.state || customer.state}{" "}
                {estimate.owner?.zip || customer.zip || ""}
              </Text>
            )}
            <Text>M: {customer.primaryPhone || "N/A"}</Text>
            {customer.email && <Text>{customer.email}</Text>}
          </View>

          <View style={styles.infoBoxRight}>
            <Text style={styles.boldText}>
              {vehicle.year} {vehicle.make} {vehicle.model}
            </Text>
            <Text>
              Engine: {vehicle.engine || estimate.vehicle?.engine || "N/A"}
            </Text>
            <Text>VIN: {vehicle.vin || "N/A"}</Text>
            <Text style={styles.mileage}>
              Mileage: In{" "}
              {estimate.technicianDiagnostic?.mileage ?? estimate.mileage ?? 0}{" "}
              | Out 0
            </Text>
          </View>
        </View>

        {/* ===== ITEMS TABLE (HEADER) ===== */}
        <View style={styles.tableHeader} fixed>
          <Text style={styles.colItem}>ITEM</Text>
          <Text style={styles.colDesc}>DESCRIPTION</Text>
          <Text style={styles.colPart}>PART#</Text>
          <Text style={styles.colQty}>QTY/HRS</Text>
          <Text style={styles.colPrice}>PRICE</Text>
          <Text style={styles.colExt}>EXTENDED</Text>
        </View>

        {/* ===== ITEMS TABLE (CONTENT) ===== */}
        <View style={styles.tableRowsContainer}>
          {combinedItems.map((item, i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <Text style={styles.colItem}>{item.type || "N/A"}</Text>
              <Text style={styles.colDesc}>{item.description || ""}</Text>
              <Text style={styles.colPart}>
                {item.type && item.type.toUpperCase().includes("PART")
                  ? item.partNumber || "N/A"
                  : "-"}
              </Text>
              <Text style={styles.colQty}>
                {item.type && item.type.toUpperCase().includes("LABOR")
                  ? item.quantity
                    ? `${item.quantity} hrs`
                    : "-"
                  : item.quantity
                  ? item.quantity
                  : "-"}
              </Text>
              <Text style={styles.colPrice}>
                {formatCurrency(item.listPrice)}
              </Text>
              <Text style={styles.colExt}>
                {formatCurrency(item.extendedPrice)}
              </Text>
            </View>
          ))}
        </View>

        {/* ===== FOOTER (DISCLAIMER AND TOTALS) ===== */}
        <View style={styles.footerSection}>
          {/* --- Left Column: Notes --- */}
          <View style={styles.footerLeft}>
            <Text style={styles.boldText}>
              Description of labor or services:
            </Text>
            <Text>
              {estimate.technicianDiagnostic
                ? estimate.technicianDiagnostic.extendedDiagnostic
                : estimate.customerNote || "N/A"}
            </Text>

            {/* Payment Notes */}
            {paymentNotesToDisplay.length > 0 && (
              <View style={styles.notesSection}>
                <Text style={styles.boldText}>Payment Notes:</Text>
                {paymentNotesToDisplay.map((p, index) => (
                  <View key={index} style={styles.noteItem}>
                    <Text>
                      Method: {p.method} | Ref:{" "}
                      {p.transactionReference || "N/A"}
                    </Text>
                    <Text>Notes: {p.notes}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Technician Notes */}
            {notesToDisplay.length > 0 && (
              <View style={styles.notesSection}>
                <Text style={styles.boldText}>Technician Notes (Last 3):</Text>
                {notesToDisplay.map((note, index) => (
                  <View key={index} style={styles.noteItem}>
                    <Text style={{ fontSize: 8 }}>
                      {formatDate(note.createdAt)}
                    </Text>
                    <Text>{note.content}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* CHANGE: Disclaimer moved to the end */}
          </View>

          {/* --- Right Column: Totals --- */}
          <View style={styles.footerRight}>
            <View style={styles.totalRow}>
              <Text>Part :</Text>
              <Text>{formatCurrency(partsTotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Labor :</Text>
              <Text>{formatCurrency(laborTotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Tax:</Text>
              <Text>{formatCurrency(estimate.tax)}</Text>
            </View>

            <View
              style={{ borderBottom: "1px solid #000", marginVertical: 4 }}
            />

            <View style={styles.totalRow}>
              <Text>Total Amount:</Text>
              <Text>{formatCurrency(estimate.total)}</Text>
            </View>

            {/* Payment History (simplified) */}
            {payments.map((p, index) => (
              <View key={index} style={styles.totalRow}>
                <Text>Payment ({formatDate(p.paymentDate)}):</Text>
                <Text>({formatCurrency(p.amount)})</Text>
              </View>
            ))}

            <View style={styles.totalFinal}>
              <Text>Balance:</Text>
              <Text>{formatCurrency(payment.remainingBalance)}</Text>
            </View>
          </View>
        </View>

        {/* ===== SIGNATURE ===== */}
        {/* CHANGE: No longer 'fixed', uses 'marginTop: auto' */}
        <View style={styles.signatureSection}>
          <Text style={styles.signatureX}>X</Text>
          <View style={styles.signatureLine}></View>
          <Text style={styles.signatureDate}>
            Date {dayjs().format("MM/DD/YYYY")}
          </Text>
          <Text style={styles.signatureLabel}>Customer Signature</Text>
        </View>

        {/* ===== CHANGE: FIXED DISCLAIMER (Original) ===== */}
        {/* This is the block you requested to keep */}
        <View style={styles.disclaimer} fixed>
          <Text>
            {
              " e or acts of nature. I authorize the above repairs, along with any necessary materials. I authorize you and your employees to operate my vehicle for the purpose of testing, inspection, and delivery at my risk. An express mechanic's lien is hereby acknowledged on the above vehicle to secure the amount of the repairs thereto. If canceled repairs prior to their completion for any reason, a tear-down and reassembly fee of $____ will be applied."
            }
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// ... (propTypes remains the same) ...
PaymentPDF.propTypes = {
  pdfData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
};

export default PaymentPDF;
