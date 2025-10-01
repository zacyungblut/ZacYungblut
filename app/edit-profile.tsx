import React, { useState } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import { Text, View } from "@/components/Themed";
import { colors } from "@/constants/Colors";
import { useUserRedux } from "@/store/hooks/useUserRedux";

interface EditableFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  onPress: () => void;
  showChevron?: boolean;
  isLink?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  placeholder,
  onPress,
  showChevron = true,
  isLink = false,
}) => (
  <TouchableOpacity
    style={styles.fieldContainer}
    onPress={onPress}
    activeOpacity={0.7}>
    <View style={styles.fieldContent}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text
        style={[
          styles.fieldValue,
          !value && styles.fieldPlaceholder,
          isLink && styles.fieldLink,
        ]}
        numberOfLines={1}>
        {value || placeholder || "Add..."}
      </Text>
    </View>
    {showChevron && (
      <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
    )}
  </TouchableOpacity>
);

export default function EditProfileScreen() {
  const { user } = useUserRedux();
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleBackPress = () => {
    router.back();
  };

  const handleChangePhoto = async () => {
    Alert.alert("Change profile photo", "Choose an option", [
      {
        text: "Camera",
        onPress: () => openCamera(),
      },
      {
        text: "Photo Library",
        onPress: () => openImagePicker(),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const openCamera = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      // Here you would typically upload the image to your backend
    }
  };

  const openImagePicker = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission to access photos is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
      // Here you would typically upload the image to your backend
    }
  };

  const handleEditName = () => {
    // Navigate to name editing screen or show modal
    console.log("Edit name");
  };

  const handleEditUsername = () => {
    router.push("/pisser-tag");
  };

  const handleEditPronouns = () => {
    // Navigate to pronouns editing screen or show modal
    console.log("Edit pronouns");
  };

  const handleEditBio = () => {
    // Navigate to bio editing screen or show modal
    console.log("Edit bio");
  };

  const handleEditNonprofit = () => {
    // Navigate to nonprofit editing screen or show modal
    console.log("Edit nonprofit");
  };

  const handleEditAISelf = () => {
    // Navigate to AI self editing screen or show modal
    console.log("Edit AI Self");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={28} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo Section */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <Image
              source={
                profileImage
                  ? { uri: profileImage }
                  : require("@/assets/images/DefaultProfile.jpg")
              }
              style={styles.profilePhoto}
              resizeMode="cover"
            />
            <View style={styles.cameraIconContainer}>
              <Ionicons name="camera" size={20} color={colors.white} />
            </View>
          </View>
          <TouchableOpacity
            style={styles.changePhotoButton}
            onPress={handleChangePhoto}
            activeOpacity={0.7}>
            <Text style={styles.changePhotoText}>Change photo</Text>
          </TouchableOpacity>
        </View>

        {/* About You Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About you</Text>

          <EditableField
            label="Name"
            value={user?.name || ""}
            placeholder="Add name"
            onPress={handleEditName}
          />

          <EditableField
            label="Username"
            value={user?.pisserTag || ""}
            placeholder="Add username"
            onPress={handleEditUsername}
          />

          {/* TikTok Link */}
          <View style={styles.linkContainer}>
            <Text style={styles.linkText}>
              tiktok.com/@{user?.pisserTag || "username"}
            </Text>
            <TouchableOpacity>
              <Ionicons
                name="copy-outline"
                size={20}
                color={colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          <EditableField
            label="Pronouns"
            value=""
            placeholder="Add pronouns"
            onPress={handleEditPronouns}
          />

          <EditableField
            label="Bio"
            value=""
            placeholder="Add a bio"
            onPress={handleEditBio}
          />

          <EditableField
            label="Nonprofit"
            value=""
            placeholder="Add nonprofit to your profile"
            onPress={handleEditNonprofit}
          />

          <EditableField
            label="AI Self"
            value=""
            placeholder="My AI Self"
            onPress={handleEditAISelf}
          />
        </View>

        {/* Social Section */}
        <View style={styles.bottomSection}>
          <Text style={styles.sectionTitle}>Social</Text>
          {/* Add social links here if needed */}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 20,
    paddingBottom: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text.primary,
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
  },
  photoSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  photoContainer: {
    position: "relative",
    marginBottom: 16,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.text.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: colors.background.primary,
  },
  changePhotoButton: {
    paddingVertical: 8,
  },
  changePhotoText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: "500",
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.secondary,
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fieldContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: colors.border.light,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.text.primary,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  fieldPlaceholder: {
    color: colors.text.tertiary,
  },
  fieldLink: {
    color: colors.primary,
  },
  linkContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    marginBottom: 16,
  },
  linkText: {
    fontSize: 14,
    color: colors.text.secondary,
    flex: 1,
  },
  bottomSection: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
});
