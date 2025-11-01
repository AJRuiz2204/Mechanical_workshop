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
import logo from "../../../images/logo.png"; // Asegúrate que la ruta sea correcta

// --- Funciones Helper ---
const formatCurrency = (amount) =>
  isNaN(Number(amount)) ? "$0.00" : `$${Number(amount).toFixed(2)}`;


// --- Estilos para @react-pdf/renderer (Formato "J BENZ") ---
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Courier",
    fontSize: 9,
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  // --- Encabezado ---
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
  link: {
    textDecoration: "underline",
    color: "blue",
  },
  // --- Sección de Resumen del Reporte ---
  summarySection: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 10,
    borderBottom: "2px solid #000000",
    paddingBottom: 10,
  },
  summaryBox: {
    width: "50%",
    padding: 5,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  // --- Sección de Detalles ---
  detailsContainer: {
    paddingTop: 10,
  },
  estimateDetailBlock: {
    borderBottom: "1px solid #cccccc",
    paddingVertical: 10,
    // Evita que un bloque se parta entre páginas si es posible
    breakInside: "avoid",
  },
  estimateHeader: {
    fontFamily: "Courier-Bold",
    fontSize: 10,
    marginBottom: 5,
  },
  estimateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  estimateSubSection: {
    marginLeft: 10,
    marginTop: 5,
  },
  subSectionTitle: {
    fontFamily: "Courier-Bold",
    marginTop: 3,
  },
  itemRow: {
    marginLeft: 5,
  },
  // --- Footer ---
  footer: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    fontSize: 8,
    textAlign: "center",
  },
});

/**
 * SalesReportPDF component.
 *
 * Genera un PDF de Reporte de Ventas con el nuevo estilo J BENZ.
 */
const SalesReportPDF = ({ pdfData }) => {
  // --- 1. Extracción de Datos ---
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

  const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
  const formattedEndDate = dayjs(endDate).format("YYYY-MM-DD");
  const formattedCreatedDate = dayjs(createdDate).format("YYYY-MM-DD HH:mm:ss");

  const workshopData = pdfData?.workshopData || {};

  // --- 2. Renderizado del PDF ---
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ===== SECCIÓN DE ENCABEZADO ===== */}
        <View style={styles.header} fixed>
          <View style={styles.headerInfoLeft}>
            <Text style={styles.boldText}>{workshopData.workshopName}</Text>
            <Text>{workshopData.address || ""}</Text>
            <Text>Ph: {workshopData.primaryPhone || ""}</Text>
            {workshopData.secondaryPhone && (
              <Text>Ph2: {workshopData.secondaryPhone}</Text>
            )}
            {workshopData.email && <Text>{workshopData.email}</Text>}
            {workshopData.websiteUrl && (
              <Link src={workshopData.websiteUrl} style={styles.link}>
                {workshopData.websiteUrl}
              </Link>
            )}
          </View>

          <View style={styles.headerLogo}>
            <Image src={logo} style={styles.logoImage} />
          </View>

          <View style={styles.headerInfoRight}>
            <Text style={styles.boldText}>Sales Report</Text>
            <Text>ID: {salesReportId || "N/A"}</Text>
            <Text>Generated: {formattedCreatedDate}</Text>
          </View>
        </View>

        {/* ===== SECCIÓN DE RESUMEN DEL REPORTE ===== */}
        <View style={styles.summarySection}>
          <View style={styles.summaryBox}>
            <Text style={styles.boldText}>Period:</Text>
            <Text>
              {formattedStartDate} to {formattedEndDate}
            </Text>
            <View style={{ marginTop: 10 }}>
              <View style={styles.summaryRow}>
                <Text>Total Estimates:</Text>
                <Text>{formatCurrency(totalEstimates)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Parts Revenue:</Text>
                <Text>{formatCurrency(totalPartsRevenue)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Labor Revenue:</Text>
                <Text>{formatCurrency(totalLaborRevenue)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Flat Fee Revenue:</Text>
                <Text>{formatCurrency(totalFlatFeeRevenue)}</Text>
              </View>
            </View>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.boldText}>Financial Summary:</Text>
            <View style={{ marginTop: 10 }}>
              <View style={styles.summaryRow}>
                <Text>Tax Collected:</Text>
                <Text>{formatCurrency(totalTaxCollected)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Payments Collected:</Text>
                <Text>{formatCurrency(totalPaymentsCollected)}</Text>
              </View>
              <View
                style={[
                  styles.summaryRow,
                  styles.boldText,
                  { marginTop: 5, paddingTop: 5, borderTop: "1px solid #eee" },
                ]}
              >
                <Text>Total Outstanding:</Text>
                <Text>{formatCurrency(totalOutstanding)}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* ===== SECCIÓN DE DETALLES DEL REPORTE ===== */}
        <View style={styles.detailsContainer}>
          <Text style={[styles.boldText, { fontSize: 12, marginBottom: 5 }]}>
            Estimate Details
          </Text>

          {details && details.length > 0 ? (
            details.map((detail) => (
              <View
                key={detail.salesReportDetailId}
                style={styles.estimateDetailBlock}
              >
                {/* Info Principal del Estimado */}
                <Text style={styles.estimateHeader}>
                  Estimate #{detail.estimateId} -{" "}
                  {dayjs(detail.estimateDate).format("YYYY-MM-DD")}
                </Text>
                <View style={styles.estimateRow}>
                  <Text>Customer: {detail.customerName}</Text>
                  <Text>Vehicle: {detail.vehicleInfo}</Text>
                </View>
                <View style={styles.estimateRow}>
                  <Text>Subtotal: {formatCurrency(detail.subtotal)}</Text>
                  <Text>Tax: {formatCurrency(detail.tax)}</Text>
                  <Text style={styles.boldText}>
                    Total: {formatCurrency(detail.total)}
                  </Text>
                </View>
                <View style={styles.estimateRow}>
                  <Text>Initial: {formatCurrency(detail.originalAmount)}</Text>
                  <Text>Paid: {formatCurrency(detail.totalPayments)}</Text>
                  <Text style={styles.boldText}>
                    Balance: {formatCurrency(detail.remainingBalance)}
                  </Text>
                </View>

                {/* Detalles de Items (Parts, Labors, etc.) */}
                {detail.Estimate && (
                  <View style={styles.estimateSubSection}>
                    {/* Parts */}
                    {detail.Estimate.parts &&
                      detail.Estimate.parts.length > 0 && (
                        <View>
                          <Text style={styles.subSectionTitle}>PARTS:</Text>
                          {detail.Estimate.parts.map((part) => (
                            <Text key={part.id} style={styles.itemRow}>
                              - {part.description} (Qty: {part.quantity}) -{" "}
                              {formatCurrency(part.extendedPrice)}
                            </Text>
                          ))}
                        </View>
                      )}
                    {/* Labors */}
                    {detail.Estimate.labors &&
                      detail.Estimate.labors.length > 0 && (
                        <View>
                          <Text style={styles.subSectionTitle}>LABOR:</Text>
                          {detail.Estimate.labors.map((labor) => (
                            <Text key={labor.id} style={styles.itemRow}>
                              - {labor.description} (Hrs: {labor.duration}) -{" "}
                              {formatCurrency(labor.extendedPrice)}
                            </Text>
                          ))}
                        </View>
                      )}
                    {/* Flat Fees */}
                    {detail.Estimate.flatFees &&
                      detail.Estimate.flatFees.length > 0 && (
                        <View>
                          <Text style={styles.subSectionTitle}>FLAT FEES:</Text>
                          {detail.Estimate.flatFees.map((fee) => (
                            <Text key={fee.id} style={styles.itemRow}>
                              - {fee.description} -{" "}
                              {formatCurrency(fee.extendedPrice)}
                            </Text>
                          ))}
                        </View>
                      )}
                  </View>
                )}
              </View>
            ))
          ) : (
            <Text>No details available for this period.</Text>
          )}
        </View>

        {/* ===== FOOTER ===== */}
        <View style={styles.footer} fixed>
          <Text>Page 1 of 1</Text>
        </View>
      </Page>
    </Document>
  );
};

// --- PropTypes ---
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
        salesReportDetailId: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),
        estimateId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        estimateDate: PropTypes.string,
        customerName: PropTypes.string, // Tu proptype decía 'customer'
        vehicleInfo: PropTypes.string, // Tu proptype decía 'vehicle'
        subtotal: PropTypes.number, // No estaba en los proptypes
        tax: PropTypes.number, // No estaba en los proptypes
        total: PropTypes.number, // Tu proptype decía 'estimateTotal'
        totalPayments: PropTypes.number, // Tu proptype decía 'paymentsCollected'
        remainingBalance: PropTypes.number, // Tu proptype decía 'outstanding'
        originalAmount: PropTypes.number, // No estaba en los proptypes
        Estimate: PropTypes.object, // Para los detalles anidados
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
