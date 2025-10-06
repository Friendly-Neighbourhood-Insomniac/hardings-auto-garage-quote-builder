import * as FileSystem from "expo-file-system";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { Download, MessageCircle, ArrowLeft, Eye } from "lucide-react-native";
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Alert,
  Image,
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

const generateQuoteHTML = (quoteData: QuoteData, quoteNumber: string) => {
  const total = quoteData.services.reduce(
    (sum, service) => sum + parseFloat(service.price),
    0
  );
  const date = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const servicesHTML = quoteData.services
    .map(
      (service, index) => `
    <tr style="${index % 2 === 0 ? "background-color: #f8f9fa;" : ""}">
      <td style="padding: 8px 12px; border-bottom: 1px solid #dee2e6; font-size: 11px; color: #2c3e50;">${service.name}</td>
      <td style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #dee2e6; font-weight: 600; font-size: 11px; color: #1D3557;">R ${parseFloat(service.price).toFixed(2)}</td>
    </tr>
  `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        @page {
          size: A4;
          margin: 15mm;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          color: #1D3557;
          line-height: 1.3;
          font-size: 10px;
        }
        .header {
          text-align: center;
          margin-bottom: 10px;
          padding-bottom: 8px;
          border-bottom: 2px solid #E63946;
        }
        .logo {
          width: 180px;
          height: auto;
          margin: 0 auto 4px;
          display: block;
        }
        .contact-info {
          font-size: 8px;
          color: #6C757D;
          line-height: 1.3;
        }
        .quote-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 8px 12px;
          background: linear-gradient(135deg, #2B4C7E 0%, #1D3557 100%);
          border-radius: 4px;
        }
        .quote-info-item {
          flex: 1;
        }
        .info-label {
          font-size: 8px;
          color: #A8DADC;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-bottom: 2px;
        }
        .info-value {
          font-size: 11px;
          font-weight: 700;
          color: #ffffff;
        }
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 10px;
        }
        .info-box {
          padding: 8px;
          background-color: #F8F9FA;
          border-left: 3px solid #2B4C7E;
          border-radius: 3px;
        }
        .box-title {
          font-size: 9px;
          font-weight: 700;
          color: #2B4C7E;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .detail-row {
          display: flex;
          margin-bottom: 2px;
        }
        .detail-label {
          font-weight: 600;
          color: #6C757D;
          width: 55px;
          font-size: 9px;
        }
        .detail-value {
          color: #1D3557;
          font-size: 9px;
          flex: 1;
        }
        .services-section {
          margin-bottom: 10px;
        }
        .section-title {
          font-size: 10px;
          font-weight: 700;
          color: #2B4C7E;
          margin-bottom: 6px;
          padding-bottom: 4px;
          border-bottom: 2px solid #E63946;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 10px;
          background-color: #ffffff;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          overflow: hidden;
        }
        th {
          background: linear-gradient(135deg, #2B4C7E 0%, #1D3557 100%);
          color: white;
          padding: 6px 8px;
          text-align: left;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 8px;
          letter-spacing: 0.3px;
        }
        th:last-child {
          text-align: right;
        }
        td {
          padding: 5px 8px;
          border-bottom: 1px solid #dee2e6;
        }
        tbody tr:last-child td {
          border-bottom: none;
        }
        .total-section {
          background: linear-gradient(135deg, #E63946 0%, #C62828 100%);
          color: white;
          padding: 10px 14px;
          border-radius: 4px;
          margin-bottom: 10px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .total-label {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .total-amount {
          font-size: 18px;
          font-weight: 700;
        }
        .footer {
          margin-top: 10px;
          padding-top: 8px;
          border-top: 1px solid #DEE2E6;
          text-align: center;
          color: #6C757D;
          font-size: 7px;
          line-height: 1.4;
        }
        .footer-note {
          margin-top: 4px;
          font-style: italic;
          font-size: 6px;
          color: #868e96;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${LOGO_URL}" alt="Hardings Auto Garage" class="logo" />
        <div class="contact-info">
          Swartruggens' Trusted Destination for Expert Mechanical Work<br>
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
    </body>
    </html>
  `;
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
      
      if (typeof dataString === 'string') {
        quoteData = JSON.parse(dataString);
      }
    }
  } catch (error) {
    console.error('Error parsing quote data:', error, params.quoteData);
    Alert.alert('Error', 'Invalid quote data. Please try again.');
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
      const html = generateQuoteHTML(quoteData, quoteNumber);
      const { uri } = await Print.printToFileAsync({ html });

      if (Platform.OS === "web") {
        const link = document.createElement("a");
        link.href = uri;
        link.download = `Quote_${quoteNumber}.pdf`;
        link.click();
        Alert.alert("Success", "Quote downloaded successfully!");
      } else {
        const newPath = `${FileSystem.documentDirectory}Quote_${quoteNumber}.pdf`;
        await FileSystem.moveAsync({
          from: uri,
          to: newPath,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(newPath);
        } else {
          Alert.alert("Success", "Quote saved successfully!");
        }
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Failed to generate PDF. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsAppShare = async () => {
    try {
      setIsGenerating(true);
      const html = generateQuoteHTML(quoteData, quoteNumber);
      const { uri } = await Print.printToFileAsync({ html });

      const message = `Hi ${quoteData.clientName}, here's your quote from Hardings Auto Garage.\n\nQuote #${quoteNumber}\nVehicle: ${quoteData.vehicleMake} ${quoteData.vehicleModel}${quoteData.vehicleYear ? ` (${quoteData.vehicleYear})` : ""}\nTotal: R ${total.toFixed(2)}\n\nPlease find the detailed quote attached.`;

      const phoneNumber = quoteData.clientPhone.replace(/\D/g, "");

      if (Platform.OS === "web") {
        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, "_blank");
        Alert.alert(
          "Note",
          "WhatsApp opened in new tab. You'll need to manually attach the PDF."
        );
      } else {
        const newPath = `${FileSystem.documentDirectory}Quote_${quoteNumber}.pdf`;
        await FileSystem.moveAsync({
          from: uri,
          to: newPath,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(newPath, {
            mimeType: "application/pdf",
            dialogTitle: "Share Quote via WhatsApp",
            UTI: "com.adobe.pdf",
          });
        } else {
          Alert.alert(
            "Error",
            "Sharing is not available on this device."
          );
        }
      }
    } catch (error) {
      console.error("Error sharing via WhatsApp:", error);
      Alert.alert("Error", "Failed to share via WhatsApp. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePreviewPDF = async () => {
    try {
      setIsGenerating(true);
      const html = generateQuoteHTML(quoteData, quoteNumber);
      
      if (Platform.OS === "web") {
        const { uri } = await Print.printToFileAsync({ html });
        window.open(uri, "_blank");
      } else {
        await Print.printAsync({ html });
      }
    } catch (error) {
      console.error("Error previewing PDF:", error);
      Alert.alert("Error", "Failed to preview PDF. Please try again.");
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
                <Text style={styles.serviceName}>{service.name}</Text>
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
              style={[styles.button, styles.previewButton]}
              onPress={handlePreviewPDF}
              disabled={isGenerating}
            >
              <Eye size={20} color={Colors.hardings.white} />
              <Text style={styles.buttonText}>Preview Quote</Text>
            </Pressable>

            <View style={styles.actionRow}>
              <Pressable
                style={[styles.button, styles.downloadButton, styles.halfButton]}
                onPress={handleDownloadPDF}
                disabled={isGenerating}
              >
                <Download size={18} color={Colors.hardings.white} />
                <Text style={styles.buttonTextSmall}>
                  {isGenerating ? "Generating..." : "Download"}
                </Text>
              </Pressable>

              <Pressable
                style={[styles.button, styles.whatsappButton, styles.halfButton]}
                onPress={handleWhatsAppShare}
                disabled={isGenerating}
              >
                <MessageCircle size={18} color={Colors.hardings.white} />
                <Text style={styles.buttonTextSmall}>WhatsApp</Text>
              </Pressable>
            </View>
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
  },
  serviceName: {
    flex: 1,
    fontSize: 15,
    color: Colors.hardings.dark,
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
    gap: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  halfButton: {
    flex: 1,
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
  previewButton: {
    backgroundColor: Colors.hardings.secondary,
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
  buttonTextSmall: {
    fontSize: 15,
    fontWeight: "700" as const,
    color: Colors.hardings.white,
    marginLeft: 8,
    letterSpacing: 0.3,
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
