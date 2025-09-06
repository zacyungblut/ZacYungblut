import React, { useState, useRef } from "react";
import { StyleSheet, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  LegendList,
  LegendListRef,
  LegendListRenderItemProps,
} from "@legendapp/list";

import { Text, View } from "@/components/Themed";
import TopBar from "@/components/TopBar";
import { colors } from "@/constants/Colors";

interface Alert {
  id: string;
  phone: string;
  name?: string;
  alertTypes: AlertType[];
  isActive: boolean;
  createdDate: string;
}

interface AlertType {
  type: "status_change" | "relationship_start" | "relationship_end" | "all";
  label: string;
  enabled: boolean;
}

export default function AlertsScreen() {
  const listRef = useRef<LegendListRef | null>(null);

  // Mock data for now - replace with actual alerts data from your store
  const [alerts] = useState<Alert[]>([
    // Empty for now as requested
  ]);

  const handleBackPress = () => {
    router.back();
  };

  const handleAddAlert = () => {
    router.push("/add-alert");
  };

  const toggleAlert = (alertId: string) => {
    // TODO: Implement toggle alert logic
    console.log("Toggle alert:", alertId);
  };

  const deleteAlert = (alertId: string) => {
    // TODO: Implement delete alert logic
    console.log("Delete alert:", alertId);
  };

  const getAlertTypeText = (alertTypes: AlertType[]) => {
    const enabledTypes = alertTypes.filter((type) => type.enabled);
    if (enabledTypes.length === 0) return "No alerts";
    if (enabledTypes.length === 1) return enabledTypes[0].label;
    if (enabledTypes.length === alertTypes.length) return "All changes";
    return `${enabledTypes.length} alert types`;
  };

  const renderAlertItem = ({ item }: LegendListRenderItemProps<Alert>) => (
    <View style={styles.alertItem}>
      <View style={styles.alertContent}>
        <View style={styles.alertHeader}>
          <View style={styles.alertInfo}>
            <Text style={styles.timeText}>{item.phone}</Text>
            {item.name && <Text style={styles.nameText}>{item.name}</Text>}
          </View>
          <Switch
            value={item.isActive}
            onValueChange={() => toggleAlert(item.id)}
            trackColor={{
              false: colors.background.tertiary,
              true: colors.status.success + "40", // 40% opacity
            }}
            thumbColor={
              item.isActive ? colors.status.success : colors.text.quaternary
            }
            ios_backgroundColor={colors.background.tertiary}
          />
        </View>

        <View style={styles.alertDetails}>
          <Text style={styles.alertTypeText}>
            {getAlertTypeText(item.alertTypes)}
          </Text>
          <Text style={styles.createdText}>
            Created {new Date(item.createdDate).toLocaleDateString()}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteAlert(item.id)}
        activeOpacity={0.7}>
        <Ionicons name="trash-outline" size={16} color={colors.status.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <TopBar
        title="Alerts"
        showBackButton={true}
        onBackPress={handleBackPress}
        showAddButton={true}
        onAddPress={handleAddAlert}
      />

      {/* Content area */}
      <View style={styles.contentContainer}>
        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-outline"
              size={64}
              color={colors.text.tertiary}
            />
            <Text style={styles.emptyTitle}>No Alerts</Text>
            <Text style={styles.emptySubtitle}>
              Tap + to create an alert for someone's relationship status
            </Text>
          </View>
        ) : (
          <LegendList
            data={alerts}
            renderItem={renderAlertItem}
            keyExtractor={(item) => item.id}
            recycleItems={true}
            maintainVisibleContentPosition
            ref={listRef}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },

  // Content area styles
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // List styles
  list: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
  },

  // Alert item styles (similar to iOS alarms)
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.background.primary,
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  alertInfo: {
    flex: 1,
  },
  timeText: {
    fontSize: 32,
    fontWeight: "300",
    color: colors.text.primary,
    letterSpacing: -0.5,
  },
  nameText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  alertDetails: {
    marginTop: 4,
  },
  alertTypeText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  createdText: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontStyle: "italic",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 12,
  },

  // Empty state styles
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text.primary,
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: colors.text.tertiary,
    textAlign: "center",
    lineHeight: 22,
  },
});
