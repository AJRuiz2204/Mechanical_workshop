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
} from "@react-pdf/renderer";

// Definir estilos
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 15,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  companyName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  link: {
    textDecoration: "underline",
    color: "blue",
  },
  infoSection: {
    marginTop: 15,
    marginBottom: 20,
    flexDirection: "row",
    padding: 10,
    borderBottom: 1,
    borderBottomColor: "#e0e0e0",
  },
  customerInfo: {
    flex: 1,
  },
  vehicleInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 4,
  },
  customerNoteSection: {
    marginBottom: 15,
    padding: 10,
    borderBottom: 1,
    borderBottomColor: "#e0e0e0",
  },
  table: {
    display: "table",
    width: "auto",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    minHeight: 24,
    alignItems: "center",
  },
  tableHeader: {
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
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
    width: "10%",
    textAlign: "right",
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
    width: "10%",
    textAlign: "right",
    borderRightWidth: 1,
    borderRightColor: "#e0e0e0",
  },
  colTax: {
    width: "8%",
    textAlign: "center",
  },
  totalsSection: {
    marginTop: 15,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  totalLabel: {
    width: 100,
    textAlign: "right",
    marginRight: 10,
  },
  totalAmount: {
    width: 80,
    textAlign: "right",
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
  workshopData, // Asegurarse de recibir workshopData como prop
  customer,
  vehicle,
  items,
  totals,
  customerNote,
}) => {
  const safeWorkshopData = workshopData || {};
  const safeCustomer = customer || {};
  const safeVehicle = vehicle || {};
  const safeItems = items || [];

  console.log("Workshop Data en EstimatePDF:", safeWorkshopData); // Para depuración

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>
              {safeWorkshopData.workshopName || "N/A"} {/* Correcto */}
            </Text>
            <Text>{safeWorkshopData.primaryPhone || "N/A"}</Text>
            {safeWorkshopData.secondaryPhone && (
              <Text>{safeWorkshopData.secondaryPhone}</Text>
            )}
            <Text>Fax: {safeWorkshopData.fax || "N/A"}</Text>
            <Text>{safeWorkshopData.email || "N/A"}</Text>
            {safeWorkshopData.websiteUrl && (
              <Link src={safeWorkshopData.websiteUrl} style={styles.link}>
                {safeWorkshopData.websiteUrl}
              </Link>
            )}
          </View>
          <View style={styles.headerRight}>
            <Text style={{ fontWeight: "bold" }}>
              Quote # {safeWorkshopData.quoteNumber || "N/A"}
            </Text>
            <Text>Last Updated: {safeWorkshopData.lastUpdated || "N/A"}</Text>
            <Text>Expires: {safeWorkshopData.expiryDate || "N/A"}</Text>
          </View>
        </View>

        <View style={styles.headerRow}>
          <View style={styles.headerRight}>
            <Text>{safeWorkshopData.address || "N/A"}</Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.customerInfo}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <Text>{`${safeCustomer.name || "N/A"} ${
              safeCustomer.lastName || ""
            }`}</Text>
            <Text>Email: {safeCustomer.email || "N/A"}</Text>
          </View>
          <View style={styles.vehicleInfo}>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            <Text>
              {`${safeVehicle.year || "N/A"} ${safeVehicle.make || ""} ${
                safeVehicle.model || ""
              }`}
            </Text>
            <Text>Engine: {safeVehicle.engine || "N/A"}</Text>
            <Text>Mileage: {safeVehicle.mileage || "N/A"}</Text>
          </View>
        </View>

        {/* Customer Note */}
        {customerNote && (
          <View style={styles.customerNoteSection}>
            <Text style={styles.sectionTitle}>Customer Note:</Text>
            <Text>{customerNote}</Text>
          </View>
        )}

        {/* Items Table */}
        <View style={styles.table}>
          {/* Cabecera de la Tabla */}
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

          {/* Filas de la Tabla */}
          {safeItems.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.colType, styles.tableText]}>
                {item.type || "N/A"}
              </Text>
              <Text style={[styles.tableCol, styles.colDesc, styles.tableText]}>
                {item.description || "N/A"}
              </Text>
              <Text
                style={[styles.tableCol, styles.colPartHours, styles.tableText]}
              >
                {item.type === "Part" ? item.partNumber : item.quantity}
              </Text>
              <Text
                style={[styles.tableCol, styles.colNetRate, styles.tableText]}
              >
                ${parseFloat(item.price || 0).toFixed(2)}
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

        {/* Totales */}
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
          <Text>
            Estimate good for 14 days. Not responsible for damage caused by
            theft, fire or acts of nature. I authorize the above repairs, along
            with any necessary materials.
          </Text>
          <Text style={{ marginTop: 8, textAlign: "right" }}>Page 1/1</Text>
        </View>
      </Page>
    </Document>
  );
};

export default EstimatePDF;
