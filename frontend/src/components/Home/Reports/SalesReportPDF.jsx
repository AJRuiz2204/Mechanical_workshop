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

/**
 * Define the styles for the Sales Report PDF document.
 * This includes styles for the page layout, header, tables, footer, and other sections.
 */
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
    alignItems: "flex-start",
    marginBottom: 5,
  },
  logoSection: {
    width: 100,
    height: 100,
    marginRight: 10,
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

/**
 * Formats the "Last Updated" date string.
 *
 * If the provided date string is empty, returns an empty string.
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
 * SalesReportPDF component.
 *
 * Generates a PDF document for a sales report using the provided pdfData.
 * Expected pdfData includes:
 * - startDate, endDate, totalEstimates, totalPartsRevenue, totalLaborRevenue,
 *   totalFlatFeeRevenue, totalTaxCollected, totalPaymentsCollected, totalOutstanding,
 *   createdDate, details, and workshopData.
 *
 * The component builds a unified header with workshop information,
 * displays overall totals and detailed estimate information, and adds a footer.
 *
 * @param {Object} props - Component props.
 * @param {Object} props.pdfData - The sales report data.
 * @returns {JSX.Element} The generated PDF document.
 */
const SalesReportPDF = ({ pdfData }) => {
  // Destructure sales report summary data from pdfData
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
    salesReportId,
  } = pdfData;

  // Format the dates for display
  const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
  const formattedEndDate = dayjs(endDate).format("YYYY-MM-DD");
  const formattedCreatedDate = dayjs(createdDate).format("YYYY-MM-DD HH:mm:ss");

  // Extract workshop information from pdfData (default to empty object if not provided)
  const workshopData = pdfData?.workshopData || {};

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Unified Header */}
        <View style={styles.headerContainer}>
          <View style={styles.logoSection}>
            {/* Render the logo image */}
            <Image src={logo} style={{ width: "100%", height: "100%" }} />
          </View>
          <View style={styles.headerInfoContainer}>
            {/* Workshop Information Section */}
            <View style={styles.workshopInfo}>
              <Text style={styles.textLine}>
                {workshopData.workshopName || "Nombre del Taller"}
              </Text>
              <Text style={styles.textLine}>
                {workshopData.address || "Dirección del Taller"}
              </Text>
              <Text style={styles.textLine}>
                {workshopData.primaryPhone || "Teléfono Principal"}
              </Text>
              {workshopData.secondaryPhone && (
                <Text style={styles.textLine}>
                  {workshopData.secondaryPhone}
                </Text>
              )}
              <Text style={styles.textLine}>Fax: {workshopData.fax || ""}</Text>
              <Text style={styles.textLine}>{workshopData.email || ""}</Text>
              {workshopData.websiteUrl && (
                <Link src={workshopData.websiteUrl} style={styles.link}>
                  {workshopData.websiteUrl}
                </Link>
              )}
            </View>
            {/* Quote Information Section */}
            <View style={styles.quoteInfo}>
              <Text style={styles.textLine}>{salesReportId || "N/A"}
              </Text>
              <Text style={styles.textLine}>
                Last Updated: {formatLastUpdated(workshopData.lastUpdated)}
              </Text>
            </View>
          </View>
        </View>

        {/* Divider */}
        <View
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#e0e0e0",
            marginBottom: 5,
          }}
        />

        {/* Title and Period */}
        <Text style={styles.sectionTitle}>Sales Report</Text>
        <Text style={{ fontSize: 9 }}>
          Period: {formattedStartDate} - {formattedEndDate}
        </Text>

        {/* General Totals Section */}
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

        {/* Details Section */}
        {details && details.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Estimate Details</Text>
            {details.map((detail) => (
              <View
                key={detail.salesReportDetailId}
                style={styles.detailSection}
              >
                {/* Basic Estimate Information */}
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
                  {Number(detail.totalPayments).toFixed(2)} - Remaining Balance:
                  ${Number(detail.remainingBalance).toFixed(2)}
                </Text>
                <Text style={{ fontSize: 9 }}>
                  Customer: {detail.customerName} | Vehicle:{" "}
                  {detail.vehicleInfo}
                </Text>

                {/* Optional Complete Estimate Details */}
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
                    {/* Parts Details */}
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
                    {/* Labor Details */}
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
                    {/* Flat Fees Details */}
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

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={{ textAlign: "center" }}>
            Report generated on {formattedCreatedDate}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

// PropTypes validation
SalesReportPDF.propTypes = {
  pdfData: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    totalEstimates: PropTypes.number,
    totalPartsRevenue: PropTypes.number,
    totalLaborRevenue: PropTypes.number,
    totalFlatFeeRevenue: PropTypes.number,
    totalTaxCollected: PropTypes.number,
    totalPaymentsCollected: PropTypes.number,
    totalOutstanding: PropTypes.number,
    createdDate: PropTypes.string,
    salesReportId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    details: PropTypes.arrayOf(
      PropTypes.shape({
        estimateId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        estimateDate: PropTypes.string,
        customer: PropTypes.string,
        vehicle: PropTypes.string,
        estimateTotal: PropTypes.number,
        paymentsCollected: PropTypes.number,
        outstanding: PropTypes.number,
      })
    ),
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
  }).isRequired,
};

export default SalesReportPDF;
