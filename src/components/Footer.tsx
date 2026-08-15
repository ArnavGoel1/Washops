import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

export default function Footer() {
  return (
    <View style={styles.footerContainer}>
      <View style={styles.divider} />
      <View style={styles.content}>
        <Text style={styles.developedBy}>
          Developed by <Text style={styles.authorName}>Arnav Goel</Text>
        </Text>
        <Text style={styles.internshipText}>
          Built during Talking Crooks internship
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  divider: {
    width: "36%",
    height: 1,
    backgroundColor: "#E2E8F0",
    marginBottom: 10,
  },
  content: {
    alignItems: "center",
  },
  developedBy: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  authorName: {
    fontWeight: "800",
    color: "#0F172A",
  },
  internshipText: {
    fontSize: 11,
    color: "#94A3B8",
    marginTop: 2,
    fontWeight: "500",
  },
});
