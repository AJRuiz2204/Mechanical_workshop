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

const formatLastUpdated = (dateString) => {
  if (!dateString) return "";
  return dayjs(dateString).subtract(6, "hour").format("YYYY-MM-DD HH:mm:ss");
};

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
  // --- Info Cliente/Vehículo ---
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
  // --- Tabla de Pagos ---
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
  // Anchos de columna para la tabla de pagos
  colId: { width: "10%" },
  colAmt: { width: "20%" },
  colPayDate: { width: "20%" },
  colMethod: { width: "20%" },
  colRef: { width: "30%", paddingRight: 2 },

  tableRowsContainer: {
    minHeight: 250, // Espacio para la lista de pagos
  },

  // --- Footer (Notas y Totales) ---
  footerSection: {
    flexDirection: "row",
    marginTop: 15,
    // CAMBIO: Se quitó el margen inferior extra
  },
  footerLeft: {
    // Para Notas
    width: "60%",
    paddingRight: 10,
  },
  footerRight: {
    // Para Totales
    width: "40%",
    paddingLeft: 10,
  },
  notesSection: {
    marginTop: 10,
    paddingTop: 5,
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
  paidInFull: {
    marginTop: 10,
    fontFamily: "Courier-Bold",
    fontSize: 10,
    textAlign: "right",
  },
});

/**
 * ClientPaymentPDF Component
 *
 * Muestra un estado de cuenta del cliente con el nuevo formato.
 */
const ClientPaymentPDF = ({ pdfData }) => {
  // --- 1. Lógica de Extracción de Datos de ClientPaymentPDF ---
  const workshopData = pdfData?.workshopData || {};
  const customer = pdfData?.customer || {};
  const vehicle = pdfData?.vehicle || {};
  const rawPayments = pdfData?.payments || [];
  const account = pdfData?.account || {};

  // Ordenar pagos (más reciente primero)
  const payments = [...rawPayments].sort((a, b) => {
    const dateA = new Date(a.paymentDate);
    const dateB = new Date(b.paymentDate);
    return dateB - dateA;
  });

  // Calcular totales
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const remainingBalance =
    account.balance ?? (payments[0]?.remainingBalance || 0);
  const initialBalance =
    account.originalAmount ?? (payments[0]?.initialBalance || 0);

  const quoteNumber = account.id || customer.id || payments[0]?.id || "N/A";

  // Recopilar notas
  const allNotes = [];
  payments.forEach((payment) => {
    if (payment.estimate?.technicianDiagnostic?.notes) {
      allNotes.push(...payment.estimate.technicianDiagnostic.notes);
    }
    if (payment.technicianDiagnostic?.notes) {
      allNotes.push(...payment.technicianDiagnostic.notes);
    }
  });
  const sortedNotes = allNotes
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  // --- 2. Renderizado del Documento PDF ---
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
            <Text style={styles.boldText}>
              Payment Statement # {quoteNumber}
            </Text>
            <Text>Generated: {dayjs().format("MMM DD, YYYY")}</Text>
            <Text>
              Last Updated: {formatLastUpdated(workshopData.lastUpdated)}
            </Text>
          </View>
        </View>

        {/* ===== INFO CLIENTE Y VEHÍCULO ===== */}
        <View style={styles.infoSection}>
          <View style={styles.infoBoxLeft}>
            <Text style={styles.boldText}>
              {customer.fullName || "N/A"} (Authorizer)
            </Text>
            <Text>{customer.address || ""}</Text>
            {customer.city && customer.state && (
              <Text>
                {customer.city}, {customer.state} {customer.zip || ""}
              </Text>
            )}
            <Text>M: {customer.primaryPhone || "N/A"}</Text>
            {customer.email && <Text>{customer.email}</Text>}
          </View>

          <View style={styles.infoBoxRight}>
            {vehicle &&
            (vehicle.year || vehicle.make || vehicle.model || vehicle.vin) ? (
              <>
                <Text style={styles.boldText}>
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </Text>
                <Text>VIN: {vehicle.vin || "N/A"}</Text>
                {vehicle.color && <Text>Color: {vehicle.color}</Text>}
                {vehicle.licensePlate && (
                  <Text>License: {vehicle.licensePlate}</Text>
                )}
              </>
            ) : (
              <Text style={styles.textLine}>
                No vehicle information available
              </Text>
            )}
          </View>
        </View>

        {/* ===== TABLA DE PAGOS (ENCABEZADO) ===== */}
        <View style={styles.tableHeader} fixed>
          <Text style={[styles.colId, styles.boldText]}>ID</Text>
          <Text style={[styles.colAmt, styles.boldText]}>Amount</Text>
          <Text style={[styles.colPayDate, styles.boldText]}>Date</Text>
          <Text style={[styles.colMethod, styles.boldText]}>Method</Text>
          <Text style={[styles.colRef, styles.boldText]}>Reference</Text>
        </View>

        {/* ===== TABLA DE PAGOS (CONTENIDO) ===== */}
        <View style={styles.tableRowsContainer}>
          {payments.length > 0 ? (
            payments.map((payment, index) => (
              <View
                key={payment.id || index}
                style={styles.tableRow}
                wrap={false}
              >
                <Text style={styles.colId}>{payment.id}</Text>
                <Text style={[styles.colAmt, styles.boldText]}>
                  {formatCurrency(payment.amount)}
                </Text>
                <Text style={styles.colPayDate}>
                  {dayjs(payment.paymentDate).format("MMM DD, YYYY")}
                </Text>
                <Text style={styles.colMethod}>{payment.method}</Text>
                <Text style={styles.colRef}>
                  {payment.transactionReference || "No reference"}
                </Text>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <Text
                style={{
                  textAlign: "center",
                  fontStyle: "italic",
                  width: "100%",
                }}
              >
                No payments recorded
              </Text>
            </View>
          )}
        </View>

        {/* ===== FOOTER (NOTAS Y TOTALES) ===== */}
        <View style={styles.footerSection}>
          {/* --- Columna Izquierda: Notas de Servicio --- */}
          <View style={styles.footerLeft}>
            {sortedNotes.length > 0 ? (
              <View style={styles.notesSection}>
                <Text style={styles.boldText}>Recent Service Notes</Text>
                {sortedNotes.map((note, index) => (
                  <View key={note.id || index} style={styles.noteItem}>
                    <Text style={{ fontSize: 8 }}>
                      {dayjs(note.createdAt).format("MMM DD, YYYY HH:mm")}
                    </Text>
                    <Text>{note.content}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.notesSection}>
                No service notes available.
              </Text>
            )}
          </View>

          {/* --- Columna Derecha: Resumen de Totales --- */}
          <View style={styles.footerRight}>
            <View style={styles.totalRow}>
              <Text>Initial Balance:</Text>
              <Text>{formatCurrency(initialBalance)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text>Total Payments:</Text>
              <Text>-{formatCurrency(totalPaid)}</Text>
            </View>

            <View style={styles.totalFinal}>
              <Text>Remaining Balance:</Text>
              <Text>{formatCurrency(remainingBalance)}</Text>
            </View>

            {Number(remainingBalance) === 0 && (
              <Text style={styles.paidInFull}>✓ ACCOUNT PAID IN FULL</Text>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};

// --- PropTypes de ClientPaymentPDF ---
ClientPaymentPDF.propTypes = {
  pdfData: PropTypes.shape({
    workshopData: PropTypes.shape({
      workshopName: PropTypes.string,
      address: PropTypes.string,
      primaryPhone: PropTypes.string,
      secondaryPhone: PropTypes.string,
      fax: PropTypes.string,
      websiteUrl: PropTypes.string,
      email: PropTypes.string,
      lastUpdated: PropTypes.string,
    }),
    customer: PropTypes.shape({
      fullName: PropTypes.string,
      email: PropTypes.string,
      primaryPhone: PropTypes.string,
      address: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      zip: PropTypes.string,
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    vehicle: PropTypes.shape({
      year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      make: PropTypes.string,
      model: PropTypes.string,
      color: PropTypes.string,
      licensePlate: PropTypes.string,
      vin: PropTypes.string,
    }),
    account: PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      originalAmount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      balance: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      status: PropTypes.string,
      createdDate: PropTypes.string,
    }),
    payments: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        paymentDate: PropTypes.string,
        method: PropTypes.string,
        transactionReference: PropTypes.string,
        remainingBalance: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),
        initialBalance: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),
      })
    ),
  }),
};

export default ClientPaymentPDF;
