/**
 * Widths `/api/media/[id]?w=` will resize to. Anything else is refused, so a crawler cannot make the
 * server encode a new variant per pixel.
 */
export const MEDIA_WIDTHS = [64, 160, 320, 480, 640, 960, 1280, 1600] as const;
export type MediaWidth = (typeof MEDIA_WIDTHS)[number];

export function isMediaWidth(value: number): value is MediaWidth {
  return (MEDIA_WIDTHS as readonly number[]).includes(value);
}

/** A smaller copy of an uploaded image (never enlarged, never cropped). Videos are served unchanged. */
export function mediaUrl(id: string, width?: MediaWidth) {
  return width ? `/api/media/${id}?w=${width}` : `/api/media/${id}`;
}

/** `srcset` for an uploaded image, from the listed widths. */
export function mediaSrcSet(id: string, widths: readonly MediaWidth[]) {
  return widths.map(width => `${mediaUrl(id, width)} ${width}w`).join(", ");
}
