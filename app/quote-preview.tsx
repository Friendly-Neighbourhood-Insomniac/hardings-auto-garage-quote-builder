import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { Download, MessageCircle, ArrowLeft } from "lucide-react-native";
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Alert,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import Colors from "@/constants/colors";
import { LOGO_URL } from "@/constants/logo";

interface ServiceItem {
  name: string;
  price: string;
  description?: string;
}

interface QuoteData {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  services: ServiceItem[];
}

const generateProfessionalPDF = async (
  quoteData: QuoteData,
  quoteNumber: string
): Promise<string> => {
  const total = quoteData.services.reduce(
    (sum, service) => sum + parseFloat(service.price),
    0
  );
  const date = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let logoBase64 = "";
  try {
    const response = await fetch(LOGO_URL);
    const blob = await response.blob();
    const reader = new FileReader();
    logoBase64 = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error loading logo:", error);
  }

  const servicesHTML = quoteData.services
    .map(
      (service, index) => `
    <tr style="${index % 2 === 0 ? "background-color: #f8f9fa;" : ""}">
      <td style="padding: 14px 16px; border-bottom: 1px solid #dee2e6; font-size: 13px; color: #2c3e50;">
        <div style="font-weight: 600; margin-bottom: ${service.description ? "6px" : "0"};">${service.name}</div>
        ${service.description ? `<div style="font-size: 11px; color: #6C757D; line-height: 1.5; margin-top: 4px; font-style: italic;">${service.description}</div>` : ""}
      </td>
      <td style="padding: 14px 16px; text-align: right; border-bottom: 1px solid #dee2e6; font-weight: 600; font-size: 13px; color: #1D3557; vertical-align: top;">R ${parseFloat(service.price).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #1D3557;
          line-height: 1.5;
          font-size: 13px;
          padding: 0;
          margin: 0;
        }
        .container {
          max-width: 100%;
          margin: 0 auto;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 4px solid #E63946;
        }
        .logo {
          width: 220px;
          height: auto;
          margin: 0 auto 10px;
          display: block;
        }
        .company-name {
          font-size: 24px;
          font-weight: 700;
          color: #1D3557;
          margin-bottom: 5px;
        }
        .tagline {
          font-size: 11px;
          color: #6C757D;
          margin-bottom: 8px;
        }
        .contact-info {
          font-size: 11px;
          color: #6C757D;
          line-height: 1.6;
        }
        .quote-header {
          background: linear-gradient(135deg, #2B4C7E 0%, #1D3557 100%);
          color: white;
          padding: 18px 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .quote-info-item {
          flex: 1;
        }
        .info-label {
          font-size: 10px;
          color: #A8DADC;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
        }
        .info-value {
          font-size: 16px;
          font-weight: 700;
          color: #ffffff;
        }
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          margin-bottom: 20px;
        }
        .info-box {
          padding: 16px;
          background-color: #F8F9FA;
          border-left: 4px solid #2B4C7E;
          border-radius: 6px;
        }
        .box-title {
          font-size: 12px;
          font-weight: 700;
          color: #2B4C7E;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .detail-row {
          display: flex;
          margin-bottom: 6px;
        }
        .detail-label {
          font-weight: 600;
          color: #6C757D;
          width: 70px;
          font-size: 12px;
        }
        .detail-value {
          color: #1D3557;
          font-size: 12px;
          flex: 1;
        }
        .services-section {
          margin-bottom: 20px;
        }
        .section-title {
          font-size: 14px;
          font-weight: 700;
          color: #2B4C7E;
          margin-bottom: 12px;
          padding-bottom: 8px;
          border-bottom: 3px solid #E63946;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          background-color: #ffffff;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          overflow: hidden;
        }
        th {
          background: linear-gradient(135deg, #2B4C7E 0%, #1D3557 100%);
          color: white;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.8px;
        }
        th:last-child {
          text-align: right;
        }
        td {
          padding: 14px 16px;
          border-bottom: 1px solid #dee2e6;
        }
        tbody tr:last-child td {
          border-bottom: none;
        }
        .total-section {
          background: linear-gradient(135deg, #E63946 0%, #C62828 100%);
          color: white;
          padding: 20px 24px;
          border-radius: 8px;
          margin-bottom: 20px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .total-label {
          font-size: 16px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }
        .total-amount {
          font-size: 32px;
          font-weight: 700;
        }
        .footer {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 2px solid #DEE2E6;
          text-align: center;
          color: #6C757D;
          font-size: 10px;
          line-height: 1.6;
        }
        .footer-note {
          margin-top: 8px;
          font-style: italic;
          font-size: 9px;
          color: #868e96;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          ${logoBase64 ? `<img src="${logoBase64}" alt="Hardings Auto Garage" class="logo" />` : '<div class="company-name">HARDINGS AUTO GARAGE</div>'}
          <div class="tagline">Swartruggens' Trusted Destination for Expert Mechanical Work</div>
          <div class="contact-info">
            Phone: +27 76 268 3721 | WhatsApp Available
          </div>
        </div>

        <div class="quote-header">
          <div class="quote-info-item">
            <div class="info-label">Quote Number</div>
            <div class="info-value">${quoteNumber}</div>
          </div>
          <div class="quote-info-item" style="text-align: right;">
            <div class="info-label">Date</div>
            <div class="info-value">${date}</div>
          </div>
        </div>

        <div class="content-grid">
          <div class="info-box">
            <div class="box-title">Client Information</div>
            <div class="detail-row">
              <div class="detail-label">Name:</div>
              <div class="detail-value">${quoteData.clientName}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Phone:</div>
              <div class="detail-value">${quoteData.clientPhone}</div>
            </div>
            ${
              quoteData.clientEmail
                ? `
            <div class="detail-row">
              <div class="detail-label">Email:</div>
              <div class="detail-value">${quoteData.clientEmail}</div>
            </div>
            `
                : ""
            }
          </div>

          <div class="info-box">
            <div class="box-title">Vehicle Information</div>
            <div class="detail-row">
              <div class="detail-label">Make:</div>
              <div class="detail-value">${quoteData.vehicleMake}</div>
            </div>
            <div class="detail-row">
              <div class="detail-label">Model:</div>
              <div class="detail-value">${quoteData.vehicleModel}</div>
            </div>
            ${
              quoteData.vehicleYear
                ? `
            <div class="detail-row">
              <div class="detail-label">Year:</div>
              <div class="detail-value">${quoteData.vehicleYear}</div>
            </div>
            `
                : ""
            }
          </div>
        </div>

        <div class="services-section">
          <div class="section-title">Services Quoted</div>
          <table>
            <thead>
              <tr>
                <th>Service Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${servicesHTML}
            </tbody>
          </table>
        </div>

        <div class="total-section">
          <div class="total-row">
            <div class="total-label">Total Amount</div>
            <div class="total-amount">R ${total.toFixed(2)}</div>
          </div>
        </div>

        <div class="footer">
          <strong>Hardings Auto Garage</strong><br>
          Expert mechanical work, performance upgrades, and reliable servicing<br>
          From routine maintenance to full Lexus V8 engine conversions
          <div class="footer-note">
            This quote is valid for 30 days from the date of issue.<br>
            All prices are in South African Rand (ZAR) and include VAT where applicable.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const { uri } = await Print.printToFileAsync({ html });
  return uri;
};

export default function QuotePreviewScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [isGenerating, setIsGenerating] = useState(false);

  let quoteData: QuoteData | null = null;

  try {
    if (params.quoteData) {
      const dataString = Array.isArray(params.quoteData)
        ? params.quoteData[0]
        : params.quoteData;

      if (typeof dataString === "string") {
        quoteData = JSON.parse(dataString);
      }
    }
  } catch (error) {
    console.error("Error parsing quote data:", error, params.quoteData);
    Alert.alert("Error", "Invalid quote data. Please try again.");
  }

  if (!quoteData) {
    return (
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <Text style={styles.errorText}>No quote data available</Text>
      </View>
    );
  }

  const quoteNumber = `HAG-${Date.now().toString().slice(-8)}`;
  const total = quoteData.services.reduce(
    (sum, service) => sum + parseFloat(service.price),
    0
  );

  const handleDownloadPDF = async () => {
    try {
      setIsGenerating(true);
      console.log("Generating PDF...");

      const pdfUri = await generateProfessionalPDF(quoteData, quoteNumber);
      console.log("PDF generated at:", pdfUri);

      if (Platform.OS === "web") {
        const link = document.createElement("a");
        link.href = pdfUri;
        link.download = `Quote_${quoteNumber}.pdf`;
        link.click();
        Alert.alert("Success", "Quote downloaded successfully!");
      } else {
        const newPath = `${FileSystem.documentDirectory}Quote_${quoteNumber}.pdf`;
        await FileSystem.moveAsync({
          from: pdfUri,
          to: newPath,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(newPath, {
            mimeType: "application/pdf",
            dialogTitle: "Save Quote",
          });
        } else {
          Alert.alert("Success", "Quote saved successfully!");
        }
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Alert.alert("Error", `Failed to generate PDF: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsAppShare = async () => {
    try {
      setIsGenerating(true);
      console.log("Generating PDF for WhatsApp...");

      const pdfUri = await generateProfessionalPDF(quoteData, quoteNumber);
      console.log("PDF generated for WhatsApp at:", pdfUri);

      const phoneNumber = quoteData.clientPhone.replace(/\D/g, "");
      const message = `Hi ${quoteData.clientName}, here's your quote from Hardings Auto Garage.\n\nQuote #${quoteNumber}\nVehicle: ${quoteData.vehicleMake} ${quoteData.vehicleModel}${quoteData.vehicleYear ? ` (${quoteData.vehicleYear})` : ""}\nTotal: R ${total.toFixed(2)}\n\nPlease find the detailed quote attached.`;

      if (Platform.OS === "web") {
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
        
        const link = document.createElement("a");
        link.href = pdfUri;
        link.download = `Quote_${quoteNumber}.pdf`;
        link.click();
        
        Alert.alert(
          "WhatsApp Opened",
          "The PDF has been downloaded. Please attach it manually in WhatsApp."
        );
      } else {
        const newPath = `${FileSystem.documentDirectory}Quote_${quoteNumber}.pdf`;
        await FileSystem.moveAsync({
          from: pdfUri,
          to: newPath,
        });

        const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
        const canOpen = await Linking.canOpenURL(whatsappUrl);

        if (canOpen) {
          await Linking.openURL(whatsappUrl);
          
          setTimeout(async () => {
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(newPath, {
                mimeType: "application/pdf",
                dialogTitle: "Share Quote PDF",
              });
            }
          }, 1000);
        } else {
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(newPath, {
              mimeType: "application/pdf",
              dialogTitle: "Share Quote via WhatsApp",
            });
          } else {
            Alert.alert("Error", "WhatsApp is not installed on this device.");
          }
        }
      }
    } catch (error) {
      console.error("Error sharing via WhatsApp:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Alert.alert("Error", `Failed to share via WhatsApp: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Quote Preview",
          headerLeft: () => (
            <Pressable
              onPress={() => router.back()}
              style={styles.headerButton}
            >
              <ArrowLeft size={24} color={Colors.hardings.primary} />
            </Pressable>
          ),
        }}
      />
      <View style={[styles.container, { paddingBottom: insets.bottom }]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Image
              source={{ uri: LOGO_URL }}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.quoteInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Quote Number</Text>
              <Text style={styles.infoValue}>{quoteNumber}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>
                {new Date().toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Client Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{quoteData.clientName}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone:</Text>
              <Text style={styles.detailValue}>{quoteData.clientPhone}</Text>
            </View>
            {quoteData.clientEmail && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Email:</Text>
                <Text style={styles.detailValue}>{quoteData.clientEmail}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Make:</Text>
              <Text style={styles.detailValue}>{quoteData.vehicleMake}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Model:</Text>
              <Text style={styles.detailValue}>{quoteData.vehicleModel}</Text>
            </View>
            {quoteData.vehicleYear && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Year:</Text>
                <Text style={styles.detailValue}>{quoteData.vehicleYear}</Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Services</Text>
            {quoteData.services.map((service, index) => (
              <View key={index} style={styles.serviceRow}>
                <View style={styles.serviceDetails}>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  {service.description && (
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                  )}
                </View>
                <Text style={styles.servicePrice}>
                  R {parseFloat(service.price).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>R {total.toFixed(2)}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Pressable
              style={[styles.button, styles.downloadButton]}
              onPress={handleDownloadPDF}
              disabled={isGenerating}
            >
              <Download size={20} color={Colors.hardings.white} />
              <Text style={styles.buttonText}>
                {isGenerating ? "Generating..." : "Download PDF"}
              </Text>
            </Pressable>

            <Pressable
              style={[styles.button, styles.whatsappButton]}
              onPress={handleWhatsAppShare}
              disabled={isGenerating}
            >
              <MessageCircle size={20} color={Colors.hardings.white} />
              <Text style={styles.buttonText}>Send via WhatsApp</Text>
            </Pressable>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.hardings.lightBg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  headerButton: {
    padding: 8,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: Colors.hardings.white,
    marginHorizontal: -20,
    marginBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: Colors.hardings.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logo: {
    width: 280,
    height: 100,
  },
  quoteInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: Colors.hardings.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.hardings.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  infoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.hardings.gray,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.hardings.dark,
  },
  section: {
    backgroundColor: Colors.hardings.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: Colors.hardings.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700" as const,
    color: Colors.hardings.primary,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: Colors.hardings.light,
    letterSpacing: 0.3,
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: "600" as const,
    color: Colors.hardings.gray,
    width: 80,
  },
  detailValue: {
    flex: 1,
    color: Colors.hardings.dark,
  },
  serviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hardings.lightGray,
    alignItems: "flex-start",
  },
  serviceDetails: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.hardings.dark,
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: Colors.hardings.gray,
    fontStyle: "italic" as const,
    lineHeight: 18,
  },
  servicePrice: {
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.hardings.dark,
  },
  totalSection: {
    backgroundColor: Colors.hardings.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: Colors.hardings.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.hardings.white,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: Colors.hardings.white,
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  downloadButton: {
    backgroundColor: Colors.hardings.primary,
  },
  whatsappButton: {
    backgroundColor: "#25D366",
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.hardings.white,
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  errorText: {
    fontSize: 16,
    color: Colors.hardings.secondary,
    textAlign: "center",
  },
  bottomSpacer: {
    height: 40,
  },
});
