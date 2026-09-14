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
 * So it is measured here instead, on the device doing the drawing. Two pieces
 * go into it, and they deliberately come from different places: the baseline
 * from the DOM, which lays the text out and therefore cannot be wrong about
 * it, and the ink extent from canvas, which is the only thing that can see
 * the glyph's actual bounds. An earlier version took both from canvas and
 * overshot on Safari — see baselineOffset.
 *
 * The stylesheet keeps the laptop's numbers as defaults, which is what
 * applies until this runs or if the metrics are unavailable.
 */
/**
 * How far the text baseline sits from the middle of the line box, positive
 * downwards, for a given set of font styles.
 *
 * Measured off a throwaway copy rather than the icon itself: the icon is a
 * flex container, so anything added inside it becomes a flex item and stops
 * taking part in the inline layout this needs to observe. The probe is a
 * plain block, which is the formatting context the anonymous text run inside
 * the icon is actually laid out in.
 *
 * The trick is the empty inline-block at the end. Its baseline is its bottom
 * margin edge, so at zero height its top edge lands exactly on the text
 * baseline and the browser reports the position it really used.
 */
function baselineOffset(styles: CSSStyleDeclaration): number | null {
  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;top:0;left:-9999px";
  probe.style.fontFamily = styles.fontFamily;
  probe.style.fontSize = styles.fontSize;
  probe.style.fontWeight = styles.fontWeight;
  probe.style.fontStyle = styles.fontStyle;
  probe.style.lineHeight = styles.lineHeight;
  // Any glyph does; this measures the line box, which the text cannot change.
  probe.textContent = "x";

  const anchor = document.createElement("span");
  anchor.style.cssText = "display:inline-block;width:0;height:0";
  probe.appendChild(anchor);

  document.body.appendChild(probe);
  const box = probe.getBoundingClientRect();
  const baselineFromTop = anchor.getBoundingClientRect().top - box.top;
  probe.remove();

  if (!box.height || !Number.isFinite(baselineFromTop)) return null;
  return baselineFromTop - box.height / 2;
}

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

      // Where the baseline sits inside the line box. This was read off canvas
      // too, from fontBoundingBox — which is meant to describe the element's
      // primary font, the one that sizes the line box. Chrome reports it that
      // way; Safari reports the fallback that actually drew the glyph, so the
      // correction came out too large and the icon ended up above centre. The
      // DOM knows the answer for certain, so ask it instead.
      const baseline = baselineOffset(styles);
      if (baseline === null) return;

      context.font = `${size}px ${styles.fontFamily}`;
      const metrics = context.measureText(glyph);

      // actualBoundingBox is the ink of the glyph that really got drawn,
      // measured from the alphabetic baseline. That meaning is consistent
      // across browsers, unlike the font-level metrics above.
      const inkFromBaseline =
        (metrics.actualBoundingBoxDescent - metrics.actualBoundingBoxAscent) / 2;
      if (!Number.isFinite(inkFromBaseline)) return;

      const inkFromCentre = baseline + inkFromBaseline;

      // In em, so it survives the font-size changing at a breakpoint without
      // needing to be measured again.
      el.style.setProperty("--ink-shift", `${(-inkFromCentre / size).toFixed(4)}em`);
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
