import { router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FileText, ChevronDown, Check } from "lucide-react-native";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import Colors from "@/constants/colors";
import { LOGO_URL } from "@/constants/logo";
import { SERVICES } from "@/constants/services";
import { CAR_MAKES, POPULAR_MODELS } from "@/constants/vehicles";

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

export default function QuoteBuilderScreen() {
  const insets = useSafeAreaInsets();
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");
  const [selectedServices, setSelectedServices] = useState<Set<string>>(
    new Set()
  );
  const [servicePrices, setServicePrices] = useState<Record<string, string>>(
    {}
  );
  const [serviceDescriptions, setServiceDescriptions] = useState<Record<string, string>>(
    {}
  );
  const [showMakeDropdown, setShowMakeDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const toggleService = (service: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(service)) {
      newSelected.delete(service);
      const newPrices = { ...servicePrices };
      delete newPrices[service];
      setServicePrices(newPrices);
    } else {
      newSelected.add(service);
    }
    setSelectedServices(newSelected);
  };

  const updateServicePrice = (service: string, price: string) => {
    setServicePrices({ ...servicePrices, [service]: price });
  };

  const updateServiceDescription = (service: string, description: string) => {
    setServiceDescriptions({ ...serviceDescriptions, [service]: description });
  };

  const calculateTotal = () => {
    return Array.from(selectedServices).reduce((total, service) => {
      const price = parseFloat(servicePrices[service] || "0");
      return total + price;
    }, 0);
  };

  const validateForm = (): boolean => {
    if (!clientName.trim()) {
      Alert.alert("Validation Error", "Please enter client name");
      return false;
    }
    if (!clientPhone.trim()) {
      Alert.alert("Validation Error", "Please enter client phone number");
      return false;
    }
    if (!vehicleMake.trim()) {
      Alert.alert("Validation Error", "Please select vehicle make");
      return false;
    }
    if (!vehicleModel.trim()) {
      Alert.alert("Validation Error", "Please select vehicle model");
      return false;
    }
    if (selectedServices.size === 0) {
      Alert.alert("Validation Error", "Please select at least one service");
      return false;
    }
    for (const service of selectedServices) {
      if (!servicePrices[service] || parseFloat(servicePrices[service]) <= 0) {
        Alert.alert(
          "Validation Error",
          `Please enter a valid price for ${service}`
        );
        return false;
      }
    }
    return true;
  };

  const handleGenerateQuote = () => {
    if (!validateForm()) return;

    const services: ServiceItem[] = Array.from(selectedServices).map(
      (service) => ({
        name: service,
        price: servicePrices[service],
        description: serviceDescriptions[service] || undefined,
      })
    );

    const quoteData: QuoteData = {
      clientName,
      clientPhone,
      clientEmail,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      services,
    };

    router.push({
      pathname: "/quote-preview",
      params: { quoteData: JSON.stringify(quoteData) },
    });
  };

  const availableModels =
    vehicleMake && POPULAR_MODELS[vehicleMake]
      ? POPULAR_MODELS[vehicleMake]
      : [];

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        style={[styles.container, { paddingTop: insets.top }]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image
            source={{ uri: LOGO_URL }}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Professional Quote Builder</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Client Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Client Name <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={clientName}
              onChangeText={setClientName}
              placeholder="Enter client name"
              placeholderTextColor={Colors.hardings.gray}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Phone Number <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              value={clientPhone}
              onChangeText={setClientPhone}
              placeholder="Enter phone number"
              placeholderTextColor={Colors.hardings.gray}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              value={clientEmail}
              onChangeText={setClientEmail}
              placeholder="Enter email address"
              placeholderTextColor={Colors.hardings.gray}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Make <Text style={styles.required}>*</Text>
            </Text>
            <Pressable
              style={styles.dropdown}
              onPress={() => setShowMakeDropdown(!showMakeDropdown)}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !vehicleMake && styles.placeholderText,
                ]}
              >
                {vehicleMake || "Select make"}
              </Text>
              <ChevronDown size={20} color={Colors.hardings.gray} />
            </Pressable>
            {showMakeDropdown && (
              <View style={styles.dropdownList}>
                <ScrollView style={styles.dropdownScroll}>
                  {CAR_MAKES.map((make) => (
                    <Pressable
                      key={make}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setVehicleMake(make);
                        setVehicleModel("");
                        setShowMakeDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{make}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Model <Text style={styles.required}>*</Text>
            </Text>
            {availableModels.length > 0 ? (
              <>
                <Pressable
                  style={styles.dropdown}
                  onPress={() => setShowModelDropdown(!showModelDropdown)}
                >
                  <Text
                    style={[
                      styles.dropdownText,
                      !vehicleModel && styles.placeholderText,
                    ]}
                  >
                    {vehicleModel || "Select model"}
                  </Text>
                  <ChevronDown size={20} color={Colors.hardings.gray} />
                </Pressable>
                {showModelDropdown && (
                  <View style={styles.dropdownList}>
                    <ScrollView style={styles.dropdownScroll}>
                      {availableModels.map((model) => (
                        <Pressable
                          key={model}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setVehicleModel(model);
                            setShowModelDropdown(false);
                          }}
                        >
                          <Text style={styles.dropdownItemText}>{model}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}
              </>
            ) : (
              <TextInput
                style={styles.input}
                value={vehicleModel}
                onChangeText={setVehicleModel}
                placeholder="Enter model"
                placeholderTextColor={Colors.hardings.gray}
              />
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Year (Optional)</Text>
            <TextInput
              style={styles.input}
              value={vehicleYear}
              onChangeText={setVehicleYear}
              placeholder="Enter year"
              placeholderTextColor={Colors.hardings.gray}
              keyboardType="number-pad"
              maxLength={4}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Services <Text style={styles.required}>*</Text>
          </Text>
          {SERVICES.map((service) => {
            const isSelected = selectedServices.has(service);
            return (
              <View key={service} style={styles.serviceItem}>
                <Pressable
                  style={styles.checkboxContainer}
                  onPress={() => toggleService(service)}
                >
                  <View
                    style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected,
                    ]}
                  >
                    {isSelected && (
                      <Check size={16} color={Colors.hardings.white} strokeWidth={3} />
                    )}
                  </View>
                  <Text style={styles.serviceText}>{service}</Text>
                </Pressable>
                {isSelected && (
                  <>
                    <View style={styles.priceInputContainer}>
                      <Text style={styles.currencySymbol}>R</Text>
                      <TextInput
                        style={styles.priceInput}
                        value={servicePrices[service] || ""}
                        onChangeText={(text) => updateServicePrice(service, text)}
                        placeholder="0.00"
                        placeholderTextColor={Colors.hardings.gray}
                        keyboardType="decimal-pad"
                      />
                    </View>
                    {service === "Lexus V8 engine conversions" && (
                      <View style={styles.descriptionInputContainer}>
                        <TextInput
                          style={styles.descriptionInput}
                          value={serviceDescriptions[service] || ""}
                          onChangeText={(text) => updateServiceDescription(service, text)}
                          placeholder="Describe what this service includes..."
                          placeholderTextColor={Colors.hardings.gray}
                          multiline
                          numberOfLines={3}
                          textAlignVertical="top"
                        />
                      </View>
                    )}
                  </>
                )}
              </View>
            );
          })}
        </View>

        {selectedServices.size > 0 && (
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>
              R {calculateTotal().toFixed(2)}
            </Text>
          </View>
        )}

        <Pressable style={styles.generateButton} onPress={handleGenerateQuote}>
          <FileText size={20} color={Colors.hardings.white} />
          <Text style={styles.generateButtonText}>Generate Quote</Text>
        </Pressable>

        <View style={[styles.bottomSpacer, { height: insets.bottom + 40 }]} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.hardings.gray,
    fontWeight: "500" as const,
    letterSpacing: 0.5,
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
    marginBottom: 18,
    letterSpacing: 0.3,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.hardings.dark,
    marginBottom: 8,
  },
  required: {
    color: Colors.hardings.secondary,
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.hardings.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.hardings.dark,
    backgroundColor: Colors.hardings.white,
  },
  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: Colors.hardings.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: Colors.hardings.white,
  },
  dropdownText: {
    fontSize: 16,
    color: Colors.hardings.dark,
  },
  placeholderText: {
    color: Colors.hardings.gray,
  },
  dropdownList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.hardings.border,
    borderRadius: 8,
    backgroundColor: Colors.hardings.white,
    maxHeight: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.hardings.lightGray,
  },
  dropdownItemText: {
    fontSize: 16,
    color: Colors.hardings.dark,
  },
  serviceItem: {
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderWidth: 2.5,
    borderColor: Colors.hardings.border,
    borderRadius: 7,
    marginRight: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    borderColor: Colors.hardings.secondary,
    backgroundColor: Colors.hardings.secondary,
  },
  serviceText: {
    fontSize: 15,
    color: Colors.hardings.dark,
    flex: 1,
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 36,
    borderWidth: 1,
    borderColor: Colors.hardings.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: Colors.hardings.accent,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.hardings.dark,
    marginRight: 4,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: Colors.hardings.dark,
  },
  descriptionInputContainer: {
    marginLeft: 36,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.hardings.border,
    borderRadius: 8,
    backgroundColor: Colors.hardings.white,
  },
  descriptionInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.hardings.dark,
    minHeight: 70,
  },
  totalSection: {
    backgroundColor: Colors.hardings.primary,
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
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
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.hardings.white,
  },
  generateButton: {
    backgroundColor: Colors.hardings.secondary,
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 28,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.hardings.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  generateButtonText: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.hardings.white,
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  bottomSpacer: {
    height: 40,
  },
});
