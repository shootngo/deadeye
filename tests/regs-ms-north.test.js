import assert from "node:assert/strict";
import {
  SEASON_YEAR,
  DISCLAIMER,
  SOURCES,
  REQUIRED_SOURCE_URLS,
  DMUS,
  BAGS,
  DEER_SEASONS_NC_HILLS_DELTA,
  CWD,
  USFS_RULES,
  USFS_ORDER_ID,
  NEARBY_LANDS,
  SECTIONS,
  isNorthCentralCounty,
  hollySpringsBuckSeasonBag,
  privateBuckSeasonBag,
  getSeasonRow,
  sourceById,
} from "../js/regs-ms-north.js";

assert.equal(SEASON_YEAR, "2026–2027");
assert.ok(DISCLAIMER.toLowerCase().includes("unofficial"));
assert.ok(DISCLAIMER.toLowerCase().includes("verify"));

const urls = REQUIRED_SOURCE_URLS;
assert.ok(urls.includes("https://www.mdwfp.com/wildlife-hunting/hunting-seasons-and-bag-limits"));
assert.ok(urls.includes("https://www.mdwfp.com/wildlife-hunting/wildlife-management-areas"));
assert.ok(urls.includes("https://www.mdwfp.com/wildlife-hunting/chronic-wasting-disease/cwd-management-zones"));
assert.ok(urls.includes("https://www.fs.usda.gov/r08/mississippi/recreation/opportunities/hunting-shooting"));
assert.ok(urls.includes("https://www.eregulations.com/mississippi/hunting/hunting-recreation-on-national-forests"));
assert.equal(SOURCES.length, 5);

assert.deepEqual(DMUS.northCentral.counties, [
  "Alcorn",
  "Benton",
  "DeSoto",
  "Marshall",
  "Tate",
  "Tippah",
]);
assert.ok(isNorthCentralCounty("Marshall"));
assert.ok(isNorthCentralCounty("DeSoto"));
assert.ok(isNorthCentralCounty("desoto"));
assert.equal(isNorthCentralCounty("Lafayette"), false);

assert.equal(BAGS.antlered.statewideDaily, 1);
assert.equal(BAGS.antlered.statewideSeason, 3);
assert.equal(BAGS.antlered.northCentralDaily, 1);
assert.equal(BAGS.antlered.northCentralSeason, 4);
assert.equal(BAGS.antlered.hollySpringsNorthCentralSeason, 3);
assert.equal(BAGS.antlered.velvetArcheryBucks, 1);
assert.equal(BAGS.antlered.anyAntleredOnPrivateAndHsnf, 1);

assert.equal(privateBuckSeasonBag("north-central"), 4);
assert.equal(hollySpringsBuckSeasonBag("north-central"), 3);
assert.equal(hollySpringsBuckSeasonBag("hills"), 3);
assert.equal(privateBuckSeasonBag("hills"), 3);

assert.equal(BAGS.antlerless.privateNorthCentralSeason, 10);
assert.equal(BAGS.antlerless.privateStatewideSeason, 5);
assert.equal(BAGS.antlerless.usfsDaily, 1);
assert.equal(BAGS.antlerless.usfsSeason, 5);
assert.equal(BAGS.antlerless.usfsSoutheastSeason, 3);
assert.ok(BAGS.antlerless.noDailyLimitUnits.includes("North Central"));
assert.ok(BAGS.antlerless.noDailyLimitUnits.includes("Hills"));
assert.ok(BAGS.antlerless.noDailyLimitUnits.includes("Delta"));

assert.equal(BAGS.turkey.residentSeason, 3);
assert.equal(BAGS.squirrel.fallDaily, 8);
assert.equal(BAGS.rabbit.daily, 8);

const archery = getSeasonRow("archery");
assert.equal(archery.dates, "Oct 1–Nov 20");
assert.equal(archery.private, "Either-sex");
assert.equal(archery.openPublic, "Either-sex");
assert.equal(archery.hollySprings, "Either-sex");

const gunDogs = getSeasonRow("gun-dogs-early");
assert.equal(gunDogs.dates, "Nov 21–Dec 1");
assert.equal(gunDogs.hollySprings, "Either-sex");
assert.equal(gunDogs.openPublic, "Legal bucks only");

assert.equal(getSeasonRow("primitive").hollySprings, "Either-sex");
assert.equal(getSeasonRow("primitive").openPublic, "Either-sex");
assert.equal(getSeasonRow("gun-no-dogs").openPublic, "Legal bucks only");
assert.equal(getSeasonRow("gun-dogs-late").hollySprings, "Either-sex");
assert.equal(getSeasonRow("archery-primitive-late").openPublic, "Legal bucks only");

assert.ok(DEER_SEASONS_NC_HILLS_DELTA.every((row) => row.hollySprings && row.private && row.openPublic));

assert.ok(CWD.wholeCounties.includes("Marshall"));
assert.ok(CWD.wholeCounties.includes("Benton"));
assert.ok(CWD.partialCounties.includes("Pontotoc"));
assert.ok(CWD.feeding.toLowerCase().includes("banned"));
assert.ok(CWD.carcass.some((line) => line.toLowerCase().includes("outside")));

assert.equal(USFS_ORDER_ID, "08-11-37-23-152");
assert.ok(USFS_RULES.some((r) => r.id === "treestand" && /fall-arrest/i.test(r.body)));
assert.ok(USFS_RULES.some((r) => r.id === "alcohol"));
assert.ok(NEARBY_LANDS.wmas.some((w) => w.name === "Upper Sardis WMA"));
assert.ok(NEARBY_LANDS.pocketNote.toLowerCase().includes("butler lake"));

assert.deepEqual(
  SECTIONS.map((s) => s.id),
  ["dmu", "bags", "seasons", "usfs", "cwd", "lands", "small"],
);
assert.ok(sourceById("mdwfp-seasons").url.includes("hunting-seasons-and-bag-limits"));

console.log("regs-ms-north.test.js ok");
