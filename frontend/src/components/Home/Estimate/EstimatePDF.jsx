/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
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
import { getWorkshopSettings } from "../../../services/workshopSettingsService";
import logo from "../../../images/logo.png";

// Styles definition for PDF document
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  // Header container styles
  headerContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  // Logo container on the left
  logoSection: {
    width: 150,
    height: 150,
    marginRight: 20,
  },
  // Header information container
  headerInfo: {
    flex: 1,
    flexDirection: "column",
  },
  // Quote information styles at the top right
  quoteInfo: {
    alignItems: "flex-end",
    marginBottom: 15,
  },
  // Workshop information styles
  workshopInfo: {
    alignItems: "flex-end",
  },
  // Title and text styles
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  textLine: {
    fontSize: 9,
    marginBottom: 2,
  },
  link: {
    textDecoration: "underline",
    color: "blue",
    fontSize: 9,
  },
  // Information section styles
  infoSection: {
    marginTop: 15,
    marginBottom: 20,
    flexDirection: "row",
    padding: 10,
    borderBottom: 1,
    borderBottomColor: "#e0e0e0",
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
  },
  // Note section styles
  noteSection: {
    marginBottom: 15,
    padding: 10,
    borderBottom: 1,
    borderBottomColor: "#e0e0e0",
  },
  // Table styles remain the same as original
  table: {
    display: "table",
    width: "auto",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  tableHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    backgroundColor: "#f5f5f5",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    minHeight: 24,
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
  colList: {
    width: "10%",
    textAlign: "right",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  colExtended: {
    width: "12%",
    textAlign: "right",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  colTax: {
    width: "8%",
    textAlign: "center",
  },
  // Totals section styles
  totalsSection: {
    marginTop: 15,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  totalLabel: {
    width: 100,
    textAlign: "right",
    marginRight: 10,
    fontSize: 9,
  },
  totalAmount: {
    width: 80,
    textAlign: "right",
    fontSize: 9,
  },
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
    borderTop: 1,
    borderTopColor: "#e0e0e0",
    paddingTop: 10,
  },
});

const EstimatePDF = ({
  workshopData,
  customer,
  vehicle,
  items,
  totals,
  customerNote,
}) => {
  // State for workshop settings
  const [workshopSettings, setWorkshopSettings] = useState(null);

  // Fetch workshop settings on component mount
  useEffect(() => {
    const fetchWorkshopSettings = async () => {
      try {
        const settings = await getWorkshopSettings();
        setWorkshopSettings(settings);
      } catch (error) {
        console.error("Error loading workshop settings:", error);
      }
    };
    fetchWorkshopSettings();
  }, []);

  // Safe data handling with defaults
  const safeWorkshopData = workshopSettings || {};
  const safeCustomer = customer || {};
  const safeVehicle = vehicle || {};
  const safeItems = items || [];

  // Format date string for last updated
  const formatLastUpdated = (dateString) => {
    if (!dateString) return "";
    return dayjs(dateString).subtract(6, "hour").format("YYYY-MM-DD HH:mm:ss");
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header Section */}
        <View style={styles.headerContainer}>
          {/* Logo Space */}
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

        {/* Rest of the component remains unchanged */}
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

        {customerNote && (
          <View style={styles.noteSection}>
            <Text style={styles.sectionTitle}>Customer Note:</Text>
            <Text>{customerNote}</Text>
          </View>
        )}

        <View style={styles.table}>
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
              List Price
            </Text>
            <Text
              style={[styles.tableCol, styles.colList, styles.tableHeaderText]}
            >
              List
            </Text>
            <Text
              style={[
                styles.tableCol,
                styles.colExtended,
                styles.tableHeaderText,
              ]}
            >
              Extended
            </Text>
            <Text
              style={[styles.tableCol, styles.colTax, styles.tableHeaderText]}
            >
              Tax?
            </Text>
          </View>

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
                ${parseFloat(item.listPrice || 0).toFixed(2)}
              </Text>
              <Text style={[styles.tableCol, styles.colList, styles.tableText]}>
                {item.type === "Part"
                  ? `$${parseFloat(item.listPrice || 0).toFixed(2)}`
                  : "-"}
              </Text>
              <Text
                style={[styles.tableCol, styles.colExtended, styles.tableText]}
              >
                ${parseFloat(item.extended || 0).toFixed(2)}
              </Text>
              <Text style={[styles.tableCol, styles.colTax, styles.tableText]}>
                {item.taxable ? "Yes" : "No"}
              </Text>
            </View>
          ))}
        </View>

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
