/**
 * Clamps a meta description to a length Google will actually render.
 *
 * Descriptions are assembled from admin-editable content (vehicle taglines,
 * package blurbs, post excerpts) whose length isn't controlled at the source,
 * so several were running 190–270 characters and getting truncated mid-word
 * in search results. Cuts on a sentence boundary where one is available,
 * otherwise on a word boundary, and only appends an ellipsis when text was
 * actually removed.
 */
export function clampDescription(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const window = clean.slice(0, max);

  // Prefer ending on a complete sentence if one lands reasonably deep in.
  const lastSentence = Math.max(window.lastIndexOf(". "), window.lastIndexOf("! "), window.lastIndexOf("? "));
  if (lastSentence >= max * 0.6) return clean.slice(0, lastSentence + 1);

  const lastSpace = window.lastIndexOf(" ");
  return (lastSpace > 0 ? window.slice(0, lastSpace) : window).replace(/[,;:—-]$/, "").trim() + "…";
}

/**
 * Compact "3D/2N" form of a real duration string ("3 Days / 2 Nights") for
 * use in <title> tags, which have far less room than the page body — the
 * full, unabbreviated duration is still shown in the H1, meta description
 * and page content, this is purely a title-length concern.
 */
export function shortDuration(duration: string): string {
  const days = duration.match(/(\d+)\s*Day/i);
  const nights = duration.match(/(\d+)\s*Night/i);
  if (!days) return duration;
  return nights ? `${days[1]}D/${nights[1]}N` : `${days[1]}D`;
}
