/**
 * Extracts inline [source-id] citation tokens from model prose, keeping only
 * ids that exist in `validIds`. De-duplicates, preserves first-seen order.
 * Shared by /api/analyze (per matrix-row reason) and /api/chat (whole answer).
 */
export function extractCitationIds(
  text: string,
  validIds: Set<string> | string[],
): string[] {
  const valid = validIds instanceof Set ? validIds : new Set(validIds);
  const seen = new Set<string>();
  const out: string[] = [];
  const re = /\[([^[\]]+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const id = m[1].trim();
    if (valid.has(id) && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}
