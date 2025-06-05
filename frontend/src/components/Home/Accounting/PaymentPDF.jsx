import { useEffect, useState } from "react";
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
import { getWorkshopSettings } from "../../../services/workshopSettingsService";

// Format a date using dayjs
const formatDate = (date) => dayjs(date).format("MMM-DD-YYYY");
// Format a number as currency
const formatCurrency = (amount) =>
  isNaN(Number(amount)) ? "-" : `$ ${Number(amount).toFixed(2)}`;

// Define PDF styles with very small fonts for an A4 document
const styles = StyleSheet.create({
  page: {
    padding: 15,
    fontFamily: "Helvetica",
    fontSize: 6,
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
    fontSize: 8,
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
    fontSize: 8,
    marginBottom: 4,
    fontWeight: "bold",
  },
  infoText: {
    fontSize: 8,
    marginBottom: 8,
  },
  // Service description with border-bottom; displays extendedDiagnostic if available
  serviceDescription: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    paddingBottom: 10,
    marginBottom: 20,
    fontSize: 6,
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
  colType: {
    width: "8%",
    textAlign: "left",
    paddingLeft: 2,
  },
  colDesc: {
    width: "52%",
    paddingLeft: 2,
  },
  colPart: {
    width: "12%",
    textAlign: "left",
    paddingLeft: 2,
  },
  colQuantityHours: {
    width: "12%",
    textAlign: "center",
  },
  colListPrice: {
    width: "20%",
    textAlign: "right",
    paddingRight: 2,
  },
  colExtendedPrice: {
    width: "20%",
    textAlign: "right",
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
    width: "50%",
    fontSize: 6,
  },
  colAmount: {
    width: "50%",
    fontSize: 6,
    textAlign: "right",
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
    fontSize: 6,
    width: 100,
    textAlign: "right",
    paddingRight: 10,
  },
  totalAmount: {
    fontSize: 6,
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
    bottom: 35,
    left: 35,
    right: 35,
    fontSize: 5,
    borderTopWidth: 1,
    borderTopColor: "#000000",
    paddingTop: 10,
  },
  boldContentText: {
    fontWeight: "bold",
  },
});

// PaymentPDF Component
// This component generates an A4 PDF for payment details with very small fonts. It displays header, customer/vehicle info,
// a service description (using extendedDiagnostic if available), a combined items table, a side-by-side section for payment history and totals,
// and finally a signature and disclaimer.
const PaymentPDF = ({ pdfData }) => {
  // Standardize the data format: if pdfData is an array, wrap it in an object with a "payments" property.
  let wrapper = Array.isArray(pdfData) ? { payments: pdfData } : pdfData;
  const payments = wrapper.payments || [];
  // Use the first payment for common data (invoice, customer, vehicle, estimate)
  const payment = payments.length > 0 ? payments[0] : wrapper;
  const customer = payment.customer || {};
  const vehicle = payment.vehicle || {};
  const estimate = payment.estimate || {};

  // Retrieve workshop settings either from wrapper or via service
  const workshopData = wrapper.workshopData || null;
  const [fetchedWorkshopSettings, setFetchedWorkshopSettings] = useState(null);
  useEffect(() => {
    if (!workshopData) {
      const fetchSettings = async () => {
        try {
          const settings = await getWorkshopSettings();
          setFetchedWorkshopSettings(settings);
        } catch (error) {
          console.error("Error fetching workshop settings:", error);
        }
      };
      fetchSettings();
    }
  }, [workshopData]);
  const usedWorkshopData = workshopData || fetchedWorkshopSettings;

  // Combine items from parts, labors, and flatFees for the items table
  const combinedItems = [
    ...(estimate.parts || []),
    ...(estimate.labors || []),
    ...(estimate.flatFees || []),
  ];

  // Functions to calculate totals for parts and labor
  const calculatePartsTotal = (parts) =>
    parts?.reduce((total, part) => total + part.extendedPrice, 0) || 0;
  const calculateLaborTotal = (labors) =>
    labors?.reduce((total, labor) => total + labor.extendedPrice, 0) || 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header: Workshop logo and company info */}
        {usedWorkshopData ? (
          <View style={styles.header}>
            <View style={styles.logoSection}>
              <Image src={logo} />
            </View>
            <View>
              <View style={styles.companyInfo}>
                <Text style={styles.companyName}>
                  {usedWorkshopData.workshopName || "Workshop Name"}
                </Text>
                <Text style={styles.companyText}>
                  {usedWorkshopData.address || "Workshop Address"}
                </Text>
                <Text style={styles.companyText}>
                  {usedWorkshopData.primaryPhone}
                  {usedWorkshopData.secondaryPhone
                    ? `, ${usedWorkshopData.secondaryPhone}`
                    : ""}
                  {usedWorkshopData.fax ? ` Fax ${usedWorkshopData.fax}` : ""}
                </Text>
                <Text style={styles.companyText}>
                  {usedWorkshopData.email || ""}
                </Text>
                <Text style={styles.companyText}>
                  {usedWorkshopData.websiteUrl || ""}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.header}>
            <View style={styles.logoSection}>
              <Image src={logo} />
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyText}>Default Workshop Name</Text>
              <Text style={styles.companyText}>Default Address</Text>
            </View>
          </View>
        )}

        {/* Customer and Vehicle Info */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-evenly",
            marginBottom: 10,
            borderBottom: "1px solid #000",
          }}
        >
          {/* Columna 1: Bill To */}
          <View style={{ flex: 1, padding: 5 }}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={styles.infoText}>{customer.fullName || ""}</Text>
            <Text style={styles.infoText}>{customer.primaryPhone || ""}</Text>
          </View>
          {/* Columna 2: Información del vehículo (Make, Model, Year) */}
          <View style={{ flex: 1, padding: 5 }}>
            <Text style={styles.sectionTitle}>Vehicle</Text>
            <Text style={styles.infoText}>Make: {vehicle.make || ""}</Text>
            <Text style={styles.infoText}>Model: {vehicle.model || ""}</Text>
            <Text style={styles.infoText}>Year: {vehicle.year || ""}</Text>
          </View>
          {/* Columna 3: VIN, Engine, Mileage con encabezado Invoice # */}
          <View style={{ flex: 1, padding: 5 }}>
            <Text style={styles.sectionTitle}>
              Invoice #{estimate.id || ""}
            </Text>
            <Text style={styles.infoText}>VIN: {vehicle.vin || ""}</Text>
            <Text style={styles.infoText}>
              Engine: {vehicle.engine || estimate.vehicle?.engine || ""}
            </Text>
            <Text style={styles.infoText}>
              Mileage:{" "}
              {estimate.technicianDiagnostic?.mileage ?? estimate.mileage ?? ""}
            </Text>
          </View>
          {/* Columna 4: Fecha */}
          <View style={{ flex: 1, padding: 5 }}>
            <Text style={styles.sectionTitle}>Date</Text>
            <Text style={styles.infoText}>
              {formatDate(payment.paymentDate)}
            </Text>
          </View>
        </View>
        {/* Service Description */}
        <View style={styles.serviceDescription}>
          <Text>
            DESCRIPTION OF LABOR OR SERVICE:{" "}
            <Text style={styles.boldContentText}>
              {estimate.technicianDiagnostic
                ? estimate.technicianDiagnostic.extendedDiagnostic
                : estimate.customerNote || ""}
            </Text>
          </Text>
        </View>
        {/* Items Table: Parts, Labors, FlatFees */}
        {combinedItems.length > 0 ? (
          combinedItems.map((item, idx) => (
            <View key={idx} style={styles.tableRow}>
              <Text style={[styles.colType, styles.tableText]}>
                {item.type || "-"}
              </Text>
              <Text style={[styles.colDesc, styles.tableText]}>
                {item.description || ""}
              </Text>
              <Text style={[styles.colPart, styles.tableText]}>
                {item.type && item.type.toUpperCase().includes("PART")
                  ? item.partNumber || ""
                  : "-"}
              </Text>
              <Text style={[styles.colQuantityHours, styles.tableText]}>
                {item.type && item.type.toUpperCase().includes("LABOR")
                  ? item.quantity
                    ? `${item.quantity} hrs`
                    : "-"
                  : item.quantity
                  ? item.quantity
                  : "-"}
              </Text>
              <Text style={[styles.colListPrice, styles.tableText]}>
                {formatCurrency(item.listPrice)}
              </Text>
              <Text style={[styles.colExtendedPrice, styles.tableText]}>
                {formatCurrency(item.extendedPrice)}
              </Text>
            </View>
          ))
        ) : (
          // Renderiza una fila vacía si no hay items
          <View style={styles.tableRow}>
            <Text style={[styles.colType, styles.tableText]}> </Text>
            <Text style={[styles.colDesc, styles.tableText]}> </Text>
            <Text style={[styles.colPart, styles.tableText]}> </Text>
            <Text style={[styles.colQuantityHours, styles.tableText]}> </Text>
            <Text style={[styles.colListPrice, styles.tableText]}> </Text>
            <Text style={[styles.colExtendedPrice, styles.tableText]}> </Text>
          </View>
        )}

        {/* Payment History and Totals Section */}
        {/* Payment History and Totals Section */}
        <View style={styles.historyAndTotals}>
          {/* Payment History Column */}
          <View style={styles.paymentHistoryContainer}>
            <Text style={styles.sectionTitle}>Payment History</Text>
            <View style={styles.historyHeader}>
              <Text style={styles.colDate}>Date</Text>
              <Text style={styles.colAmount}>Amount</Text>
            </View>
            {payments.map((p, index) => (
              <View key={index} style={styles.historyRow}>
                <Text style={styles.colDate}>{formatDate(p.paymentDate)}</Text>
                <Text style={styles.colAmount}>{formatCurrency(p.amount)}</Text>
              </View>
            ))}
          </View>
          {/* Totals Column */}
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Part :</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(calculatePartsTotal(estimate.parts))}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Labor :</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(calculateLaborTotal(estimate.labors))}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Tax:</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(estimate.tax)}
              </Text>
            </View>
            <View style={styles.separator} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount:</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(estimate.total)}
              </Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Balance:</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(payment.remainingBalance)}
              </Text>
            </View>
          </View>
        </View>

        {/* Signature Section */}
        <View>
          <Text>Signature:</Text>
          <Text style={{ marginTop: 20 }}>
            X _________________________________
          </Text>
          <Text style={{ marginTop: 10 }}>
            Payment: cash ____ card ____ check ____ credit ____
          </Text>
        </View>

        {/* Disclaimer Section */}
        <View style={styles.disclaimer}>
          <Text>
            {
              "Not responsible for damage caused by theft, fire or acts of nature. I authorize the above repairs, along with any necessary materials. I authorize you and your employees to operate my vehicle for the purpose of testing, inspection, and delivery at my risk. An express mechanic's lien is hereby acknowledged on the above vehicle to secure the amount of the repairs thereto. If canceled repairs prior to their completion for any reason, a tear-down and reassembly fee of $____ will be applied."
            }
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// props validation
PaymentPDF.propTypes = {
  pdfData: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired,
};

export default PaymentPDF;
