import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";
import { colors } from "@/constants/Colors";

interface SearchBarProps {
  placeholder?: string;
  onSearchChange?: (text: string) => void;
  onMenuPress?: () => void;
  showMenuButton?: boolean;
}

export default function SearchBar({
  placeholder = "Search",
  onSearchChange,
  onMenuPress,
  showMenuButton = true,
}: SearchBarProps) {
  const [searchText, setSearchText] = useState("");

  const handleTextChange = (text: string) => {
    setSearchText(text);
    onSearchChange?.(text);
  };

  const clearSearch = () => {
    setSearchText("");
    onSearchChange?.("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={colors.text.secondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={colors.text.secondary}
          value={searchText}
          onChangeText={handleTextChange}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={clearSearch}
            style={styles.clearButton}
            activeOpacity={0.7}>
            <Ionicons
              name="close-circle"
              size={18}
              color={colors.text.secondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {showMenuButton && (
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onMenuPress}
          activeOpacity={0.7}>
          <Ionicons
            name="ellipsis-horizontal"
            size={24}
            color={colors.text.primary}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 10,
    height: 110,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderWidth: 1,
    borderColor: colors.border.light,
    minHeight: 38,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 18,
    ...Platform.select({
      ios: {
        paddingVertical: 0,
      },
      android: {
        paddingVertical: 0,
        textAlignVertical: "center",
      },
    }),
  },
  clearButton: {
    marginLeft: 8,
    padding: 2,
  },
  menuButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
});
