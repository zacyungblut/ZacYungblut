import { StyleSheet, Dimensions } from "react-native";
import { useState } from "react";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import PhoneTextInput from "@/components/PhoneTextInput";
import { DEFAULT_COUNTRY } from "@/constants/countryCodes";

const { width } = Dimensions.get("window");

export default function SearchScreen() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry] = useState(DEFAULT_COUNTRY);

  const handlePremiumPress = () => {
    // Handle premium upsell navigation
    console.log("Premium pressed");
  };

  const handlePhoneNumberChange = (text: string) => {
    setPhoneNumber(text);
    // You can add search logic here as the user types
    console.log("Phone number changed:", text);
  };

  return (
    <View style={styles.container}>
      <TopBar title="Search" onPremiumPress={handlePremiumPress} />

      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <PhoneTextInput
            label="Phone Number"
            phoneNumber={phoneNumber}
            onPhoneNumberChange={handlePhoneNumberChange}
            selectedCountry={selectedCountry}
            placeholder="Enter phone number"
            autoFocus={true}
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
    width: "100%",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
});
