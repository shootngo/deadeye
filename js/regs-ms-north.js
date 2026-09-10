/**
 * Static North Mississippi / Holly Springs NF field reference.
 * Unofficial summary baked into the app shell — not live sync.
 * Season year and numbers sourced from MDWFP 2026–2027 seasons
 * and USFS / eRegulations National Forest pages. Do not invent rules.
 */

export const SEASON_YEAR = "2026–2027";

export const DISCLAIMER =
  "Unofficial summary for field reference only. Always verify MDWFP and USFS before hunting. Laws change.";

export const FOCUS = {
  title: "Holly Springs NF + North MS",
  lede:
    "Frank and Leo’s woods: Holly Springs National Forest and nearby North Mississippi public land. Which deer table applies depends on the county under your boots — not the forest name on the map.",
};

export const SOURCES = [
  {
    id: "mdwfp-seasons",
    label: "MDWFP seasons & bag limits",
    url: "https://www.mdwfp.com/wildlife-hunting/hunting-seasons-and-bag-limits",
  },
  {
    id: "mdwfp-wma",
    label: "MDWFP Wildlife Management Areas",
    url: "https://www.mdwfp.com/wildlife-hunting/wildlife-management-areas",
  },
  {
    id: "mdwfp-cwd",
    label: "MDWFP CWD management zones",
    url: "https://www.mdwfp.com/wildlife-hunting/chronic-wasting-disease/cwd-management-zones",
  },
  {
    id: "usfs-hunt",
    label: "USFS Mississippi hunting & shooting",
    url: "https://www.fs.usda.gov/r08/mississippi/recreation/opportunities/hunting-shooting",
  },
  {
    id: "ereg-nf",
    label: "eRegulations: hunting on National Forests",
    url: "https://www.eregulations.com/mississippi/hunting/hunting-recreation-on-national-forests",
  },
];

export const REQUIRED_SOURCE_URLS = SOURCES.map((s) => s.url);

/** Deer Management Units that cover Frank and Leo’s Holly Springs / North MS area. */
export const DMUS = {
  northCentral: {
    id: "north-central",
    name: "North Central DMU",
    counties: ["Alcorn", "Benton", "DeSoto", "Marshall", "Tate", "Tippah"],
    legalBuck: "Any hardened antler above the hairline",
  },
  hills: {
    id: "hills",
    name: "Hills DMU",
    countiesNote:
      "Rest of the state outside Delta, North Central, and Southeast units.",
    legalBuck: "10\" inside spread OR 13\" main beam",
  },
};

export const HOLLY_SPRINGS_DMU_NOTE =
  "Holly Springs National Forest spans counties. Portions in Benton, Marshall, and Tippah are North Central. Other HSNF ground (outside those six NC counties) is Hills. Check the county you are standing in before using a bag-limit or legal-buck table.";

export const BAGS = {
  antlered: {
    statewideDaily: 1,
    statewideSeason: 3,
    northCentralDaily: 1,
    northCentralSeason: 4,
    hollySpringsNorthCentralSeason: 3,
    velvetArcheryBucks: 1,
    anyAntleredOnPrivateAndHsnf: 1,
  },
  antlerless: {
    privateNorthCentralSeason: 10,
    privateStatewideSeason: 5,
    noDailyLimitUnits: ["North Central", "Hills", "Delta"],
    usfsDaily: 1,
    usfsSeason: 5,
    usfsSoutheastSeason: 3,
  },
  turkey: {
    residentDaily: 1,
    residentSeason: 3,
  },
  squirrel: {
    fallDaily: 8,
    springDaily: 4,
  },
  rabbit: {
    daily: 8,
  },
};

/**
 * 2026–2027 North Central / Hills / Delta table, focused on
 * Holly Springs NF either-sex vs legal bucks only on other open public.
 * Yalobusha carve-outs appeared on older PDFs; the current table does not
 * list them — verify MDWFP for any county carve-outs.
 */
export const DEER_SEASONS_NC_HILLS_DELTA = [
  {
    id: "velvet-archery",
    method: "Archery (velvet)",
    dates: "Sept 11–13",
    private: "1 legal buck only (special permit, reporting, CWD sampling)",
    openPublic: "Authorized state/federal lands — same velvet rules",
    hollySprings: "Authorized federal land — same velvet rules",
    note: "Only 1 legal buck this period; it counts toward the annual bag.",
  },
  {
    id: "archery",
    method: "Archery",
    dates: "Oct 1–Nov 20",
    private: "Either-sex",
    openPublic: "Either-sex",
    hollySprings: "Either-sex",
  },
  {
    id: "gun-dogs-early",
    method: "Gun with dogs",
    dates: "Nov 21–Dec 1",
    private: "Either-sex",
    openPublic: "Legal bucks only",
    hollySprings: "Either-sex",
  },
  {
    id: "primitive",
    method: "Primitive weapon",
    dates: "Dec 2–15",
    private: "Either-sex",
    openPublic: "Either-sex",
    hollySprings: "Either-sex",
  },
  {
    id: "gun-no-dogs",
    method: "Gun without dogs",
    dates: "Dec 16–23",
    private: "Either-sex",
    openPublic: "Legal bucks only",
    hollySprings: "Either-sex",
  },
  {
    id: "gun-dogs-late",
    method: "Gun with dogs",
    dates: "Dec 24–Jan 20",
    private: "Either-sex",
    openPublic: "Legal bucks only",
    hollySprings: "Either-sex",
  },
  {
    id: "archery-primitive-late",
    method: "Archery / primitive",
    dates: "Jan 21–31",
    private: "Either-sex",
    openPublic: "Legal bucks only",
    hollySprings: "Either-sex",
  },
];

export const SEASON_CARVEOUT_NOTE =
  "Check current MDWFP for any county carve-outs. Older PDFs mentioned Yalobusha exclusions; the current table does not list them.";

export const OPEN_PUBLIC_NOTE =
  "Open public land = U.S. National Forests, Corps of Engineers, and similar lands on statewide seasons without special regs. Wildlife Management Areas are not open public land.";

export const USFS_RULES = [
  {
    id: "license",
    title: "License",
    body: "Valid Mississippi hunting license. Follow MDWFP seasons, weapons, and bag limits.",
  },
  {
    id: "alcohol",
    title: "Alcohol",
    body: "No possessing or consuming alcohol while in possession of a loaded firearm or any projectile weapon that can cause death, injury, or property damage.",
  },
  {
    id: "vehicle",
    title: "Firearms in vehicles",
    body: "Uncased loaded shoulder-fired firearm in a motor vehicle on an NFS road or trail is prohibited (OHV rules differ: no loaded shoulder-fired weapon on an OHV).",
  },
  {
    id: "road-buffer",
    title: "Roads & trails",
    body: "Loaded shoulder-fired weapon within 100 feet of the centerline of a motor road or trail is prohibited.",
  },
  {
    id: "orange",
    title: "Hunter orange",
    body: "USFS: 500 sq in unbroken fluorescent orange or pink when required during hunting seasons. Forest Order: hog hunting during any firearm season needs 500 sq in solid unbroken fluorescent orange; quail and rabbit need a solid orange vest or cap.",
  },
  {
    id: "property-line",
    title: "Property lines",
    body: "Do not shoot across an NFS property line onto non-NFS land.",
  },
  {
    id: "treestand",
    title: "Tree stand / saddle",
    body: "Fall-arrest (full-body harness) required to climb, install, or hunt from a tree stand. Tree saddle: stay connected with a lineman’s belt or tether.",
  },
  {
    id: "camping",
    title: "Camping",
    body: "Typically 14 days in any 30-day period. Do not leave camp unattended more than 24 hours. HSNF is checkerboard with private land — know the map and do not trespass.",
  },
  {
    id: "wma",
    title: "WMAs on forest land",
    body: "A WMA User Permit is required for Wildlife Management Areas on National Forest land. WMAs are not open public land.",
  },
  {
    id: "bait",
    title: "Baiting",
    body: "Baiting and hunting over bait is not allowed on national forest land. Food plots only by official personnel.",
  },
];

export const USFS_ORDER_ID = "08-11-37-23-152";

export const CWD = {
  zoneName: "North MS Management Zone",
  wholeCounties: [
    "Alcorn",
    "Benton",
    "DeSoto",
    "Lafayette",
    "Marshall",
    "Panola",
    "Prentiss",
    "Tate",
    "Tippah",
    "Tishomingo",
    "Union",
  ],
  partialCounties: ["Coahoma", "Pontotoc", "Quitman", "Tunica"],
  carcass: [
    "Do not transport a carcass outside the CWD zone.",
    "You may take a harvested deer to a processor or taxidermist that is inside the zone.",
    "Only certain parts may leave the zone: cut/wrapped meat; deboned meat or bone-in quarters with no spine or head; hide with no head; finished taxidermy; antlers with no tissue; cleaned skull plate or skull (no brain/lymph tissue).",
    "A whole head may leave the zone only to a permitted CWD-collection taxidermist, with a sample number obtained first, and must be delivered within 5 days. That sample number must travel with the head.",
  ],
  feeding: "Supplemental feeding is banned in CWD zones (salt licks, mineral licks, and feeders).",
};

export const NEARBY_LANDS = {
  intro:
    "These are pointers only — not full WMA digests. Check the MDWFP WMA page, carry a WMA User Permit, and check in/out. WMAs are not open public land.",
  wmas: [
    { name: "Upper Sardis WMA", note: "On / next to Holly Springs NF country. WMA rules + User Permit." },
    { name: "Hell Creek WMA", note: "North MS. Confirm seasons and check-in on the MDWFP WMA page." },
    { name: "Tuscumbia WMA", note: "North MS. WMA User Permit / check-in required." },
    { name: "Chickasaw WMA", note: "Tombigbee NF area — farther, still North MS. Not Holly Springs." },
  ],
  pocketNote:
    "Butler Lake and private leases stay in the Documents pocket — they are not in this regs list.",
};

export const SMALL_GAME = {
  turkey: {
    title: "Spring turkey (resident)",
    body: "Resident bag: 1 adult gobbler (or gobbler with 6\"+ beard) per day, 3 per spring season. Youth 15 and under may take 1 gobbler of choice per day, 3 per season. Non-resident limits are tighter — verify MDWFP.",
  },
  squirrel: {
    title: "Squirrel",
    body: "Fall: 8 per day (Oct 1–Feb 28). Spring season is 4 per day — not the fall bag.",
  },
  rabbit: {
    title: "Rabbit",
    body: "8 per day (Oct 17–Feb 28). On National Forest, wear a solid orange vest or cap.",
  },
};

export const SECTIONS = [
  { id: "dmu", title: "Deer units", blurb: "North Central vs Hills — which table where you stand" },
  { id: "bags", title: "Bag limits", blurb: "Bucks, does, and the Holly Springs 3-buck catch" },
  { id: "seasons", title: "HSNF seasons", blurb: "Either-sex vs legal bucks only, 2026–2027" },
  { id: "usfs", title: "USFS woods rules", blurb: "Forest Order highlights that matter on the ground" },
  { id: "cwd", title: "CWD North MS", blurb: "Zone counties, carcass move, no feeders" },
  { id: "lands", title: "Nearby public land", blurb: "WMA pointers — not open public land" },
  { id: "small", title: "Turkey & small game", blurb: "Short resident turkey, squirrel, rabbit notes" },
];

export function isNorthCentralCounty(name) {
  const key = String(name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
  return DMUS.northCentral.counties.some((c) => c.toLowerCase().replace(/\s+/g, "") === key);
}

export function hollySpringsBuckSeasonBag(dmuId) {
  if (dmuId === DMUS.northCentral.id) return BAGS.antlered.hollySpringsNorthCentralSeason;
  return BAGS.antlered.statewideSeason;
}

export function privateBuckSeasonBag(dmuId) {
  if (dmuId === DMUS.northCentral.id) return BAGS.antlered.northCentralSeason;
  return BAGS.antlered.statewideSeason;
}

export function getSeasonRow(id) {
  return DEER_SEASONS_NC_HILLS_DELTA.find((row) => row.id === id) || null;
}

export function sourceById(id) {
  return SOURCES.find((s) => s.id === id) || null;
}
