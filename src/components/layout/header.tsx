import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Polygon, Circle } from "react-native-svg";
import { colors, fonts } from "../../constants/theme";
import { useFontSize } from "../../hooks/useFontSize";

type HeaderProps = {
  title?: string;
  onSettingsPress?: () => void;
};

const getStarPoints = (
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  points = 9
) => {
  return Array.from({ length: points * 2 }, (_, i) => {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    return `${cx + Math.cos(angle) * radius},${cy + Math.sin(angle) * radius}`;
  }).join(" ");
};

const BahaiStarIcon = ({
  size = 38,
  color = "#C5A059",
}: {
  size?: number;
  color?: string;
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 50 50">
      <Circle
        cx="25"
        cy="25"
        r="23"
        fill="#FFF9EF"
        stroke="#E6D5B8"
        strokeWidth="1.5"
      />
      <Circle
        cx="25"
        cy="25"
        r="18"
        fill="none"
        stroke="#C5A059"
        strokeWidth="1"
        strokeDasharray="2 3"
        opacity={0.5}
      />
      <Polygon
        points={getStarPoints(25, 25, 21, 11, 9)}
        fill={color}
        stroke="#1B2A4A"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <Circle
        cx="25"
        cy="25"
        r="6"
        fill="#FFF9EF"
        stroke="#1B2A4A"
        strokeWidth="1"
      />
      <Circle cx="25" cy="25" r="2.5" fill="#C5A059" />
    </Svg>
  );
};

export default function Header({
  title = "Prayers",
  onSettingsPress,
}: HeaderProps) {
  const insets = useSafeAreaInsets();
  const { increaseFont, decreaseFont, fontScale, resetFont, scaledSize } =
    useFontSize();
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const handleSettings = () => {
    if (onSettingsPress) {
      onSettingsPress();
    } else {
      setShowSettingsModal(true);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: Math.max(insets.top, 12) },
      ]}
    >
      <View style={styles.content}>
        
        <View style={styles.leftGroup}>
          <BahaiStarIcon size={38} color={colors.secondary} />
          <Text
            style={[styles.titleText, { fontSize: scaledSize(20) }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

     
        <View style={styles.rightGroup}>
          <TouchableOpacity
            onPress={decreaseFont}
            style={styles.fontButton}
            activeOpacity={0.7}
            accessibilityLabel="Decrease Font Size"
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text style={[styles.fontButtonText, { fontSize: scaledSize(13) }]}>
              A-
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={increaseFont}
            style={styles.fontButton}
            activeOpacity={0.7}
            accessibilityLabel="Increase Font Size"
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          >
            <Text style={[styles.fontButtonTextBold, { fontSize: scaledSize(14) }]}>
              A+
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleSettings}
            style={styles.settingsButton}
            activeOpacity={0.7}
            accessibilityLabel="Settings"
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 8 }}
          >
            <Ionicons name="settings-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

   
      <Modal
        visible={showSettingsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettingsModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSettingsModal(false)}
        >
          <Pressable
            style={styles.modalCard}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <BahaiStarIcon size={28} color={colors.secondary} />
                <Text style={styles.modalTitle}>Settings</Text>
              </View>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <Ionicons name="close" size={22} color={colors.muted} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>
                Font Scale: {Math.round(fontScale * 100)}%
              </Text>
              <View style={styles.modalFontControls}>
                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={decreaseFont}
                >
                  <Text style={styles.modalActionButtonText}>A- (Smaller)</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalActionButton, styles.modalResetButton]}
                  onPress={resetFont}
                >
                  <Text style={styles.modalResetButtonText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalActionButton}
                  onPress={increaseFont}
                >
                  <Text style={styles.modalActionButtonText}>A+ (Larger)</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderRadius:10
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 46,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  titleText: {
    fontFamily: fonts.heading,
    color: colors.primary,
    fontWeight: "700",
  },
  rightGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fontButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.neutral,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 38,
  },
  fontButtonText: {
    fontFamily: fonts.bodyMedium,
    color: colors.primary,
  },
  fontButtonTextBold: {
    fontFamily: fonts.bodyBold,
    color: colors.primary,
    fontWeight: "700",
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: 2,
  },

  /* Modal styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalTitle: {
    fontFamily: fonts.heading,
    fontSize: 18,
    color: colors.primary,
    fontWeight: "700",
  },
  modalBody: {
    gap: 12,
  },
  modalLabel: {
    fontFamily: fonts.bodyMedium,
    fontSize: 14,
    color: colors.text,
  },
  modalFontControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
  },
  modalActionButtonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: "#FFFFFF",
  },
  modalResetButton: {
    backgroundColor: colors.neutral,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalResetButtonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.text,
  },
});
