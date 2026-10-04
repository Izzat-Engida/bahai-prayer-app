

export interface InlineSegment {
  text: string;
  italic: boolean;
}

export interface PrayerBlock {
  type: 'h1' | 'h2' | 'invocation' | 'dropCap' | 'instruction' | 'footnote' | 'p';
  rawContent: string;
  segments: InlineSegment[];
}


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


export function getWordCount(html?: string | null): number {
  if (!html) return 0;
  const clean = stripHtml(html);
  if (!clean) return 0;
  return clean.split(/\s+/).filter(Boolean).length;
}


export function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}


export function parseInlineSegments(content: string): InlineSegment[] {
  if (!content) return [];
  const segments: InlineSegment[] = [];
  const inlineRegex = /<i>([\s\S]*?)<\/i>|([^<]+)/g;
  let match: RegExpExecArray | null;

  while ((match = inlineRegex.exec(content)) !== null) {
    if (match[1] !== undefined) {
    
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


export function isShortInvocation(text: string): boolean {
  const clean = text.replace(/<[^>]+>/g, "").trim();
  if (!clean) return false;
  
  if (clean.length <= 150) {
    if (/^(?:O\b|ALAS\b|He is\b|In the name of\b|Sorrowful is\b)/i.test(clean)) {
      return true;
    }
    if (clean.length <= 40 && !clean.includes(" and ") && !clean.includes(" that ")) {
      return true;
    }
  }

  return false;
}


export function parsePrayerBlocks(html: string | null | undefined): PrayerBlock[] {
  if (!html) return [];

  const cleanHtml = html.replace(/[\r\n]+/g, " ").trim();
  const blocks: PrayerBlock[] = [];

 
  const blockRegex = /<(p|h1|h2)(?:\s+class=[\x27"]([^\x27"]+)[\x27"])?>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(cleanHtml)) !== null) {
    const tagName = match[1].toLowerCase();
    const className = match[2] || "";
    const innerContent = match[3].trim();

    const plainText = innerContent.replace(/<[^>]+>/g, "").trim();
    if (!plainText) continue;

    const segments = parseInlineSegments(innerContent);

    const isPureItalic = /^<i>[\s\S]*<\/i>$/i.test(innerContent) || 
      (innerContent.startsWith("<i>") && innerContent.endsWith("</i>"));

  
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


export function getPrayerPreview(html: string | null | undefined): string {
  if (!html) return "";
  const blocks = parsePrayerBlocks(html);

 
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


export function getSpeechText(html: string | null | undefined): string {
  if (!html) return "";
  const blocks = parsePrayerBlocks(html);

  const spokenBlocks = blocks.filter(
    (b) => b.type === "invocation" || b.type === "dropCap" || b.type === "p"
  );

  if (spokenBlocks.length > 0) {
    return spokenBlocks
      .map((b) => b.rawContent.replace(/<[^>]+>/g, "").trim())
      .filter(Boolean)
      .join(". ");
  }

  return stripHtml(html);
}
