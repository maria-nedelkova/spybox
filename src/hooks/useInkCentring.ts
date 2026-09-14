import { useEffect, useRef } from "react";

/**
 * Centres a glyph on its ink rather than on its line box.
 *
 * Flexbox centres the line box it is given, and where a glyph's ink sits
 * inside that box is decided by the font — for the menu's arrows it sits
 * below the middle, so they ride low in cells that are themselves centred.
 *
 * The correction is a fixed fraction of the font size, so it could be a
 * constant in the stylesheet, and it was. The trouble is that the constant is
 * only true for the font that drew the glyph, and none of these glyphs exist
 * in Press Start 2P — every one of them falls through to whatever the
 * platform offers. macOS and iOS answer that question differently, so a
 * number measured on the laptop left the icon visibly low on a phone.
 *
 * So it is measured here instead, on the device doing the drawing. The
 * stylesheet keeps the laptop's numbers as defaults, which is what applies
 * until this runs or if the metrics are unavailable.
 */
export function useInkCentring<T extends HTMLElement>(glyph: string) {
  const ref = useRef<T>(null);

  useEffect(() => {
    let cancelled = false;

    const measure = () => {
      const el = ref.current;
      if (cancelled || !el) return;

      const styles = getComputedStyle(el);
      const size = parseFloat(styles.fontSize);
      const context = document.createElement("canvas").getContext("2d");
      if (!context || !size) return;

      context.font = `${size}px ${styles.fontFamily}`;
      const metrics = context.measureText(glyph);

      // fontBoundingBox describes the primary font, which is also what sizes
      // the line box in the DOM; actualBoundingBox describes the glyph that
      // really got drawn, fallback and all. Wanting the gap between those two
      // is the whole point, so they must come from the same measurement.
      const lineCentre = (metrics.fontBoundingBoxDescent - metrics.fontBoundingBoxAscent) / 2;
      const inkCentre = (metrics.actualBoundingBoxDescent - metrics.actualBoundingBoxAscent) / 2;
      if (!Number.isFinite(lineCentre) || !Number.isFinite(inkCentre)) return;

      // In em, so it survives the font-size changing at a breakpoint without
      // needing to be measured again.
      el.style.setProperty("--ink-shift", `${(-(inkCentre - lineCentre) / size).toFixed(4)}em`);
    };

    // Before the webfont lands the element is measured against a fallback,
    // whose metrics set the line box this is correcting against.
    if (document.fonts) document.fonts.ready.then(measure);
    else measure();

    return () => {
      cancelled = true;
    };
  }, [glyph]);

  return ref;
}
