/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
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
import { getWorkshopSettings } from "../../../services/workshopSettingsService";

const formatDate = (date) => dayjs(date).format("MMM-DD-YYYY");
const formatCurrency = (amount) => `$ ${Number(amount).toFixed(2)}`;

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  header: {
    flexDirection: "row",
    marginBottom: 20,
  },
  logoSection: {
    width: 150,
  },
  companyInfo: {
    flex: 1,
    textAlign: "right",
  },
  companyText: {
    fontSize: 10,
    marginBottom: 3,
  },
  billSection: {
    flexDirection: "row",
    marginBottom: 20,
  },
  billTo: {
    flex: 1,
  },
  vehicleInfo: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 10,
    marginBottom: 5,
    fontWeight: "bold",
  },
  infoText: {
    fontSize: 10,
    marginBottom: 2,
  },
  invoiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 3,
  },
  col1: { width: "10%" },
  col2: { width: "40%" },
  col3: { width: "25%" },
  col4: { width: "25%" },
  totalsSection: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  totalLabel: {
    width: 80,
  },
  totalAmount: {
    width: 80,
    textAlign: "right",
  },
  grandTotal: {
    marginTop: 5,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: "#000000",
  },
  grandTotalText: {
    fontWeight: "bold",
  },
  signatureSection: {
    marginTop: 30,
  },
  disclaimer: {
    fontSize: 8,
    marginTop: 20,
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
});

const PaymentPDF = ({ pdfData }) => {
  // Si pdfData es un arreglo, se asume que es un array de PaymentResponseDto
  // Si viene un objeto wrapper con workshopData, customer y payments, se usará esa estructura
  let wrapper = {};
  if (Array.isArray(pdfData)) {
    // Si solo tenemos un array, lo envolvemos en un objeto para estandarizar el formato
    wrapper = { payments: pdfData };
  } else {
    wrapper = pdfData;
  }

  // Extraer datos del wrapper:
  // Si existe workshopData, lo usamos para el encabezado
  const workshopData = wrapper.workshopData || null;
  // Si existe customer en el wrapper, lo usamos; de lo contrario, usamos el de la primer payment
  const customer =
    wrapper.customer ||
    (wrapper.payments && wrapper.payments[0]?.customer) ||
    {};
  // Extraemos la data del primer pago para la información común (suponiendo que todos los pagos del grupo son del mismo cliente)
  const payment = wrapper.payments ? wrapper.payments[0] : wrapper;
  const vehicle =
    payment.vehicle || (payment.estimate && payment.estimate.vehicle) || {};
  const estimate = payment.estimate || {};
  const initialBalance = payment.initialBalance || 0;
  const remainingBalance = payment.remainingBalance || 0;
  const paymentDate = payment.paymentDate || new Date();

  // Si no se envía workshopData, cargamos la configuración del taller
  const [fetchedWorkshopSettings, setFetchedWorkshopSettings] = useState(null);
  useEffect(() => {
    if (!workshopData) {
      const fetchSettings = async () => {
        try {
          const settings = await getWorkshopSettings();
          setFetchedWorkshopSettings(settings);
        } catch (error) {
          console.error("Error fetching workshop settings:", error);
        }
      };
      fetchSettings();
    }
  }, [workshopData]);

  const usedWorkshopData = workshopData || fetchedWorkshopSettings;

  // Construir la información del vehículo (se prefiere la del estimate si existe)
  const finalVehicle = estimate.vehicle || vehicle;
  const vehicleInfo = finalVehicle
    ? `${finalVehicle.make || "N/A"} ${finalVehicle.model || "N/A"} ${
        finalVehicle.year ? `(${finalVehicle.year})` : ""
      } - VIN: ${finalVehicle.vin || "N/A"}${
        finalVehicle.engine ? " - Engine: " + finalVehicle.engine : ""
      }`
    : "No vehicle information available";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Encabezado */}
        {usedWorkshopData ? (
          <View style={styles.header}>
            <View style={styles.logoSection}>
              <Image src={logo} />
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyText}>
                {usedWorkshopData.workshopName || "Workshop Name"}
              </Text>
              <Text style={styles.companyText}>
                {usedWorkshopData.address || "Workshop Address"}
              </Text>
              <Text style={styles.companyText}>
                {usedWorkshopData.primaryPhone}
                {usedWorkshopData.secondaryPhone
                  ? `, ${usedWorkshopData.secondaryPhone}`
                  : ""}
                {usedWorkshopData.fax ? ` Fax ${usedWorkshopData.fax}` : ""}
              </Text>
              <Text style={styles.companyText}>
                {usedWorkshopData.email || ""}
              </Text>
              <Text style={styles.companyText}>
                {usedWorkshopData.websiteUrl || ""}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.header}>
            <View style={styles.logoSection}>
              <Image src={logo} />
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyText}>Default Workshop Name</Text>
              <Text style={styles.companyText}>Default Address</Text>
            </View>
          </View>
        )}

        {/* Sección de Cliente y Vehículo */}
        <View style={styles.billSection}>
          <View style={styles.billTo}>
            <Text style={styles.sectionTitle}>Bill To:</Text>
            <Text style={styles.infoText}>{customer.fullName || "N/A"}</Text>
            <Text style={styles.infoText}>
              {customer.primaryPhone || "N/A"}
            </Text>
          </View>
          <View style={styles.vehicleInfo}>
            <Text style={styles.sectionTitle}>Vehicle Information:</Text>
            <Text style={styles.infoText}>{vehicleInfo}</Text>
          </View>
        </View>

        {/* Encabezado de la Factura */}
        <View style={styles.invoiceHeader}>
          <Text>Invoice #{estimate.id || "N/A"}</Text>
          <Text>Date: {formatDate(paymentDate)}</Text>
        </View>

        {/* Tabla de Partes */}
        {estimate.parts && estimate.parts.length > 0 && (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>QTY</Text>
              <Text style={styles.col2}>DESCRIPTION</Text>
              <Text style={styles.col3}>UNIT PRICE</Text>
              <Text style={styles.col4}>TOTAL</Text>
            </View>
            {estimate.parts.map((part, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>{part.quantity}</Text>
                <Text style={styles.col2}>{part.description}</Text>
                <Text style={styles.col3}>{formatCurrency(part.netPrice)}</Text>
                <Text style={styles.col4}>
                  {formatCurrency(part.extendedPrice)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Tabla de Labors (si existen) */}
        {estimate.labors && estimate.labors.length > 0 && (
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>HRS</Text>
              <Text style={styles.col2}>LABOR DESCRIPTION</Text>
              <Text style={styles.col3}>RATE</Text>
              <Text style={styles.col4}>TOTAL</Text>
            </View>
            {estimate.labors.map((labor, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.col1}>{labor.duration}</Text>
                <Text style={styles.col2}>{labor.description}</Text>
                <Text style={styles.col3}>
                  {formatCurrency(labor.laborRate)}
                </Text>
                <Text style={styles.col4}>
                  {formatCurrency(labor.extendedPrice)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Sección de Totales */}
        <View style={styles.totalsSection}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(estimate.subtotal)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax:</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(estimate.tax)}
            </Text>
          </View>
          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={[styles.totalLabel, styles.grandTotalText]}>
              Total:
            </Text>
            <Text style={[styles.totalAmount, styles.grandTotalText]}>
              {formatCurrency(estimate.total)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Deposit:</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(initialBalance - remainingBalance)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Balance:</Text>
            <Text style={styles.totalAmount}>
              {formatCurrency(remainingBalance)}
            </Text>
          </View>
        </View>

        {/* Sección de Firma */}
        <View style={styles.signatureSection}>
          <Text>Signature:</Text>
          <Text style={{ marginTop: 20 }}>
            X _________________________________
          </Text>
          <Text style={{ marginTop: 10 }}>
            Payment: cash ____ card __X__ check ____ credit ____
          </Text>
        </View>

        {/* Footer / Disclaimer */}
        <View style={styles.footer}>
          <Text style={{ marginBottom: 5 }}>
            {usedWorkshopData?.disclaimer || "Default disclaimer text."}
          </Text>
          <Text style={{ textAlign: "right" }}>Page 1/1</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PaymentPDF;
