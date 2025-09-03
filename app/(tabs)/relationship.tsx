import { StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";

export default function RelationshipScreen() {
  const handlePremiumPress = () => {
    // Handle premium upsell navigation
    console.log("Premium pressed");
  };

  return (
    <View style={styles.container}>
      <TopBar title="Profile" onPremiumPress={handlePremiumPress} />

      <View style={styles.content}>
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={80} color="#666" />
          </View>

          <Text style={styles.relationshipText}>
            In a relationship with "+19055726485"
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  profileContainer: {
    alignItems: "center",
  },
  avatarContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    borderWidth: 3,
    borderColor: "#e0e0e0",
  },
  relationshipText: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    color: "#333",
    lineHeight: 24,
  },
});
