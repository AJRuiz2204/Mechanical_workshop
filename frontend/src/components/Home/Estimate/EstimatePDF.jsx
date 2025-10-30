import PropTypes from "prop-types";
import dayjs from "dayjs";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import logo from "../../../images/logo.png"; // Asegúrate que la ruta sea correcta

const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "Courier", // Usamos Courier para el look 'font-mono'
    fontSize: 9,
    backgroundColor: "#ffffff",
    color: "#000000",
  },

  // --- Encabezado (Simula row 2-8) ---
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 5,
    borderBottom: "2px solid #eeeeee",
    backgroundColor: "#f9f9f9",
    minHeight: 60, // Altura para el logo
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

  // --- Info Cliente/Vehículo (Simula row 9-15) ---
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
    position: "absolute", // 'float-right' no existe, usamos posición
    right: 5,
    top: 28,
  },

  // --- Tabla de Items ---
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
  // Anchos de columna para la tabla
  colItem: { width: "10%" },
  colDesc: { width: "35%" },
  colPart: { width: "15%" },
  colQty: { width: "10%", textAlign: "center" },
  colPrice: { width: "15%", textAlign: "right" },
  colExt: { width: "15%", textAlign: "right", paddingRight: 2 },

  // Contenedor para las filas (para que el fondo no se rompa)
  tableRowsContainer: {
    minHeight: 250, // Simula row-[16_/_45]
  },

  // --- Footer (Disclaimer y Totales) ---
  footerSection: {
    flexDirection: "row",
    marginTop: 15,
  },
  footerLeft: {
    width: "60%",
  },
  footerRight: {
    width: "40%",
    paddingLeft: 10,
  },
  disclaimer: {
    paddingTop: 5,
    borderTop: "1px solid #eeeeee",
    marginTop: 10,
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

  // --- Firma ---
  signatureSection: {
    flexDirection: "row",
    marginTop: "auto", // Empuja esto al fondo de la página
    paddingTop: 20,
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
    bottom: -10, // Posiciona debajo
    left: 40,
    width: 150,
  },
});

const EstimatePDF = ({ pdfData }) => {
  // 1. Extraemos los datos de forma segura (igual que en tu código)
  const safeWorkshopData = pdfData?.workshopData || {};
  const safeCustomer = pdfData?.customer || {};
  const safeVehicle = pdfData?.vehicle || {};
  const safeItems = pdfData?.items || [];
  const totals = pdfData?.totals || {};
  const customerNote = pdfData?.customerNote || "";
  const mileage = pdfData?.mileage || 0;
  const estimateId = pdfData?.estimateId || pdfData?.estimate?.id;
  const isInvoice = pdfData?.isInvoice || false;

  // 2. Formateamos los números (una función de ayuda)
  const formatCurrency = (num) => {
    return parseFloat(num || 0).toFixed(2);
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* ===== SECCIÓN DE ENCABEZADO ===== */}
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
            <Text style={styles.boldText}>
              {isInvoice ? "Invoice" : "Quote"} #: {estimateId || "N/A"}
            </Text>
            <Text>Date: {dayjs().format("MM/DD/YY hh:mm A")}</Text>
            <Text>Page 1 of 1</Text>
          </View>
        </View>

        {/* ===== INFO CLIENTE Y VEHÍCULO ===== */}
        <View style={styles.infoSection}>
          <View style={styles.infoBoxLeft}>
            <Text style={styles.boldText}>
              {safeCustomer.name} {safeCustomer.lastName} (Authorizer)
            </Text>
            <Text>{safeCustomer.address || ""}</Text>
            {safeCustomer.city && (
              <Text>
                {safeCustomer.city}, {safeCustomer.state}{" "}
                {safeCustomer.zip || ""}
              </Text>
            )}
            <Text>M: {safeCustomer.primaryNumber || "N/A"}</Text>
            {safeCustomer.email && <Text>{safeCustomer.email}</Text>}
          </View>

          <View style={styles.infoBoxRight}>
            <Text style={styles.boldText}>
              {safeVehicle.year} {safeVehicle.make} {safeVehicle.model}
            </Text>
            <Text>Engine: {safeVehicle.engine || "N/A"}</Text>
            <Text>VIN: {safeVehicle.vin || "N/A"}</Text>
            <Text style={styles.mileage}>
              Mileage: In {mileage.toLocaleString()} | Out 0
            </Text>
          </View>
        </View>

        {/* ===== TABLA DE ITEMS (ENCABEZADO) ===== */}
        <View style={styles.tableHeader} fixed>
          <Text style={styles.colItem}>ITEM</Text>
          <Text style={styles.colDesc}>DESCRIPTION</Text>
          <Text style={styles.colPart}>PART#</Text>
          <Text style={styles.colQty}>QTY/HRS</Text>
          <Text style={styles.colPrice}>PRICE</Text>
          <Text style={styles.colExt}>EXTENDED</Text>
        </View>

        {/* ===== TABLA DE ITEMS (CONTENIDO) ===== */}
        <View style={styles.tableRowsContainer}>
          {safeItems.map((item, i) => (
            <View key={i} style={styles.tableRow} wrap={false}>
              <Text style={styles.colItem}>{item.type || "N/A"}</Text>
              <Text style={styles.colDesc}>{item.description || ""}</Text>
              <Text style={styles.colPart}>
                {item.type === "Part" ? item.partNumber || "N/A" : "-"}
              </Text>
              <Text style={styles.colQty}>
                {item.type === "Labor" ? "-" : formatCurrency(item.quantity)}
              </Text>
              <Text style={styles.colPrice}>
                ${formatCurrency(item.listPrice)}
              </Text>
              <Text style={styles.colExt}>
                ${formatCurrency(item.extendedPrice)}
              </Text>
            </View>
          ))}
        </View>

        {/* ===== DISCLAIMER SECTION ===== */}
        <View style={{ marginTop: 15, marginBottom: 10, padding: 8, backgroundColor: "#f8f9fa", border: "1px solid #dee2e6" }}>
          <Text style={[styles.boldText, { fontSize: 8, textAlign: "center", marginBottom: 5 }]}>
            ESTIMATES ARE VALID FOR 14 DAYS.
          </Text>
          <Text style={{ fontSize: 7, textAlign: "justify", lineHeight: 1.2 }}>
            Warranty Disclaimer: All parts and labor provided under this invoice are warranted for twelve (12) months, from the date of service. This warranty covers defects in materials or workmanship under normal use and service. It does not cover damage caused by misuse, neglect, accidents, alterations, or repairs performed by any party Other than the original service provider.
          </Text>
        </View>

        {/* ===== FOOTER (DISCLAIMER Y TOTALES) ===== */}
        <View style={styles.footerSection}>
          <View style={styles.footerLeft}>
            <Text style={styles.boldText}>
              Description of labor or services:
            </Text>
            <Text>{customerNote || "N/A"}</Text>
            <View style={styles.disclaimer}>
              <Text>
                {safeWorkshopData.disclaimer || "Warranty Disclaimer..."}
              </Text>
            </View>
          </View>

          <View style={styles.footerRight}>
            <View style={styles.totalRow}>
              <Text>Parts Total:</Text>
              <Text>${formatCurrency(totals.partsTotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Labor Total:</Text>
              <Text>${formatCurrency(totals.laborTotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Others Total:</Text>
              <Text>${formatCurrency(totals.othersTotal)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Parts Tax:</Text>
              <Text>${formatCurrency(totals.partsTax)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Labor Tax:</Text>
              <Text>${formatCurrency(totals.laborTax)}</Text>
            </View>

            <View style={styles.totalFinal}>
              <Text>Total:</Text>
              <Text>${formatCurrency(totals.total)}</Text>
            </View>
          </View>
        </View>

        {/* ===== FIRMA ===== */}
        <View style={styles.signatureSection} fixed>
          <Text style={styles.signatureX}>X</Text>
          <View style={styles.signatureLine}></View>
          <Text style={styles.signatureDate}>
            Date {dayjs().format("MM/DD/YYYY")}
          </Text>
          <Text style={styles.signatureLabel}>Customer Signature</Text>
        </View>
      </Page>
    </Document>
  );
};

// ... tus PropTypes se mantienen exactamente igual ...
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
      name: PropTypes.string,
      lastName: PropTypes.string,
      email: PropTypes.string,
      primaryNumber: PropTypes.string,
      secondaryPhone: PropTypes.string,
      address: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      zip: PropTypes.string,
    }),
    vehicle: PropTypes.shape({
      year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      make: PropTypes.string,
      model: PropTypes.string,
      engine: PropTypes.string,
      color: PropTypes.string,
      licensePlate: PropTypes.string,
      vin: PropTypes.string,
    }),
    items: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string,
        description: PropTypes.string,
        partNumber: PropTypes.string,
        quantity: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        listPrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        extendedPrice: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),
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
