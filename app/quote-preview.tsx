import * as FileSystem from "expo-file-system";
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
import { Document, Page, Text as PDFText, View as PDFView, Image as PDFImage, StyleSheet as PDFStyleSheet, pdf } from "@react-pdf/renderer";

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

const pdfStyles = PDFStyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottom: '4px solid #E63946',
    alignItems: 'center',
  },
  logo: {
    width: 200,
    height: 70,
    marginBottom: 10,
    objectFit: 'contain',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D3557',
    marginBottom: 5,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 9,
    color: '#6C757D',
    marginBottom: 8,
    textAlign: 'center',
  },
  contactInfo: {
    fontSize: 9,
    color: '#6C757D',
    textAlign: 'center',
  },
  quoteHeader: {
    backgroundColor: '#1D3557',
    color: 'white',
    padding: 15,
    borderRadius: 6,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quoteInfoItem: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 8,
    color: '#A8DADC',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  contentGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  infoBox: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderLeft: '4px solid #2B4C7E',
    borderRadius: 4,
  },
  boxTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2B4C7E',
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#6C757D',
    width: 60,
    fontSize: 9,
  },
  detailValue: {
    color: '#1D3557',
    fontSize: 9,
    flex: 1,
  },
  servicesSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2B4C7E',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottom: '3px solid #E63946',
    textTransform: 'uppercase',
  },
  table: {
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1D3557',
    padding: 10,
    color: 'white',
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 10,
    borderBottom: '1px solid #dee2e6',
  },
  tableRowAlt: {
    backgroundColor: '#f8f9fa',
  },
  serviceNameCell: {
    flex: 1,
    paddingRight: 10,
  },
  serviceName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 3,
  },
  serviceDescription: {
    fontSize: 8,
    color: '#6C757D',
    fontStyle: 'italic',
    lineHeight: 1.4,
  },
  servicePriceCell: {
    width: 80,
    textAlign: 'right',
  },
  servicePrice: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1D3557',
  },
  totalSection: {
    backgroundColor: '#E63946',
    color: 'white',
    padding: 18,
    borderRadius: 6,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    textTransform: 'uppercase',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  footer: {
    marginTop: 20,
    paddingTop: 15,
    borderTop: '2px solid #DEE2E6',
    textAlign: 'center',
    color: '#6C757D',
    fontSize: 8,
  },
  footerNote: {
    marginTop: 8,
    fontStyle: 'italic',
    fontSize: 7,
    color: '#868e96',
  },
});

const QuotePDFDocument = ({ quoteData, quoteNumber }: { quoteData: QuoteData; quoteNumber: string }) => {
  const total = quoteData.services.reduce(
    (sum, service) => sum + parseFloat(service.price),
    0
  );
  const date = new Date().toLocaleDateString("en-ZA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <PDFView style={pdfStyles.header}>
          <PDFImage 
            src={LOGO_URL}
            style={pdfStyles.logo}
          />
          <PDFText style={pdfStyles.tagline}>
            Swartruggens&apos; Trusted Destination for Expert Mechanical Work
          </PDFText>
          <PDFText style={pdfStyles.contactInfo}>
            Phone: +27 76 268 3721 | WhatsApp Available
          </PDFText>
        </PDFView>

        <PDFView style={pdfStyles.quoteHeader}>
          <PDFView style={pdfStyles.quoteInfoItem}>
            <PDFText style={pdfStyles.infoLabel}>Quote Number</PDFText>
            <PDFText style={pdfStyles.infoValue}>{quoteNumber}</PDFText>
          </PDFView>
          <PDFView style={{ ...pdfStyles.quoteInfoItem, alignItems: 'flex-end' }}>
            <PDFText style={pdfStyles.infoLabel}>Date</PDFText>
            <PDFText style={pdfStyles.infoValue}>{date}</PDFText>
          </PDFView>
        </PDFView>

        <PDFView style={pdfStyles.contentGrid}>
          <PDFView style={pdfStyles.infoBox}>
            <PDFText style={pdfStyles.boxTitle}>Client Information</PDFText>
            <PDFView style={pdfStyles.detailRow}>
              <PDFText style={pdfStyles.detailLabel}>Name:</PDFText>
              <PDFText style={pdfStyles.detailValue}>{quoteData.clientName}</PDFText>
            </PDFView>
            <PDFView style={pdfStyles.detailRow}>
              <PDFText style={pdfStyles.detailLabel}>Phone:</PDFText>
              <PDFText style={pdfStyles.detailValue}>{quoteData.clientPhone}</PDFText>
            </PDFView>
            {quoteData.clientEmail && (
              <PDFView style={pdfStyles.detailRow}>
                <PDFText style={pdfStyles.detailLabel}>Email:</PDFText>
                <PDFText style={pdfStyles.detailValue}>{quoteData.clientEmail}</PDFText>
              </PDFView>
            )}
          </PDFView>

          <PDFView style={pdfStyles.infoBox}>
            <PDFText style={pdfStyles.boxTitle}>Vehicle Information</PDFText>
            <PDFView style={pdfStyles.detailRow}>
              <PDFText style={pdfStyles.detailLabel}>Make:</PDFText>
              <PDFText style={pdfStyles.detailValue}>{quoteData.vehicleMake}</PDFText>
            </PDFView>
            <PDFView style={pdfStyles.detailRow}>
              <PDFText style={pdfStyles.detailLabel}>Model:</PDFText>
              <PDFText style={pdfStyles.detailValue}>{quoteData.vehicleModel}</PDFText>
            </PDFView>
            {quoteData.vehicleYear && (
              <PDFView style={pdfStyles.detailRow}>
                <PDFText style={pdfStyles.detailLabel}>Year:</PDFText>
                <PDFText style={pdfStyles.detailValue}>{quoteData.vehicleYear}</PDFText>
              </PDFView>
            )}
          </PDFView>
        </PDFView>

        <PDFView style={pdfStyles.servicesSection}>
          <PDFText style={pdfStyles.sectionTitle}>Services Quoted</PDFText>
          <PDFView style={pdfStyles.table}>
            <PDFView style={pdfStyles.tableHeader}>
              <PDFText style={{ ...pdfStyles.tableHeaderText, flex: 1 }}>Service Description</PDFText>
              <PDFText style={{ ...pdfStyles.tableHeaderText, width: 80, textAlign: 'right' }}>Amount</PDFText>
            </PDFView>
            {quoteData.services.map((service, index) => {
              const rowStyle = index % 2 === 0 
                ? [pdfStyles.tableRow, pdfStyles.tableRowAlt]
                : [pdfStyles.tableRow];
              return (
              <PDFView key={index} style={rowStyle}>
                <PDFView style={pdfStyles.serviceNameCell}>
                  <PDFText style={pdfStyles.serviceName}>{service.name}</PDFText>
                  {service.description && (
                    <PDFText style={pdfStyles.serviceDescription}>{service.description}</PDFText>
                  )}
                </PDFView>
                <PDFView style={pdfStyles.servicePriceCell}>
                  <PDFText style={pdfStyles.servicePrice}>R {parseFloat(service.price).toFixed(2)}</PDFText>
                </PDFView>
              </PDFView>
              );
            })}
          </PDFView>
        </PDFView>

        <PDFView style={pdfStyles.totalSection}>
          <PDFText style={pdfStyles.totalLabel}>Total Amount</PDFText>
          <PDFText style={pdfStyles.totalAmount}>R {total.toFixed(2)}</PDFText>
        </PDFView>

        <PDFView style={pdfStyles.footer}>
          <PDFText style={{ fontWeight: 'bold', marginBottom: 4 }}>Hardings Auto Garage</PDFText>
          <PDFText>Expert mechanical work, performance upgrades, and reliable servicing</PDFText>
          <PDFText>From routine maintenance to full Lexus V8 engine conversions</PDFText>
          <PDFView style={pdfStyles.footerNote}>
            <PDFText>This quote is valid for 30 days from the date of issue.</PDFText>
            <PDFText>All prices are in South African Rand (ZAR) and include VAT where applicable.</PDFText>
          </PDFView>
        </PDFView>
      </Page>
    </Document>
  );
};

const generateProfessionalPDF = async (
  quoteData: QuoteData,
  quoteNumber: string
): Promise<string> => {
  console.log("Creating PDF document from scratch...");
  console.log("Logo URL being used:", LOGO_URL);
  const doc = <QuotePDFDocument quoteData={quoteData} quoteNumber={quoteNumber} />;
  const asPdf = pdf(doc);
  const blob = await asPdf.toBlob();
  
  if (Platform.OS === "web") {
    const url = URL.createObjectURL(blob);
    return url;
  } else {
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve, reject) => {
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
    const fileUri = `${FileSystem.cacheDirectory}quote_${quoteNumber}.pdf`;
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    
    return fileUri;
  }
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
      const message = `Hi ${quoteData.clientName}, here is your quote from Hardings Auto Garage.\n\nQuote #${quoteNumber}\nVehicle: ${quoteData.vehicleMake} ${quoteData.vehicleModel}${quoteData.vehicleYear ? ` (${quoteData.vehicleYear})` : ""}\nTotal: R ${total.toFixed(2)}\n\nPlease find the detailed quote attached.`;

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
