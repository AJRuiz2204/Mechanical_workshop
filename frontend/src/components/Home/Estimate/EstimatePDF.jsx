/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Link,
  Image,
} from "@react-pdf/renderer";
import dayjs from "dayjs";
import logo from "../../../images/logo.png";

// Define styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 20, //Reduced from 40 to 20 to decrease border space
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  // Styles for the header container
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between", // Distribute space between logo and headerInfoContainer
    alignItems: "flex-start", // Align vertically at the start
    marginBottom: 5,
  },
  // Space for the logo on the left
  logoSection: {
    width: 100, // Adjusted for a more compact size
    height: 100,
    marginRight: 10,
  },
  // Container for workshop and quote information
  headerInfoContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end", // Align everything to the right
    padding: 0,
  },
  // Workshop information
  workshopInfo: {
    marginBottom: 3,
    alignItems: "flex-end",
  },
  // Quote information
  quoteInfo: {
    alignItems: "flex-end",
    padding: 0,
  },
  // Styles for text lines
  textLine: {
    fontSize: 9,
    marginBottom: 1,
  },
  // Styles for links
  link: {
    textDecoration: "underline",
    color: "blue",
    fontSize: 9,
  },
  // Information section (Customer and Vehicle)
  infoSection: {
    flexDirection: "row",
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  // Section titles
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 2,
  },
  // Customer notes section
  noteSection: {
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  // Styles for the table
  table: {
    display: "table",
    width: "auto",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginTop: 5, //Reduced to be closer to the upper container
  },
  // Styles for the table header
  tableHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    backgroundColor: "#f5f5f5",
  },
  // Styles for table rows
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    minHeight: 20, //Reduced for more compact rows
    alignItems: "center",
  },
  // Styles for table header text
  tableHeaderText: {
    fontSize: 8,
    fontWeight: "bold",
  },
  // Styles for table row text
  tableText: {
    fontSize: 8,
  },
  // Styles for table columns
  tableCol: {
    padding: 2,
  },
  colType: {
    width: "8%",
    textAlign: "left",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  colDesc: {
    flex: 2,
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    paddingLeft: 2,
  },
  colPart: {
    width: "12%",
    textAlign: "left",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
    paddingLeft: 2,
  },
  colQuantityHours: {
    width: "12%",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  colListPrice: {
    width: "12%",
    textAlign: "right",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  colExtendedPrice: {
    width: "12%",
    textAlign: "right",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  colTax: {
    width: "8%",
    textAlign: "center",
  },
  // Totals section
  totalsSection: {
    marginTop: 10,
    alignItems: "flex-end",
    paddingRight: 5,
  },
  // Individual total rows
  totalRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  // Total label
  totalLabel: {
    width: 120, // Adjusted
    textAlign: "right",
    marginRight: 5,
    fontSize: 9,
  },
  // Total amount
  totalAmount: {
    width: 80,
    textAlign: "right",
    fontSize: 9,
  },
  // Styles for the grand total
  grandTotal: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#000000",
  },
  grandTotalText: {
    fontWeight: "bold",
  },
  // Styles for the footer
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
  const estimateId = pdfData?.estimateId || pdfData?.estimate?.id; // Get estimate ID

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
            <Image src={logo} style={{ width: "100%", height: "100%" }} />
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
              <Text style={styles.textLine}>
                Quote # {estimateId || "N/A"}
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
            <Text style={styles.textLine}>
              {safeCustomer.email || "customer@email"}
            </Text>
            <Text style={styles.textLine}>
              {safeCustomer.primaryNumber || "N/A"}{" "}
              {/* Mostrar primaryNumber */}
            </Text>
            {safeCustomer.address && (
              <Text style={styles.textLine}>
                {safeCustomer.address}
              </Text>
            )}
            {safeCustomer.city && safeCustomer.state && (
              <Text style={styles.textLine}>
                {safeCustomer.city}, {safeCustomer.state} {safeCustomer.zip || ""}
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
              Mileage: {mileage.toLocaleString()} {/* Mostrar mileage */}
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
              QTY
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
              extended
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
                {item.type === "Part" ? (item.partNumber || "N/A") : "-"}
              </Text>
              <Text
                style={[
                  styles.tableCol,
                  styles.colQuantityHours,
                  styles.tableText,
                ]}
              >
                {item.type === "Labor" 
                  ? `${parseFloat(item.quantity || 0).toFixed(2)} hrs` 
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

export default EstimatePDF;
