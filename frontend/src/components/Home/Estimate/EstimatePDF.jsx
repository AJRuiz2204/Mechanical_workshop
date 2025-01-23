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
import logo from "../../../images/logo.png"; // Ensure the path to the logo is correct

// Definition of styles for the PDF document
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  // Styles for the header container
  headerContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  // Space for the logo on the left
  logoSection: {
    width: 150,
    height: 150,
    marginRight: 20,
  },
  // Container for the header information
  headerInfo: {
    flex: 1,
    flexDirection: "column",
  },
  // Styles for the quote information in the top right
  quoteInfo: {
    alignItems: "flex-end",
    marginBottom: 15,
  },
  // Styles for the workshop information
  workshopInfo: {
    alignItems: "flex-end",
  },
  // Styles for text lines
  textLine: {
    fontSize: 9,
    marginBottom: 2,
  },
  // Styles for links
  link: {
    textDecoration: "underline",
    color: "blue",
    fontSize: 9,
  },
  // Information section (Customer and Vehicle)
  infoSection: {
    marginTop: 15,
    marginBottom: 20,
    flexDirection: "row",
    padding: 10,
    borderBottom: 1,
    borderBottomColor: "#e0e0e0",
  },
  // Section titles
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
  },
  // Customer note section
  noteSection: {
    marginBottom: 15,
    padding: 10,
    borderBottom: 1,
    borderBottomColor: "#e0e0e0",
  },
  // Styles for the table
  table: {
    display: "table",
    width: "auto",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
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
    minHeight: 24,
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
    padding: 4,
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
  },
  colPartHours: {
    width: "12%",
    textAlign: "center",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  colNetRate: {
    width: "10%",
    textAlign: "right",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  colQuantity: {
    // New column for Quantity
    width: "10%",
    textAlign: "right",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  colListPrice: {
    // New column for List Price
    width: "12%",
    textAlign: "right",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  colExtendedPrice: {
    // New column for Extended Price
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
    marginTop: 15,
    alignItems: "flex-end",
  },
  // Individual totals rows
  totalRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  // Total label
  totalLabel: {
    width: 150,
    textAlign: "right",
    marginRight: 10,
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
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#000000",
  },
  grandTotalText: {
    fontWeight: "bold",
  },
  // Footer styles
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 10,
  },
});

/**
 * EstimatePDF Component
 *
 * Description:
 * This component generates a PDF document for an estimate using the @react-pdf/renderer library.
 * It displays workshop information, customer and vehicle details, a list of items (parts, labor, flat fees),
 * calculated totals, and customer notes. The PDF also includes a header with the workshop logo and footer with disclaimers.
 *
 * Props:
 * - pdfData: An object containing all necessary data to populate the PDF, including workshopData, customer, vehicle, items, totals, and customerNote.
 */
const EstimatePDF = ({ pdfData }) => {
  // Safely handle data with default values to prevent undefined errors
  const safeWorkshopData = pdfData?.workshopData || {};
  const safeCustomer = pdfData?.customer || {};
  const safeVehicle = pdfData?.vehicle || {};
  const safeItems = pdfData?.items || [];
  const totals = pdfData?.totals || {};
  const customerNote = pdfData?.customerNote || "";

  /**
   * Formats the date string for "Last Updated".
   * Adjusts the time based on timezone if necessary.
   *
   * @param {string} dateString - The date string to format.
   * @returns {string} - The formatted date string.
   */
  const formatLastUpdated = (dateString) => {
    if (!dateString) return "";
    return dayjs(dateString)
      .subtract(6, "hour") // Adjust according to your timezone
      .format("YYYY-MM-DD HH:mm:ss");
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image src={logo} />
          </View>

          {/* Header Information */}
          <View style={styles.headerInfo}>
            {/* Quote Information */}
            <View style={styles.quoteInfo}>
              <Text style={styles.textLine}>
                Quote # {safeWorkshopData.quoteNumber || ""}
              </Text>
              <Text style={styles.textLine}>
                Last Updated: {formatLastUpdated(safeWorkshopData.lastUpdated)}
              </Text>
              <Text style={styles.textLine}>
                Expires: {safeWorkshopData.expiryDate || ""}
              </Text>
            </View>

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
          </View>
        </View>

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
          </View>
        </View>

        {/* Customer Note */}
        {customerNote && (
          <View style={styles.noteSection}>
            <Text style={styles.sectionTitle}>Customer Note:</Text>
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
              Type
            </Text>
            <Text
              style={[styles.tableCol, styles.colDesc, styles.tableHeaderText]}
            >
              Description
            </Text>
            <Text
              style={[
                styles.tableCol,
                styles.colPartHours,
                styles.tableHeaderText,
              ]}
            >
              Part# / Hours
            </Text>
            <Text
              style={[
                styles.tableCol,
                styles.colNetRate,
                styles.tableHeaderText,
              ]}
            >
              Net / Rate
            </Text>
            <Text
              style={[
                styles.tableCol,
                styles.colQuantity,
                styles.tableHeaderText,
              ]}
            >
              Quantity
            </Text>
            <Text
              style={[
                styles.tableCol,
                styles.colListPrice,
                styles.tableHeaderText,
              ]}
            >
              List Price
            </Text>
            <Text
              style={[
                styles.tableCol,
                styles.colExtendedPrice,
                styles.tableHeaderText,
              ]}
            >
              Extended Price
            </Text>
            <Text
              style={[styles.tableCol, styles.colTax, styles.tableHeaderText]}
            >
              Tax?
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
              <Text
                style={[styles.tableCol, styles.colPartHours, styles.tableText]}
              >
                {item.type === "Part"
                  ? item.partNumber
                  : item.type === "Labor"
                  ? `${item.quantity} hrs`
                  : "-"}
              </Text>
              <Text
                style={[styles.tableCol, styles.colNetRate, styles.tableText]}
              >
                ${parseFloat(item.price || 0).toFixed(2)}
              </Text>
              <Text
                style={[styles.tableCol, styles.colQuantity, styles.tableText]}
              >
                {item.quantity}
              </Text>
              <Text
                style={[styles.tableCol, styles.colListPrice, styles.tableText]}
              >
                ${parseFloat(item.listPrice || 0).toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.tableCol,
                  styles.colExtendedPrice,
                  styles.tableText,
                ]}
              >
                ${parseFloat(item.extendedPrice || 0).toFixed(2)}
              </Text>
              <Text style={[styles.tableCol, styles.colTax, styles.tableText]}>
                {item.taxable ? "Yes" : "No"}
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

        {/* Footer */}
        <View style={styles.footer}>
          {safeWorkshopData.disclaimer && (
            <Text style={{ marginBottom: 8 }}>
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
