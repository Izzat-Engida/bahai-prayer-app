import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { parsePrayerBlocks, PrayerBlock, InlineSegment } from "../../utils/textUtils";
import { colors, fonts } from "../../constants/theme";
import { useFontSize } from "../../hooks/useFontSize";

interface PrayerTextRendererProps {
  html: string;
  zoomScale?: number;
}

export default function PrayerTextRenderer({
  html,
  zoomScale = 1,
}: PrayerTextRendererProps) {
  const { scaledSize } = useFontSize();
  const blocks = useMemo(() => parsePrayerBlocks(html), [html]);

  const baseFontSize = scaledSize(18) * zoomScale;
  const baseLineHeight = scaledSize(30) * zoomScale;

  const renderInlineSegments = (segments: InlineSegment[], baseStyle: any) => {
    return segments.map((segment, index) => {
      if (segment.italic) {
        return (
          <Text
            key={index}
            selectable={true}
            style={[baseStyle, styles.italicText]}
          >
            {segment.text}
          </Text>
        );
      }
      return (
        <Text key={index} selectable={true} style={baseStyle}>
          {segment.text}
        </Text>
      );
    });
  };

  const renderBlock = (block: PrayerBlock, index: number) => {
    switch (block.type) {
      case "invocation": {
        const text = block.segments.map((s) => s.text).join("");
        return (
          <View key={index} style={styles.invocationContainer}>
            <View style={styles.invocationDecorationRow}>
              <View style={styles.goldDot} />
              <View style={styles.goldLine} />
              <View style={styles.goldDot} />
            </View>
            <Text
              selectable={true}
              style={[
                styles.invocationText,
                {
                  fontSize: scaledSize(21) * zoomScale,
                  lineHeight: scaledSize(32) * zoomScale,
                },
              ]}
            >
              {text}
            </Text>
            <View style={styles.invocationDecorationRow}>
              <View style={styles.goldLine} />
            </View>
          </View>
        );
      }

      case "h1":
      case "h2": {
        const text = block.segments.map((s) => s.text).join("");
        return (
          <View key={index} style={styles.headingContainer}>
            <Text
              selectable={true}
              style={[
                styles.headingText,
                {
                  fontSize: scaledSize(22) * zoomScale,
                  lineHeight: scaledSize(32) * zoomScale,
                },
              ]}
            >
              {text}
            </Text>
            <View style={styles.headingUnderline} />
          </View>
        );
      }

      case "instruction": {
        const text = block.segments.map((s) => s.text).join("");
        return (
          <View key={index} style={styles.instructionContainer}>
            <Text
              selectable={true}
              style={[
                styles.instructionText,
                {
                  fontSize: scaledSize(14) * zoomScale,
                  lineHeight: scaledSize(22) * zoomScale,
                },
              ]}
            >
              {text}
            </Text>
          </View>
        );
      }

      case "dropCap": {
        const fullText = block.segments.map((s) => s.text).join("");
        const firstChar = fullText.charAt(0);
        const restOfText = fullText.slice(1);

        return (
          <View key={index} style={styles.paragraphContainer}>
            <Text
              selectable={true}
              style={[
                styles.bodyText,
                { fontSize: baseFontSize, lineHeight: baseLineHeight },
              ]}
            >
              <Text
                selectable={true}
                style={[
                  styles.dropCapLetter,
                  {
                    fontSize: scaledSize(36) * zoomScale,
                    lineHeight: scaledSize(36) * zoomScale,
                  },
                ]}
              >
                {firstChar}
              </Text>
              {restOfText}
            </Text>
          </View>
        );
      }

      case "footnote": {
        return (
          <View key={index} style={styles.footnoteContainer}>
            <Text
              selectable={true}
              style={styles.footnoteContent}
            >
              {renderInlineSegments(block.segments, [
                styles.footnoteText,
                {
                  fontSize: scaledSize(13) * zoomScale,
                  lineHeight: scaledSize(20) * zoomScale,
                },
              ])}
            </Text>
          </View>
        );
      }

      case "p":
      default: {
        return (
          <View key={index} style={styles.paragraphContainer}>
            <Text
              selectable={true}
              style={[
                styles.bodyText,
                { fontSize: baseFontSize, lineHeight: baseLineHeight },
              ]}
            >
              {renderInlineSegments(block.segments, [
                styles.bodyText,
                { fontSize: baseFontSize, lineHeight: baseLineHeight },
              ])}
            </Text>
          </View>
        );
      }
    }
  };

  return <View style={styles.container}>{blocks.map(renderBlock)}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },

  
  invocationContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 18,
    paddingHorizontal: 12,
  },
  invocationDecorationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginVertical: 6,
  },
  goldDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.secondary,
  },
  goldLine: {
    width: 40,
    height: 1,
    backgroundColor: colors.secondary,
    opacity: 0.6,
  },
  invocationText: {
    fontFamily: fonts.heading,
    color: colors.primary,
    textAlign: "center",
    fontWeight: "600",
    letterSpacing: 0.3,
  },

  
  headingContainer: {
    alignItems: "center",
    marginTop: 22,
    marginBottom: 14,
  },
  headingText: {
    fontFamily: fonts.heading,
    color: colors.primary,
    textAlign: "center",
    fontWeight: "700",
  },
  headingUnderline: {
    width: 50,
    height: 1.5,
    backgroundColor: colors.secondary,
    marginTop: 8,
    borderRadius: 1,
  },

  
  instructionContainer: {
    marginVertical: 10,
    paddingHorizontal: 2,
  },
  instructionText: {
    fontFamily: fonts.heading,
    fontStyle: "italic",
    color: colors.muted,
  },

  // Paragraph & DropCap Styling
  paragraphContainer: {
    marginBottom: 18,
  },
  bodyText: {
    fontFamily: fonts.heading,
    color: colors.text,
    textAlign: "left",
  },
  italicText: {
    fontFamily: fonts.heading,
    fontStyle: "italic",
    color: colors.text,
  },
  dropCapLetter: {
    fontFamily: fonts.heading,
    color: colors.secondary,
    fontWeight: "700",
  },


  footnoteContainer: {
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footnoteContent: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  footnoteText: {
    fontFamily: fonts.body,
    fontStyle: "italic",
    color: colors.muted,
  },
});
