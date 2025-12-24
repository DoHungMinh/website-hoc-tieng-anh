interface SubtitleBlock {
  index: number;
  startTime: number;
  endTime: number;
  originalText: string;
  displayText: string;
  hasBlank: boolean;
  answer?: string;
}

/**
 * Parse SRT timestamp to seconds
 * Format: HH:MM:SS,mmm
 */
function parseTimestamp(timestamp: string): number {
  const [time, ms] = timestamp.split(',');
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds + Number(ms) / 1000;
}

/**
 * Parse SRT file content to SubtitleBlock array
 */
export function parseSRT(srtContent: string): SubtitleBlock[] {
  const blocks: SubtitleBlock[] = [];
  const lines = srtContent.trim().split('\n');
  
  let i = 0;
  while (i < lines.length) {
    // Skip empty lines
    if (!lines[i].trim()) {
      i++;
      continue;
    }

    // Read index
    const index = parseInt(lines[i].trim());
    if (isNaN(index)) {
      i++;
      continue;
    }
    i++;

    // Read timing
    const timingMatch = lines[i]?.match(/(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/);
    if (!timingMatch) {
      i++;
      continue;
    }
    const startTime = parseTimestamp(timingMatch[1]);
    const endTime = parseTimestamp(timingMatch[2]);
    i++;

    // Read text lines until empty line or end
    const textLines: string[] = [];
    while (i < lines.length && lines[i].trim()) {
      textLines.push(lines[i]);
      i++;
    }
    const fullText = textLines.join(' ');

    // Check if has blank [[answer]]
    const blankMatch = fullText.match(/\[\[(.+?)\]\]/);
    const hasBlank = !!blankMatch;
    const answer = blankMatch ? blankMatch[1].trim() : undefined;

    // Create display text (replace [[answer]] with _____)
    const displayText = fullText.replace(/\[\[.+?\]\]/g, '_____');
    const originalText = fullText.replace(/\[\[(.+?)\]\]/g, '$1');

    blocks.push({
      index: blocks.length,
      startTime,
      endTime,
      originalText,
      displayText,
      hasBlank,
      answer
    });
  }

  return blocks;
}

/**
 * Extract YouTube video ID from URL
 */
export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}
