/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React from "react";
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

// Define styles for the PDF document using @react-pdf/renderer StyleSheet
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
    marginBottom: 5,
  },
  logoSection: {
    width: 100,
    height: 100,
  },
  headerInfoContainer: {
    flex: 1,
    flexDirection: "column",
    alignItems: "flex-end",
  },
  textLine: {
    fontSize: 9,
    marginBottom: 1,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    marginVertical: 5,
  },
  table: {
    display: "table",
    width: "100%",
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
  detailSection: {
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    paddingBottom: 4,
  },
  subSection: {
    marginTop: 4,
    marginLeft: 10,
  },
});

// SalesReportPDF component: Renders a PDF document for a sales report using @react-pdf/renderer.
// The pdfData prop is expected to have the structure defined in SalesReportDto.
const SalesReportPDF = ({ pdfData }) => {
  // Destructure the sales report data from the pdfData prop
  const {
    startDate,
    endDate,
    totalEstimates,
    totalPartsRevenue,
    totalLaborRevenue,
    totalFlatFeeRevenue,
    totalTaxCollected,
    totalPaymentsCollected,
    totalOutstanding,
    createdDate,
    details,
  } = pdfData;

  // Format the dates using dayjs
  const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
  const formattedEndDate = dayjs(endDate).format("YYYY-MM-DD");
  const formattedCreatedDate = dayjs(createdDate).format("YYYY-MM-DD HH:mm:ss");

  return (
    <Document>
      {/* Define a page in the PDF document */}
      <Page size="A4" style={styles.page}>
        {/* Header section with logo and company information */}
        <View style={styles.headerContainer}>
          <View style={styles.logoSection}>
            {/* Display the logo image */}
            <Image src={logo} style={{ width: "100%", height: "100%" }} />
          </View>
          <View style={styles.headerInfoContainer}>
            <Text style={styles.textLine}>My Mechanic Workshop</Text>
            <Text style={styles.textLine}>Fake Street 123</Text>
            <Text style={styles.textLine}>(100) 000-0000</Text>
            <Text style={styles.textLine}>contact@myworkshop.com</Text>
            <Text style={styles.textLine}>
              Report generated: {formattedCreatedDate}
            </Text>
          </View>
        </View>

        {/* Title and period information */}
        <Text style={styles.sectionTitle}>Sales Report</Text>
        <Text style={{ fontSize: 9 }}>
          Period: {formattedStartDate} - {formattedEndDate}
        </Text>

        {/* General totals section */}
        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 9 }}>
            Total Estimates: ${Number(totalEstimates).toFixed(2)}
          </Text>
          <Text style={{ fontSize: 9 }}>
            Total Parts Revenue: ${Number(totalPartsRevenue).toFixed(2)}
          </Text>
          <Text style={{ fontSize: 9 }}>
            Total Labor Revenue: ${Number(totalLaborRevenue).toFixed(2)}
          </Text>
          <Text style={{ fontSize: 9 }}>
            Total Flat Fee Revenue: ${Number(totalFlatFeeRevenue).toFixed(2)}
          </Text>
          <Text style={{ fontSize: 9 }}>
            Total Tax Collected: ${Number(totalTaxCollected).toFixed(2)}
          </Text>
          <Text style={{ fontSize: 9 }}>
            Total Payments: ${Number(totalPaymentsCollected).toFixed(2)}
          </Text>
          <Text style={{ fontSize: 9 }}>
            Total Outstanding: ${Number(totalOutstanding).toFixed(2)}
          </Text>
        </View>

        {/* Details section for each Estimate */}
        {details && details.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Estimate Details</Text>
            {details.map((detail) => (
              <View
                key={detail.salesReportDetailId}
                style={styles.detailSection}
              >
                {/* Display basic information for the estimate */}
                <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                  Estimate #{detail.estimateId} -{" "}
                  {new Date(detail.estimateDate).toLocaleDateString()}
                </Text>
                <Text style={{ fontSize: 9 }}>
                  Subtotal: ${Number(detail.subtotal).toFixed(2)} | Tax: $
                  {Number(detail.tax).toFixed(2)} | Total: $
                  {Number(detail.total).toFixed(2)}
                </Text>
                <Text style={{ fontSize: 9 }}>
                  Account: Initial Balance: $
                  {Number(detail.originalAmount).toFixed(2)} - Total Paid: $
                  {Number(detail.totalPayments).toFixed(2)} - Remaining Balance: $
                  {Number(detail.remainingBalance).toFixed(2)}
                </Text>
                <Text style={{ fontSize: 9 }}>
                  Customer: {detail.customerName} | Vehicle:{" "}
                  {detail.vehicleInfo}
                </Text>

                {/* Optional section: Full Estimate details */}
                {detail.Estimate && (
                  <View style={styles.subSection}>
                    <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                      Complete Estimate Details
                    </Text>
                    <Text style={{ fontSize: 9 }}>
                      Customer Note: {detail.Estimate.customerNote}
                    </Text>
                    <Text style={{ fontSize: 9 }}>
                      Status: {detail.Estimate.authorizationStatus}
                    </Text>
                    <Text style={{ fontSize: 9 }}>
                      Estimate Date:{" "}
                      {new Date(detail.Estimate.date).toLocaleDateString()}
                    </Text>

                    {/* Section for parts details if available */}
                    {detail.Estimate.parts &&
                      detail.Estimate.parts.length > 0 && (
                        <View style={styles.subSection}>
                          <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                            Parts:
                          </Text>
                          {detail.Estimate.parts.map((part) => (
                            <Text key={part.id} style={{ fontSize: 9 }}>
                              - {part.description} (Quantity: {part.quantity}) -
                              ${Number(part.extendedPrice).toFixed(2)}
                            </Text>
                          ))}
                        </View>
                      )}

                    {/* Section for labors details if available */}
                    {detail.Estimate.labors &&
                      detail.Estimate.labors.length > 0 && (
                        <View style={styles.subSection}>
                          <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                            Labor:
                          </Text>
                          {detail.Estimate.labors.map((labor) => (
                            <Text key={labor.id} style={{ fontSize: 9 }}>
                              - {labor.description} (Duration: {labor.duration}{" "}
                              hrs) - ${Number(labor.extendedPrice).toFixed(2)}
                            </Text>
                          ))}
                        </View>
                      )}

                    {/* Section for flat fee details if available */}
                    {detail.Estimate.flatFees &&
                      detail.Estimate.flatFees.length > 0 && (
                        <View style={styles.subSection}>
                          <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                            Flat Fees:
                          </Text>
                          {detail.Estimate.flatFees.map((fee) => (
                            <Text key={fee.id} style={{ fontSize: 9 }}>
                              - {fee.description} - $
                              {Number(fee.extendedPrice).toFixed(2)}
                            </Text>
                          ))}
                        </View>
                      )}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Footer section displaying the report generation date */}
        <View style={styles.footer}>
          <Text style={{ textAlign: "center" }}>
            Report generated on {formattedCreatedDate}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default SalesReportPDF;
