/**
 * Utility functions for stripping HTML tags and parsing prayer texts
 * into structured blocks for rich Baha'i Prayer Book rendering.
 */

export interface InlineSegment {
  text: string;
  italic: boolean;
}

export interface PrayerBlock {
  type: 'h1' | 'h2' | 'invocation' | 'dropCap' | 'instruction' | 'footnote' | 'p';
  rawContent: string;
  segments: InlineSegment[];
}

/**
 * Returns the human-readable Author/Revealer name from AuthorId.
 */
export function getAuthorName(authorId?: number | null): string {
  switch (authorId) {
    case 1:
      return "The Báb";
    case 2:
      return "Bahá’u’lláh";
    case 3:
      return "‘Abdu’l-Bahá";
    default:
      return "";
  }
}

/**
 * Calculates word count of stripped prayer text.
 */
export function getWordCount(html?: string | null): number {
  if (!html) return 0;
  const clean = stripHtml(html);
  if (!clean) return 0;
  return clean.split(/\s+/).filter(Boolean).length;
}

/**
 * Strips all HTML tags from a text string and cleans up whitespace.
 * Useful for list item previews, search items, notifications, etc.
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Parses inline HTML tags within a block, specifically handling <i>...</i>
 */
export function parseInlineSegments(content: string): InlineSegment[] {
  if (!content) return [];
  const segments: InlineSegment[] = [];
  const inlineRegex = /<i>([\s\S]*?)<\/i>|([^<]+)/g;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(content)) !== null) {
    if (match[1] !== undefined) {
      // Remove any nested HTML tags inside <i> if present
      const cleanItalicText = match[1].replace(/<[^>]+>/g, "").trim();
      if (cleanItalicText) {
        segments.push({ text: cleanItalicText, italic: true });
      }
    } else if (match[2] !== undefined) {
      const cleanNormalText = match[2].replace(/<[^>]+>/g, "");
      if (cleanNormalText) {
        segments.push({ text: cleanNormalText, italic: false });
      }
    }
  }

  if (segments.length === 0 && content.length > 0) {
    segments.push({ text: content.replace(/<[^>]+>/g, ""), italic: false });
  }

  return segments;
}

/**
 * Checks if a string is a short invocation phrase (e.g. "He is God!", "He is the Most Glorious!").
 */
export function isShortInvocation(text: string): boolean {
  const clean = text.replace(/<[^>]+>/g, "").trim();
  if (!clean) return false;
  
  // Typical short invocations in Baha'i prayers
  const invocationPatterns = [
    /^He is God/i,
    /^He is the/i,
    /^In the name of God/i,
    /^O God, my God!$/i,
    /^O Thou/i,
    /^O Lord!$/i,
    /^O Lord, my Lord!$/i,
    /^Sorrowful is He/i,
    /^He is\.$/i,
  ];

  if (clean.length <= 50) {
    if (invocationPatterns.some((pattern) => pattern.test(clean))) {
      return true;
    }
    // Also if it ends with "!" or "." and is very short without typical sentence connectors
    if (clean.length <= 30 && !clean.includes(" and ") && !clean.includes(" that ")) {
      return true;
    }
  }

  return false;
}

/**
 * Parses raw prayer HTML string into an array of structured PrayerBlocks.
 */
export function parsePrayerBlocks(html: string | null | undefined): PrayerBlock[] {
  if (!html) return [];

  const cleanHtml = html.replace(/[\r\n]+/g, " ").trim();
  const blocks: PrayerBlock[] = [];

  // Match block level elements: <p...>, <h1>..., <h2>...
  const blockRegex = /<(p|h1|h2)(?:\s+class=[\x27"]([^\x27"]+)[\x27"])?>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(cleanHtml)) !== null) {
    const tagName = match[1].toLowerCase();
    const className = match[2] || "";
    const innerContent = match[3].trim();

    const plainText = innerContent.replace(/<[^>]+>/g, "").trim();
    if (!plainText) continue;

    const segments = parseInlineSegments(innerContent);

    // Check if whole block is italic instruction or rubric note
    const isPureItalic = /^<i>[\s\S]*<\/i>$/i.test(innerContent) || 
      (innerContent.startsWith("<i>") && innerContent.endsWith("</i>"));

    // Check if block is a footnote (e.g. "1 Revealed for...", "*1 ...", or contains "↩")
    const isFootnote = /^(?:<i>)?\s*(?:\*\d+|\d+\.|\d+\))\s*/i.test(innerContent) || innerContent.includes("↩");

    let blockType: PrayerBlock['type'] = tagName as 'h1' | 'h2' | 'p';

    if (className === "dropCap") {
      if (isShortInvocation(plainText)) {
        blockType = "invocation";
      } else {
        blockType = "dropCap";
      }
    } else if (isFootnote) {
      blockType = "footnote";
    } else if (isPureItalic || plainText.startsWith("(This prayer") || plainText.startsWith("Whoever sets out")) {
      blockType = "instruction";
    }

    blocks.push({
      type: blockType,
      rawContent: innerContent,
      segments,
    });
  }

  // Fallback if no HTML block tags were found in text
  if (blocks.length === 0 && cleanHtml.length > 0) {
    const plainText = stripHtml(cleanHtml);
    if (plainText) {
      blocks.push({
        type: isShortInvocation(plainText) ? "invocation" : "p",
        rawContent: cleanHtml,
        segments: [{ text: plainText, italic: false }],
      });
    }
  }

  return blocks;
}

/**
 * Returns a clean preview of the prayer text, excluding instructions, headings, and footnotes.
 */
export function getPrayerPreview(html: string | null | undefined): string {
  if (!html) return "";
  const blocks = parsePrayerBlocks(html);

  // Filter for actual prayer text blocks (invocation, dropCap, p)
  const prayerBlocks = blocks.filter(
    (b) => b.type === "invocation" || b.type === "dropCap" || b.type === "p"
  );

  let previewText = "";
  if (prayerBlocks.length > 0) {
    previewText = prayerBlocks
      .map((b) => b.rawContent.replace(/<[^>]+>/g, "").trim())
      .filter(Boolean)
      .join(" ");
  }

  if (!previewText) {
    previewText = stripHtml(html);
  }

  return previewText.replace(/\s+/g, " ").trim();
}
