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

const SalesReportPDF = ({ pdfData }) => {
  // pdfData se espera que tenga el siguiente formato (SalesReportDto):
  // {
  //   startDate, endDate, totalEstimates, totalPartsRevenue, totalLaborRevenue,
  //   totalFlatFeeRevenue, totalTaxCollected, totalPaymentsCollected, totalOutstanding,
  //   createdDate, details: [ { salesReportDetailId, estimateId, estimateDate, subtotal, tax, total, originalAmount, totalPayments, remainingBalance, customerName, vehicleInfo, Estimate: { ...EstimateFullDto } }, ... ]
  // }
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
  const formattedStartDate = dayjs(startDate).format("YYYY-MM-DD");
  const formattedEndDate = dayjs(endDate).format("YYYY-MM-DD");
  const formattedCreatedDate = dayjs(createdDate).format("YYYY-MM-DD HH:mm:ss");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        <View style={styles.headerContainer}>
          <View style={styles.logoSection}>
            <Image src={logo} style={{ width: "100%", height: "100%" }} />
          </View>
          <View style={styles.headerInfoContainer}>
            <Text style={styles.textLine}>Mi Taller Mecánico</Text>
            <Text style={styles.textLine}>Calle Falsa 123</Text>
            <Text style={styles.textLine}>(100) 000-0000</Text>
            <Text style={styles.textLine}>contacto@mitaller.com</Text>
            <Text style={styles.textLine}>
              Reporte generado: {formattedCreatedDate}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Reporte de Ventas</Text>
        <Text style={{ fontSize: 9 }}>
          Periodo: {formattedStartDate} - {formattedEndDate}
        </Text>

        {/* Totales Generales */}
        <View style={{ marginVertical: 10 }}>
          <Text style={{ fontSize: 9 }}>
            Total Estimados: ${Number(totalEstimates).toFixed(2)}
          </Text>
          <Text style={{ fontSize: 9 }}>
            Total Ingresos Partes: ${Number(totalPartsRevenue).toFixed(2)}
          </Text>
          <Text style={{ fontSize: 9 }}>
            Total Ingresos Labor: ${Number(totalLaborRevenue).toFixed(2)}
          </Text>
          <Text style={{ fontSize: 9 }}>
            Total Ingresos Flat Fee: ${Number(totalFlatFeeRevenue).toFixed(2)}
          </Text>
          <Text style={{ fontSize: 9 }}>
            Total Impuestos: ${Number(totalTaxCollected).toFixed(2)}
          </Text>
          <Text style={{ fontSize: 9 }}>
            Total Pagado: ${Number(totalPaymentsCollected).toFixed(2)}
          </Text>
          <Text style={{ fontSize: 9 }}>
            Total Pendiente: ${Number(totalOutstanding).toFixed(2)}
          </Text>
        </View>

        {/* Detalle por cada Estimate */}
        {details && details.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Detalles por Estimate</Text>
            {details.map((detail) => (
              <View
                key={detail.salesReportDetailId}
                style={styles.detailSection}
              >
                <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                  Estimado #{detail.estimateId} -{" "}
                  {new Date(detail.estimateDate).toLocaleDateString()}
                </Text>
                <Text style={{ fontSize: 9 }}>
                  Subtotal: ${Number(detail.subtotal).toFixed(2)} | Impuestos: $
                  {Number(detail.tax).toFixed(2)} | Total: $
                  {Number(detail.total).toFixed(2)}
                </Text>
                <Text style={{ fontSize: 9 }}>
                  Cuenta: Saldo Inicial: $
                  {Number(detail.originalAmount).toFixed(2)} - Total Pagado: $
                  {Number(detail.totalPayments).toFixed(2)} - Saldo Pendiente: $
                  {Number(detail.remainingBalance).toFixed(2)}
                </Text>
                <Text style={{ fontSize: 9 }}>
                  Cliente: {detail.customerName} | Vehículo:{" "}
                  {detail.vehicleInfo}
                </Text>

                {/* Sección opcional: Información completa del Estimate */}
                {detail.Estimate && (
                  <View style={styles.subSection}>
                    <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                      Detalles Completos del Estimate
                    </Text>
                    <Text style={{ fontSize: 9 }}>
                      Nota del Cliente: {detail.Estimate.customerNote}
                    </Text>
                    <Text style={{ fontSize: 9 }}>
                      Estado: {detail.Estimate.authorizationStatus}
                    </Text>
                    <Text style={{ fontSize: 9 }}>
                      Fecha del Estimate:{" "}
                      {new Date(detail.Estimate.date).toLocaleDateString()}
                    </Text>

                    {/* Si se requieren secciones adicionales para Partes, Labors y FlatFees */}
                    {detail.Estimate.parts &&
                      detail.Estimate.parts.length > 0 && (
                        <View style={styles.subSection}>
                          <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                            Partes:
                          </Text>
                          {detail.Estimate.parts.map((part) => (
                            <Text key={part.id} style={{ fontSize: 9 }}>
                              - {part.description} (Cantidad: {part.quantity}) -
                              ${Number(part.extendedPrice).toFixed(2)}
                            </Text>
                          ))}
                        </View>
                      )}

                    {detail.Estimate.labors &&
                      detail.Estimate.labors.length > 0 && (
                        <View style={styles.subSection}>
                          <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                            Mano de Obra:
                          </Text>
                          {detail.Estimate.labors.map((labor) => (
                            <Text key={labor.id} style={{ fontSize: 9 }}>
                              - {labor.description} (Duración: {labor.duration}{" "}
                              hs) - ${Number(labor.extendedPrice).toFixed(2)}
                            </Text>
                          ))}
                        </View>
                      )}

                    {detail.Estimate.flatFees &&
                      detail.Estimate.flatFees.length > 0 && (
                        <View style={styles.subSection}>
                          <Text style={{ fontSize: 9, fontWeight: "bold" }}>
                            Tarifas Planas:
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

        <View style={styles.footer}>
          <Text style={{ textAlign: "center" }}>
            Reporte generado el {formattedCreatedDate}
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default SalesReportPDF;
