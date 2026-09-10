/** Traditional yardage ladders — suggestions only, never forced. */

export const OPTICS = {
  crossbow: {
    id: "crossbow",
    label: "Crossbow multi-dot",
    short: "Crossbow",
    poaMode: "multi",
    hintKicker: "Traditional suggestion",
    hintTitle: "20-yard primary, 10-yard steps",
    hintBody:
      "Most multi-dot crossbow scopes are sighted on a 20-yard top/primary dot, then 30 / 40 / 50 / 60 down the vertical post. Match the sticker on your optic if it differs — these are starting yardages, not a ballistic solver.",
    dots: [
      { label: "Top / primary", yards: 20 },
      { label: "2nd dot", yards: 30 },
      { label: "3rd dot", yards: 40 },
      { label: "4th dot", yards: 50 },
      { label: "5th dot", yards: 60 },
    ],
    alts: [
      {
        id: "xb-4",
        name: "4-dot 20–50",
        dots: [
          { label: "Top / primary", yards: 20 },
          { label: "2nd dot", yards: 30 },
          { label: "3rd dot", yards: 40 },
          { label: "4th dot", yards: 50 },
        ],
      },
    ],
  },
  rifle: {
    id: "rifle",
    label: "Rifle scope with dots",
    short: "Rifle",
    poaMode: "multi",
    hintKicker: "Traditional suggestion",
    hintTitle: "100-yard zero, BDC-style dots",
    hintBody:
      "A common hunting BDC layout is a 100-yard primary zero with holdover dots at 200 / 300 / 400 / 500. Caliber, turret, and load decide the real drops — treat this as a traditional starting ladder you can edit.",
    dots: [
      { label: "Primary / 1st", yards: 100 },
      { label: "2nd", yards: 200 },
      { label: "3rd", yards: 300 },
      { label: "4th", yards: 400 },
      { label: "5th", yards: 500 },
    ],
    alts: [
      {
        id: "rf-4",
        name: "4-dot 100–400",
        dots: [
          { label: "Primary / 1st", yards: 100 },
          { label: "2nd", yards: 200 },
          { label: "3rd", yards: 300 },
          { label: "4th", yards: 400 },
        ],
      },
      {
        id: "rf-200",
        name: "200-yd hunting zero",
        dots: [{ label: "Primary zero", yards: 200 }],
      },
    ],
  },
  reddot: {
    id: "reddot",
    label: "Red dot",
    short: "Red dot",
    poaMode: "single",
    hintKicker: "Traditional suggestion",
    hintTitle: "Single POA — 50-yard zero",
    hintBody:
      "A red dot is one point of aim. 50 yards is a common all-around carbine/shotgun zero; 25 yards is a close-woods option; 100 yards is typical on a rifle. Pick one distance and override if your zero is different.",
    dots: [{ label: "POA / zero", yards: 50 }],
    alts: [
      { id: "rd-25", name: "25-yard zero", dots: [{ label: "POA / zero", yards: 25 }] },
      { id: "rd-100", name: "100-yard zero", dots: [{ label: "POA / zero", yards: 100 }] },
    ],
  },
};

export function opticList() {
  return Object.values(OPTICS);
}

export function getOptic(type) {
  return OPTICS[type] || OPTICS.crossbow;
}

export function cloneDots(dots) {
  return (dots || []).map((d) => ({
    label: d.label || "",
    yards: Number(d.yards) || 0,
    fromHint: d.fromHint !== false,
  }));
}

export function suggestedDots(type, altId) {
  const optic = getOptic(type);
  const src = altId ? optic.alts.find((a) => a.id === altId)?.dots || optic.dots : optic.dots;
  return cloneDots(src.map((d) => ({ ...d, fromHint: true })));
}

export function formatDotLine(dots) {
  if (!dots || !dots.length) return "No zeros set";
  return dots
    .map((d) => {
      const y = Number(d.yards);
      return Number.isFinite(y) && y > 0 ? `${y}` : "—";
    })
    .join(" · ") + " yd";
}

export function snapshotDots(dots) {
  return (dots || []).map((d) => ({
    label: String(d.label || "").trim() || "Dot",
    yards: Number(d.yards) || 0,
  }));
}

export function dotsEqualSuggestion(dots, type) {
  const sug = getOptic(type).dots;
  if (!dots || dots.length !== sug.length) return false;
  return dots.every((d, i) => Number(d.yards) === Number(sug[i].yards));
}
