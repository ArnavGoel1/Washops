import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { createCustomer } from "@/lib/api/customer";
import { useOrders } from "@/store/OrderContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const BLUE = "#0066FF";
const DARK = "#111827";
const MUTED = "#64748B";
const SUBTLE = "#94A3B8";
const BACKGROUND = "#F6F8FB";
const CARD = "#FFFFFF";
const INPUT = "#FAFBFD";
const BORDER = "#DCE3EC";

const CAR_TYPES = [
  "Sedan",
  "SUV",
  "Hatchback",
  "MUV",
  "Coupe",
  "Crossover",
  "Other",
];

const SCHEDULES = [
  "Daily",
  "Alternate Days",
  "Once a Week",
  "Twice a Week",
  "Custom",
];

interface CarItem {
  id: string;
  type: string;
  model: string;
  number: string;
}

type DropdownState =
  | { kind: "car"; carIndex: number }
  | { kind: "schedule" }
  | null;

export default function AddCustomer() {
  const { refreshOrders } = useOrders();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [schedule, setSchedule] = useState("Daily");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Multi-car state
  const [cars, setCars] = useState<CarItem[]>([
    { id: "1", type: "Sedan", model: "", number: "" },
  ]);

  const [dropdown, setDropdown] = useState<DropdownState>(null);

  const handleAddCar = () => {
    setCars((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        type: "SUV",
        model: "",
        number: "",
      },
    ]);
  };

  const handleRemoveCar = (indexToRemove: number) => {
    if (cars.length <= 1) return;
    setCars((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleCarTypeChange = (index: number, newType: string) => {
    setCars((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], type: newType };
      return next;
    });
    setDropdown(null);
  };

  const handleCarFieldChange = (
    index: number,
    field: "model" | "number",
    val: string
  ) => {
    setCars((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Required", "Please enter customer name");
      return;
    }
    if (!phone.trim()) {
      Alert.alert("Required", "Please enter phone number");
      return;
    }

    setIsSubmitting(true);
    try {
      const carPayload = cars.map((c) => ({
        type: c.type,
        model: c.model.trim() || c.type,
        company: "Standard",
        carNumber: c.number.trim() || undefined,
      }));

      await createCustomer({
        name: name.trim(),
        phone: phone.trim(),
        address: address.trim(),
        cars: carPayload,
        schedule,
        price: price.trim() || undefined,
        notes: notes.trim(),
      });

      await refreshOrders();
      Alert.alert(
        "Success",
        "Customer & " +
          cars.length +
          " vehicle" +
          (cars.length === 1 ? "" : "s") +
          " created successfully!",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create customer");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.pageHeader}>
            <TouchableOpacity
              style={styles.backButton}
              activeOpacity={0.7}
              onPress={() => router.back()}
              disabled={isSubmitting}
            >
              <Ionicons name="chevron-back" size={20} color={DARK} />
            </TouchableOpacity>

            <View style={{ marginLeft: 12 }}>
              <Text style={styles.title}>New Customer</Text>
              <Text style={styles.subtitle}>
                Add customer and vehicle details
              </Text>
            </View>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            {/* Customer Name */}
            <View style={styles.field}>
              <Text style={styles.label}>Customer Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. John Doe"
                placeholderTextColor={SUBTLE}
                value={name}
                onChangeText={setName}
                editable={!isSubmitting}
              />
            </View>

            {/* Phone */}
            <View style={styles.field}>
              <Text style={styles.label}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. +91 98765 43210"
                placeholderTextColor={SUBTLE}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                editable={!isSubmitting}
              />
            </View>

            {/* Address */}
            <View style={styles.field}>
              <Text style={styles.label}>Address / Parking Spot</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Flat 402, Tower B"
                placeholderTextColor={SUBTLE}
                value={address}
                onChangeText={setAddress}
                editable={!isSubmitting}
              />
            </View>

            {/* VEHICLES SECTION WITH PLUS BUTTON */}
            <View style={styles.carSectionHeader}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="car-sport" size={18} color={DARK} />
                <Text style={styles.carSectionTitle}>Car Details</Text>
                <View style={styles.carCountBadge}>
                  <Text style={styles.carCountBadgeText}>{cars.length}</Text>
                </View>
              </View>

              {/* Plus Button to add more cars */}
              <TouchableOpacity
                style={styles.addCarBtn}
                activeOpacity={0.8}
                onPress={handleAddCar}
                disabled={isSubmitting}
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <Text style={styles.addCarBtnText}>Add Car</Text>
              </TouchableOpacity>
            </View>

            {/* CARS LIST */}
            {cars.map((car, index) => (
              <View key={car.id} style={styles.carItemCard}>
                <View style={styles.carCardTop}>
                  <Text style={styles.carItemNumber}>Vehicle #{index + 1}</Text>
                  {cars.length > 1 && (
                    <TouchableOpacity
                      style={styles.removeCarBtn}
                      onPress={() => handleRemoveCar(index)}
                      disabled={isSubmitting}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={15}
                        color="#EF4444"
                      />
                      <Text style={styles.removeCarText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* Car Type Dropdown */}
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.subLabel}>Car Type</Text>
                  <TouchableOpacity
                    style={styles.dropdownInput}
                    activeOpacity={0.7}
                    onPress={() =>
                      setDropdown({ kind: "car", carIndex: index })
                    }
                    disabled={isSubmitting}
                  >
                    <Text style={styles.dropdownValue}>{car.type}</Text>
                    <Ionicons name="chevron-down" size={18} color={MUTED} />
                  </TouchableOpacity>
                </View>

                {/* Model & Registration row */}
                <View style={styles.carRowFields}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.subLabel}>Car Model</Text>
                    <TextInput
                      style={styles.inputSmall}
                      placeholder="e.g. Creta / City"
                      placeholderTextColor={SUBTLE}
                      value={car.model}
                      onChangeText={(val) =>
                        handleCarFieldChange(index, "model", val)
                      }
                      editable={!isSubmitting}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.subLabel}>Number Plate</Text>
                    <TextInput
                      style={styles.inputSmall}
                      placeholder="e.g. DL 01 AB 1234"
                      placeholderTextColor={SUBTLE}
                      autoCapitalize="characters"
                      value={car.number}
                      onChangeText={(val) =>
                        handleCarFieldChange(index, "number", val)
                      }
                      editable={!isSubmitting}
                    />
                  </View>
                </View>
              </View>
            ))}

            {/* Schedule Dropdown */}
            <View style={[styles.field, { marginTop: 12 }]}>
              <Text style={styles.label}>Service Frequency</Text>
              <TouchableOpacity
                style={styles.dropdownInput}
                activeOpacity={0.7}
                onPress={() => setDropdown({ kind: "schedule" })}
                disabled={isSubmitting}
              >
                <Text style={styles.dropdownValue}>{schedule}</Text>
                <Ionicons name="chevron-down" size={18} color={MUTED} />
              </TouchableOpacity>
            </View>

            {/* Monthly Rate / Price */}
            <View style={styles.field}>
              <Text style={styles.label}>Rate (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 450"
                placeholderTextColor={SUBTLE}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                editable={!isSubmitting}
              />
            </View>

            {/* Notes */}
            <View style={styles.field}>
              <Text style={styles.label}>Special Instructions / Notes</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="e.g. Wash keys with guard, focus on alloys"
                placeholderTextColor={SUBTLE}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
                editable={!isSubmitting}
              />
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, isSubmitting && styles.disabledButton]}
              activeOpacity={0.8}
              onPress={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveButtonText}>
                  Create Customer ({cars.length} Car
                  {cars.length === 1 ? "" : "s"})
                </Text>
              )}
            </TouchableOpacity>
          </View>
        <Footer />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Dropdown */}
      <Modal visible={dropdown !== null} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDropdown(null)}
        >
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {dropdown?.kind === "car" ? "Select Car Type" : "Service Schedule"}
            </Text>

            {(dropdown?.kind === "car" ? CAR_TYPES : SCHEDULES).map((opt) => {
              const isSelected =
                dropdown?.kind === "car"
                  ? cars[dropdown.carIndex]?.type === opt
                  : schedule === opt;

              return (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.modalOption,
                    isSelected && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    if (dropdown?.kind === "car") {
                      handleCarTypeChange(dropdown.carIndex, opt);
                    } else {
                      setSchedule(opt);
                      setDropdown(null);
                    }
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      isSelected && styles.modalOptionTextSelected,
                    ]}
                  >
                    {opt}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark" size={18} color={BLUE} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BACKGROUND,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  pageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: CARD,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: DARK,
  },
  subtitle: {
    fontSize: 13,
    color: MUTED,
    marginTop: 2,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: DARK,
    marginBottom: 6,
  },
  subLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: MUTED,
    marginBottom: 4,
  },
  input: {
    height: 48,
    backgroundColor: INPUT,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 14,
    fontSize: 14,
    color: DARK,
  },
  inputSmall: {
    height: 44,
    backgroundColor: CARD,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    fontSize: 13,
    color: DARK,
  },
  textArea: {
    height: 80,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  carSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  carSectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: DARK,
    marginLeft: 6,
  },
  carCountBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  carCountBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: BLUE,
  },
  addCarBtn: {
    backgroundColor: BLUE,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addCarBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  carItemCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
  },
  carCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  carItemNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: DARK,
  },
  removeCarBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  removeCarText: {
    fontSize: 11,
    color: "#EF4444",
    fontWeight: "600",
  },
  carRowFields: {
    flexDirection: "row",
    marginTop: 8,
  },
  dropdownInput: {
    height: 44,
    backgroundColor: CARD,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dropdownValue: {
    fontSize: 13,
    color: DARK,
    fontWeight: "500",
  },
  saveButton: {
    height: 50,
    backgroundColor: BLUE,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: DARK,
    marginBottom: 14,
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  modalOptionSelected: {
    backgroundColor: "#F8FAFC",
  },
  modalOptionText: {
    fontSize: 14,
    color: DARK,
  },
  modalOptionTextSelected: {
    fontWeight: "700",
    color: BLUE,
  },
});
