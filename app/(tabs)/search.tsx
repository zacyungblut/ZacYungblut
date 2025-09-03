import { StyleSheet, TextInput, Dimensions } from "react-native";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";

const { width } = Dimensions.get("window");

export default function SearchScreen() {
  const handlePremiumPress = () => {
    // Handle premium upsell navigation
    console.log("Premium pressed");
  };

  return (
    <View style={styles.container}>
      <TopBar title="Search" onPremiumPress={handlePremiumPress} />

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter phone number..."
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <Text style={styles.subtitle}>
          Search for anyone by phone number to see their status
        </Text>
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
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  searchContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  searchInput: {
    width: width - 40,
    height: 56,
    borderWidth: 2,
    borderColor: "#e1e1e1",
    borderRadius: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    backgroundColor: "#f8f8f8",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
});
