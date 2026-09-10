import {
  OPTICS,
  getOptic,
  suggestedDots,
  formatDotLine,
  snapshotDots,
  opticList,
} from "./hints.js";
import * as db from "./db.js";
import {
  SEASON_YEAR,
  DISCLAIMER,
  FOCUS,
  SOURCES,
  DMUS,
  HOLLY_SPRINGS_DMU_NOTE,
  BAGS,
  DEER_SEASONS_NC_HILLS_DELTA,
  SEASON_CARVEOUT_NOTE,
  OPEN_PUBLIC_NOTE,
  USFS_RULES,
  USFS_ORDER_ID,
  CWD,
  NEARBY_LANDS,
  SMALL_GAME,
  SECTIONS,
} from "./regs-ms-north.js";

const viewEl = document.getElementById("view");
const headerTitle = document.getElementById("header-title");
const headerSub = document.getElementById("header-sub");
const btnBack = document.getElementById("btn-back");
const btnMenu = document.getElementById("btn-menu");
const menu = document.getElementById("menu");
const splash = document.getElementById("splash");
const installBar = document.getElementById("install-bar");

const objectUrls = new Set();
let profileDraft = null;
let sessionDraft = null;
let docDraft = null;
let installEvent = null;
let errorMsg = "";

function esc(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function rememberUrl(url) {
  objectUrls.add(url);
  return url;
}

function revokeUrls() {
  for (const u of objectUrls) URL.revokeObjectURL(u);
  objectUrls.clear();
}

function todayISO() {
  const d = new Date();
  const z = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

function formatDate(iso) {
  if (!iso) return "";
  const [y, m, d] = String(iso).split("-");
  if (!y || !m || !d) return iso;
  try {
    return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function parseRoute() {
  const raw = (location.hash || "#/").replace(/^#\/?/, "");
  const parts = raw.split("/").filter(Boolean);
  const name = parts[0] || "home";
  return { name, parts, id: parts[1] || "", extra: parts[2] || "" };
}

function go(hash) {
  location.hash = hash.startsWith("#") ? hash : `#/${hash}`;
}

function setHeader(title, sub, showBack) {
  headerTitle.textContent = title;
  headerSub.textContent = sub;
  btnBack.classList.toggle("hidden", !showBack);
}

function setTab(which) {
  for (const id of ["tab-home", "tab-sessions", "tab-docs", "tab-regs"]) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("active", id === `tab-${which}`);
  }
}

function reticleSvg() {
  return `<svg class="reticle" viewBox="0 0 42 42" aria-hidden="true">
    <rect width="42" height="42" rx="10" fill="#111"/>
    <circle cx="21" cy="18" r="10" fill="none" stroke="#ff6600" stroke-width="1.6"/>
    <circle cx="21" cy="18" r="4" fill="none" stroke="#ff6600" stroke-width="1.2"/>
    <path d="M21 6v24 M11 18h20" stroke="#ff6600" stroke-width="1.2"/>
    <circle cx="21" cy="24" r="1.3" fill="#ff6600"/>
    <circle cx="21" cy="28" r="1.3" fill="#ff6600"/>
    <circle cx="21" cy="32" r="1.3" fill="#ff6600"/>
  </svg>`;
}

function zerosHtml(dots) {
  if (!dots?.length) return `<p class="lede">No zeros recorded.</p>`;
  return `<div class="zeros">${dots
    .map(
      (d) => `<div class="zero-pill"><div class="n">${esc(d.yards || "—")} yd</div><div class="l">${esc(d.label || "Dot")}</div></div>`,
    )
    .join("")}</div>`;
}

function errHtml() {
  return errorMsg ? `<p class="error">${esc(errorMsg)}</p>` : "";
}

/* ---------- views ---------- */

function renderHome() {
  setHeader("Deadeye", "Sight-in / scope zero", false);
  setTab("home");
  const profiles = db.listProfiles();
  const sessions = db.listSessions().slice(0, 3);
  const list =
    profiles.length === 0
      ? `<div class="empty">No scope profiles yet. Add a crossbow, rifle, or red dot so sessions can lock to those zeros.</div>`
      : `<div class="card-list">${profiles.map(profileCard).join("")}</div>`;
  const recent =
    sessions.length === 0
      ? ""
      : `<h3 class="section-label">Recent sessions <a href="#/sessions">All</a></h3>
         <div class="card-list">${sessions.map(sessionCard).join("")}</div>`;

  viewEl.innerHTML = `
    <img class="hero-mark" src="splash.jpg" alt="">
    <p class="lede">Log zeros for crossbows, rifles, and red dots. Data stays on this phone.</p>
    <button type="button" class="primary" data-go="#/session/new">New range session</button>
    <h3 class="section-label">Scope profiles <button type="button" class="linkish" data-go="#/profile/new">New</button></h3>
    ${list}
    ${recent}
  `;
}

function profileCard(p) {
  const optic = getOptic(p.opticType);
  return `<a class="card" href="#/profile/${esc(p.id)}">
    <div class="card-row">
      ${reticleSvg()}
      <div class="grow">
        <div class="name">${esc(p.name)}</div>
        <div class="meta">${esc(optic.label)}</div>
        <div class="dots-line">${esc(formatDotLine(p.dots))}</div>
      </div>
    </div>
  </a>`;
}

function sessionCard(s) {
  const profile = s.profileId ? db.getProfile(s.profileId) : null;
  const name = profile?.name || s.profileName || "Profile removed";
  return `<a class="card" href="#/session/${esc(s.id)}">
    <div class="name">${esc(formatDate(s.date))}</div>
    <div class="meta">${esc(name)}${s.load ? " · " + esc(s.load) : ""}</div>
    <div class="dots-line">${esc(formatDotLine(s.dotsSnapshot))}</div>
  </a>`;
}

function renderProfileListNew() {
  startProfileDraft(null);
  renderProfileForm();
}

function startProfileDraft(existing) {
  if (existing) {
    profileDraft = {
      id: existing.id,
      name: existing.name || "",
      opticType: existing.opticType || "crossbow",
      weaponNotes: existing.weaponNotes || "",
      dots: (existing.dots || []).map((d) => ({
        label: d.label || "",
        yards: d.yards,
        fromHint: false,
      })),
      createdAt: existing.createdAt,
    };
  } else {
    profileDraft = {
      id: db.uid(),
      name: "",
      opticType: "crossbow",
      weaponNotes: "",
      dots: suggestedDots("crossbow"),
      createdAt: Date.now(),
    };
  }
}

function renderProfileForm() {
  const d = profileDraft;
  const optic = getOptic(d.opticType);
  const isNew = !db.getProfile(d.id);
  setHeader(isNew ? "New profile" : "Edit profile", optic.short, true);
  setTab("home");

  const types = opticList()
    .map(
      (o) => `<button type="button" class="type-card ${o.id === d.opticType ? "active" : ""}" data-optic="${o.id}">
        <div class="t">${esc(o.label)}</div>
        <div class="d">${o.poaMode === "single" ? "One point of aim" : "Dots + yardages on the post"}</div>
      </button>`,
    )
    .join("");

  const alts = (optic.alts || [])
    .map((a) => `<button type="button" class="chip" data-apply-alt="${esc(a.id)}">${esc(a.name)}</button>`)
    .join("");

  const dotRows =
    d.opticType === "reddot"
      ? dotRowHtml(d.dots[0] || { label: "POA / zero", yards: 50, fromHint: true }, 0, false)
      : d.dots.map((dot, i) => dotRowHtml(dot, i, true)).join("");

  viewEl.innerHTML = `
    <p class="kicker">${isNew ? "Scope profile" : "Editing"}</p>
    <h2 class="page-title">${isNew ? "Set up an optic" : esc(d.name || "Untitled")}</h2>
    ${errHtml()}
    <form id="profile-form">
      <div class="inputs">
        <div class="field full">
          <label for="p-name">Profile name</label>
          <input id="p-name" name="name" required maxlength="80" placeholder="TenPoint / .308 hunting / turkey red dot" value="${esc(d.name)}">
        </div>
        <div class="field full">
          <label>Optic type</label>
          <div class="type-grid">${types}</div>
        </div>
        <div class="field full">
          <label for="p-notes">Weapon notes</label>
          <textarea id="p-notes" name="weaponNotes" maxlength="400" placeholder="Bolt weight, rifle + load, red-dot mount height…">${esc(d.weaponNotes)}</textarea>
        </div>
      </div>

      <div class="hint-box">
        <p class="kicker">${esc(optic.hintKicker)}</p>
        <h3>${esc(optic.hintTitle)}</h3>
        <p>${esc(optic.hintBody)}</p>
        <div class="chip-row">
          <button type="button" class="chip" data-apply-main>Apply suggested ladder</button>
          ${alts}
        </div>
      </div>

      <h3 class="section-label">${d.opticType === "reddot" ? "Zero distance" : "Dots &amp; yardages"}</h3>
      <div id="dot-rows">${dotRows}</div>
      ${
        d.opticType === "reddot"
          ? ""
          : `<button type="button" class="ghost" data-add-dot>Add a dot</button>`
      }
      <button type="submit" class="primary">Save profile</button>
    </form>
  `;
}

function dotRowHtml(dot, i, canRemove) {
  const flag = dot.fromHint ? `<div class="hint-flag">Suggested</div>` : `<div class="hint-flag" style="visibility:hidden">·</div>`;
  return `<div class="dot-row" data-dot-i="${i}">
    <div class="field">
      ${flag}
      <label>Label</label>
      <input data-dot-field="label" value="${esc(dot.label || "")}" maxlength="32">
    </div>
    <div class="field">
      <label>Yards</label>
      <input data-dot-field="yards" type="number" inputmode="numeric" min="0" max="2000" step="1" value="${esc(dot.yards ?? "")}">
    </div>
    ${canRemove ? `<button type="button" class="icon-btn" data-remove-dot="${i}" aria-label="Remove dot">✕</button>` : `<span></span>`}
  </div>`;
}

async function renderProfileDetail(id) {
  const p = db.getProfile(id);
  if (!p) {
    viewEl.innerHTML = `<div class="empty">That profile is gone.</div>`;
    setHeader("Profile", "", true);
    return;
  }
  const optic = getOptic(p.opticType);
  setHeader(p.name, optic.label, true);
  setTab("home");
  const linked = db.listSessions().filter((s) => s.profileId === id);
  viewEl.innerHTML = `
    <p class="kicker">${esc(optic.label)}</p>
    <h2 class="page-title">${esc(p.name)}</h2>
    ${p.weaponNotes ? `<p class="lede">${esc(p.weaponNotes)}</p>` : ""}
    <h3 class="section-label">Zeros / dots</h3>
    ${zerosHtml(p.dots)}
    <div class="actions">
      <button type="button" class="primary" data-go="#/session/new?profile=${esc(p.id)}">New range session</button>
      <button type="button" class="primary secondary" data-go="#/profile/${esc(p.id)}/edit">Edit profile</button>
      <button type="button" class="danger" data-delete-profile="${esc(p.id)}">Delete profile</button>
    </div>
    <h3 class="section-label">Sessions with this optic</h3>
    ${
      linked.length
        ? `<div class="card-list">${linked.map(sessionCard).join("")}</div>`
        : `<div class="empty">No range sessions linked yet.</div>`
    }
  `;
}

function renderSessions() {
  setHeader("Range sessions", "Sight-in log", false);
  setTab("sessions");
  const sessions = db.listSessions();
  viewEl.innerHTML = `
    <button type="button" class="primary" data-go="#/session/new">New range session</button>
    <h3 class="section-label">All sessions</h3>
    ${
      sessions.length
        ? `<div class="card-list">${sessions.map(sessionCard).join("")}</div>`
        : `<div class="empty">No sessions yet. Log date, bolt or load, notes, and an optional target photo.</div>`
    }
  `;
}

function queryParam(name) {
  const q = location.hash.split("?")[1] || "";
  return new URLSearchParams(q).get(name);
}

function startSessionDraft(existing) {
  const preselect = queryParam("profile") || db.lastProfileId();
  if (existing) {
    sessionDraft = {
      id: existing.id,
      date: existing.date,
      profileId: existing.profileId || "",
      load: existing.load || "",
      notes: existing.notes || "",
      photoId: existing.photoId || null,
      photoFile: null,
      photoPreviewUrl: null,
      removePhoto: false,
      createdAt: existing.createdAt,
    };
  } else {
    sessionDraft = {
      id: db.uid(),
      date: todayISO(),
      profileId: preselect && db.getProfile(preselect) ? preselect : "",
      load: "",
      notes: "",
      photoId: null,
      photoFile: null,
      photoPreviewUrl: null,
      removePhoto: false,
      createdAt: Date.now(),
    };
  }
}

async function renderSessionForm() {
  const d = sessionDraft;
  const isNew = !db.getSession(d.id);
  setHeader(isNew ? "New session" : "Edit session", "Range log", true);
  setTab("sessions");
  const profiles = db.listProfiles();
  const profile = d.profileId ? db.getProfile(d.profileId) : null;
  const options = profiles
    .map((p) => `<option value="${esc(p.id)}" ${p.id === d.profileId ? "selected" : ""}>${esc(p.name)}</option>`)
    .join("");

  let photoInner = `<div>No target photo yet.</div>`;
  if (d.photoPreviewUrl) {
    photoInner = `<img src="${esc(d.photoPreviewUrl)}" alt="Target preview">`;
  } else if (d.photoId && !d.removePhoto) {
    const blob = await db.getBlob(d.photoId);
    if (blob) {
      const url = rememberUrl(URL.createObjectURL(blob));
      photoInner = `<img src="${esc(url)}" alt="Saved target">`;
    }
  }

  viewEl.innerHTML = `
    <p class="kicker">Range session</p>
    <h2 class="page-title">${isNew ? "Log a sight-in" : formatDate(d.date)}</h2>
    ${errHtml()}
    ${
      profiles.length === 0
        ? `<div class="warn-banner">Add a <a href="#/profile/new">scope profile</a> first so this session can lock to zeros/dots.</div>`
        : ""
    }
    <form id="session-form">
      <div class="inputs">
        <div class="field">
          <label for="s-date">Date</label>
          <input id="s-date" name="date" type="date" required value="${esc(d.date)}">
        </div>
        <div class="field">
          <label for="s-load">Bolt or load</label>
          <input id="s-load" name="load" maxlength="80" placeholder="400-gr bolt / 165 gr" value="${esc(d.load)}">
        </div>
        <div class="field full">
          <label for="s-profile">Scope profile</label>
          <select id="s-profile" name="profileId" ${profiles.length ? "required" : "disabled"}>
            <option value="">Select a profile</option>
            ${options}
          </select>
        </div>
      </div>
      ${profile ? `<h3 class="section-label">Zeros / dots used today</h3>${zerosHtml(profile.dots)}` : ""}
      <div class="inputs">
        <div class="field full">
          <label for="s-notes">Notes</label>
          <textarea id="s-notes" name="notes" maxlength="800" placeholder="Wind, groups, clicks, what you’d change next time">${esc(d.notes)}</textarea>
        </div>
        <div class="field full">
          <label>Target photo</label>
          <div class="photo-slot" id="photo-slot">${photoInner}</div>
          <div class="file-btns">
            <button type="button" class="ghost" data-pick-photo="camera">Camera</button>
            <button type="button" class="ghost" data-pick-photo="file">File</button>
          </div>
          <input id="photo-camera" class="hidden" type="file" accept="image/*" capture="environment">
          <input id="photo-file" class="hidden" type="file" accept="image/*">
          ${d.photoId || d.photoFile ? `<button type="button" class="ghost" data-clear-photo>Remove photo</button>` : ""}
        </div>
      </div>
      <button type="submit" class="primary" ${profiles.length ? "" : "disabled"}>Save session</button>
    </form>
  `;
}

async function renderSessionDetail(id) {
  const s = db.getSession(id);
  if (!s) {
    viewEl.innerHTML = `<div class="empty">That session is gone.</div>`;
    setHeader("Session", "", true);
    return;
  }
  const profile = s.profileId ? db.getProfile(s.profileId) : null;
  setHeader(formatDate(s.date), profile?.name || s.profileName || "Session", true);
  setTab("sessions");
  let photo = "";
  if (s.photoId) {
    const blob = await db.getBlob(s.photoId);
    if (blob) {
      const url = rememberUrl(URL.createObjectURL(blob));
      photo = `<h3 class="section-label">Target photo</h3><img class="detail-photo" src="${esc(url)}" alt="Target" data-lightbox="${esc(url)}">`;
    }
  }
  viewEl.innerHTML = `
    <p class="kicker">${esc(formatDate(s.date))}</p>
    <h2 class="page-title">${esc(profile?.name || s.profileName || "Range session")}</h2>
    ${s.load ? `<p class="lede">Bolt / load: ${esc(s.load)}</p>` : ""}
    ${s.notes ? `<p class="lede">${esc(s.notes)}</p>` : ""}
    <h3 class="section-label">Zeros / dots used that day</h3>
    ${zerosHtml(s.dotsSnapshot)}
    ${photo}
    <div class="actions">
      <button type="button" class="primary secondary" data-go="#/session/${esc(s.id)}/edit">Edit session</button>
      <button type="button" class="danger" data-delete-session="${esc(s.id)}">Delete session</button>
    </div>
  `;
}

function renderDocs() {
  setHeader("Documents pocket", "License & land permits", false);
  setTab("docs");
  const docs = db.listDocuments();
  const licenses = docs.filter((d) => d.kind === "license");
  const permits = docs.filter((d) => d.kind === "permit");
  viewEl.innerHTML = `
    <div class="warn-banner">
      <strong>Hunting license and land permits only.</strong>
      Store things like a state hunting license or a Butler Lake permit. Do not put a driver’s license, passport, or other wallet IDs in Deadeye.
    </div>
    <button type="button" class="primary" data-go="#/docs/new">Add document</button>
    <h3 class="section-label">Hunting license</h3>
    ${docList(licenses, "No hunting license stored.")}
    <h3 class="section-label">Land permits</h3>
    ${docList(permits, "No land permits yet. Example: Butler Lake.")}
  `;
}

function docList(items, empty) {
  if (!items.length) return `<div class="empty">${esc(empty)}</div>`;
  return `<div class="card-list">${items
    .map(
      (d) => `<a class="card" href="#/docs/${esc(d.id)}">
        <div class="name">${esc(d.title)}</div>
        <div class="meta">${d.mimeType?.includes("pdf") ? "PDF" : "Photo"} · ${esc(formatDate(d.date) || "")}</div>
      </a>`,
    )
    .join("")}</div>`;
}

function startDocDraft(existing) {
  if (existing) {
    docDraft = {
      id: existing.id,
      kind: existing.kind || "permit",
      title: existing.title || "",
      date: existing.date || "",
      notes: existing.notes || "",
      fileId: existing.fileId || null,
      mimeType: existing.mimeType || "",
      file: null,
      previewUrl: null,
      createdAt: existing.createdAt,
    };
  } else {
    docDraft = {
      id: db.uid(),
      kind: "permit",
      title: "",
      date: todayISO(),
      notes: "",
      fileId: null,
      mimeType: "",
      file: null,
      previewUrl: null,
      createdAt: Date.now(),
    };
  }
}

async function renderDocForm() {
  const d = docDraft;
  const isNew = !db.getDocument(d.id);
  setHeader(isNew ? "Add document" : "Edit document", "Pocket", true);
  setTab("docs");
  let preview = `<div>Photo or PDF — stored only on this device.</div>`;
  if (d.previewUrl) {
    preview = d.mimeType.includes("pdf")
      ? `<iframe src="${esc(d.previewUrl)}" title="PDF preview"></iframe>`
      : `<img src="${esc(d.previewUrl)}" alt="Preview">`;
  } else if (d.fileId) {
    const blob = await db.getBlob(d.fileId);
    if (blob) {
      const url = rememberUrl(URL.createObjectURL(blob));
      preview = (d.mimeType || blob.type || "").includes("pdf")
        ? `<iframe src="${esc(url)}" title="PDF"></iframe>`
        : `<img src="${esc(url)}" alt="Document">`;
    }
  }
  viewEl.innerHTML = `
    <div class="warn-banner">Hunting license or land permit only — not a driver’s license or other ID.</div>
    ${errHtml()}
    <form id="doc-form">
      <div class="inputs">
        <div class="field full">
          <label>Type</label>
          <div class="chip-row">
            <button type="button" class="chip ${d.kind === "license" ? "active" : ""}" data-doc-kind="license">Hunting license</button>
            <button type="button" class="chip ${d.kind === "permit" ? "active" : ""}" data-doc-kind="permit">Land permit</button>
          </div>
        </div>
        <div class="field full">
          <label for="d-title">Title</label>
          <input id="d-title" name="title" required maxlength="80" placeholder="${d.kind === "license" ? "FL hunting license" : "Butler Lake"}" value="${esc(d.title)}">
        </div>
        <div class="field full">
          <label for="d-date">Date on document (optional)</label>
          <input id="d-date" name="date" type="date" value="${esc(d.date)}">
        </div>
        <div class="field full">
          <label for="d-notes">Notes</label>
          <textarea id="d-notes" name="notes" maxlength="400" placeholder="Season, zone, vehicle, gate code reminder…">${esc(d.notes)}</textarea>
        </div>
        <div class="field full">
          <label>Capture</label>
          <div class="photo-slot">${preview}</div>
          <div class="file-btns">
            <button type="button" class="ghost" data-pick-doc="camera">Camera</button>
            <button type="button" class="ghost" data-pick-doc="file">Photo / PDF</button>
          </div>
          <input id="doc-camera" class="hidden" type="file" accept="image/*" capture="environment">
          <input id="doc-file" class="hidden" type="file" accept="image/*,application/pdf">
        </div>
      </div>
      <button type="submit" class="primary">Save in pocket</button>
    </form>
  `;
}

async function renderDocDetail(id) {
  const d = db.getDocument(id);
  if (!d) {
    viewEl.innerHTML = `<div class="empty">That document is gone.</div>`;
    setHeader("Document", "", true);
    return;
  }
  setHeader(d.title, d.kind === "license" ? "Hunting license" : "Land permit", true);
  setTab("docs");
  let media = `<div class="empty">No file attached.</div>`;
  if (d.fileId) {
    const blob = await db.getBlob(d.fileId);
    if (blob) {
      const url = rememberUrl(URL.createObjectURL(blob));
      media = (d.mimeType || blob.type || "").includes("pdf")
        ? `<iframe class="detail-photo" style="height:360px;width:100%" src="${esc(url)}" title="${esc(d.title)}"></iframe>`
        : `<img class="detail-photo" src="${esc(url)}" alt="${esc(d.title)}" data-lightbox="${esc(url)}">`;
    }
  }
  viewEl.innerHTML = `
    <p class="kicker">${d.kind === "license" ? "Hunting license" : "Land permit"}</p>
    <h2 class="page-title">${esc(d.title)}</h2>
    ${d.date ? `<p class="lede">${esc(formatDate(d.date))}</p>` : ""}
    ${d.notes ? `<p class="lede">${esc(d.notes)}</p>` : ""}
    ${media}
    <div class="actions">
      <button type="button" class="primary secondary" data-go="#/docs/${esc(d.id)}/edit">Edit</button>
      <button type="button" class="danger" data-delete-doc="${esc(d.id)}">Delete from this phone</button>
    </div>
  `;
}

function seasonBanner(compact) {
  return `<div class="season-banner${compact ? " compact" : ""}">
    <p class="kicker">Season year</p>
    <p class="year">${esc(SEASON_YEAR)}</p>
    ${compact ? "" : `<p class="where">${esc(FOCUS.title)}</p>`}
  </div>`;
}

function regsDisclaimer() {
  return `<div class="warn-banner"><strong>Field reference only.</strong> ${esc(DISCLAIMER)}</div>`;
}

function sourceLinks() {
  return `<div class="source-list">${SOURCES.map(
    (s) =>
      `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)}<span>Opens in browser · verify here</span></a>`,
  ).join("")}</div>`;
}

function renderRegsHub() {
  setHeader("Local regs", "North Mississippi · on-device", false);
  setTab("regs");
  const { antlered, antlerless } = BAGS;
  viewEl.innerHTML = `
    ${seasonBanner(false)}
    ${regsDisclaimer()}
    <p class="lede">${esc(FOCUS.lede)}</p>
    <div class="regs-glance">
      <div class="regs-stat">
        <div class="n">${antlered.northCentralSeason} / ${antlered.hollySpringsNorthCentralSeason}</div>
        <div class="l">NC bucks: ${antlered.northCentralSeason} private/open public · ${antlered.hollySpringsNorthCentralSeason} on HSNF in North Central</div>
      </div>
      <div class="regs-stat">
        <div class="n">${antlerless.usfsDaily} / ${antlerless.usfsSeason}</div>
        <div class="l">HSNF antlerless: ${antlerless.usfsDaily}/day, max ${antlerless.usfsSeason}/season</div>
      </div>
      <div class="regs-stat wide">
        <div class="n">CWD zone</div>
        <div class="l">No carcass out of the North MS zone. Supplemental feeding banned.</div>
      </div>
    </div>
    <h3 class="section-label">Reference cards</h3>
    <div class="card-list">${SECTIONS.map(
      (s) => `<a class="card" href="#/regs/${esc(s.id)}">
        <div class="name">${esc(s.title)}</div>
        <div class="meta">${esc(s.blurb)}</div>
      </a>`,
    ).join("")}</div>
    <h3 class="section-label">Verify (browser)</h3>
    <p class="lede">All text above is stored in the app. These links are only to confirm current MDWFP and USFS rules.</p>
    ${sourceLinks()}
  `;
}

function landCells(row) {
  return `<div class="land-grid">
    <div class="land-cell"><div class="who">Private</div><div class="what">${esc(row.private)}</div></div>
    <div class="land-cell"><div class="who">Open public</div><div class="what">${esc(row.openPublic)}</div></div>
    <div class="land-cell hsnf"><div class="who">Holly Springs NF</div><div class="what">${esc(row.hollySprings)}</div></div>
  </div>`;
}

function renderRegsSection(id) {
  setTab("regs");
  const section = SECTIONS.find((s) => s.id === id);
  if (!section) {
    renderRegsHub();
    return;
  }
  setHeader(section.title, `${SEASON_YEAR} · North MS`, true);
  let body = "";
  if (id === "dmu") body = regsDmuHtml();
  else if (id === "bags") body = regsBagsHtml();
  else if (id === "seasons") body = regsSeasonsHtml();
  else if (id === "usfs") body = regsUsfsHtml();
  else if (id === "cwd") body = regsCwdHtml();
  else if (id === "lands") body = regsLandsHtml();
  else if (id === "small") body = regsSmallHtml();

  viewEl.innerHTML = `
    ${seasonBanner(true)}
    ${regsDisclaimer()}
    <p class="kicker">${esc(FOCUS.title)}</p>
    <h2 class="page-title">${esc(section.title)}</h2>
    ${body}
    <h3 class="section-label">Verify (browser)</h3>
    ${sourceLinks()}
    <div class="actions">
      <button type="button" class="primary secondary" data-go="#/regs">All local regs</button>
    </div>
  `;
}

function regsDmuHtml() {
  const nc = DMUS.northCentral;
  const hills = DMUS.hills;
  return `
    <p class="lede">${esc(HOLLY_SPRINGS_DMU_NOTE)}</p>
    <div class="card rule-card">
      <div class="badges"><span class="badge">${esc(nc.name)}</span></div>
      <h3>Legal buck</h3>
      <p>${esc(nc.legalBuck)}</p>
      <div class="county-wrap">${nc.counties.map((c) => `<span class="badge quiet">${esc(c)}</span>`).join("")}</div>
    </div>
    <div class="card rule-card stack-gap">
      <div class="badges"><span class="badge">${esc(hills.name)}</span></div>
      <h3>Legal buck</h3>
      <p>${esc(hills.legalBuck)}</p>
      <p style="margin-top:8px">${esc(hills.countiesNote)}</p>
    </div>
    <div class="hint-box">
      <p class="kicker">Where you stand</p>
      <h3>HSNF is not one DMU</h3>
      <p>Benton / Marshall / Tippah forest = North Central table (any hardened antler). Other Holly Springs acres outside those NC counties = Hills table (10″ spread or 13″ beam).</p>
    </div>
  `;
}

function regsBagsHtml() {
  const a = BAGS.antlered;
  const n = BAGS.antlerless;
  return `
    <h3 class="section-label">Antlered bucks</h3>
    <div class="regs-glance">
      <div class="regs-stat"><div class="n">${a.statewideDaily} / ${a.statewideSeason}</div><div class="l">Statewide default: ${a.statewideDaily}/day, ${a.statewideSeason}/season</div></div>
      <div class="regs-stat"><div class="n">${a.northCentralSeason}</div><div class="l">North Central private / open public: ${a.northCentralDaily}/day, ${a.northCentralSeason}/season, no antler restrictions</div></div>
      <div class="regs-stat wide"><div class="n">HSNF in NC = ${a.hollySpringsNorthCentralSeason}</div><div class="l">Holly Springs NF inside North Central DMU: ${a.northCentralDaily}/day, ${a.hollySpringsNorthCentralSeason}/season — not ${a.northCentralSeason}</div></div>
    </div>
    <div class="card rule-card">
      <h3>Statewide “any antlered” exception</h3>
      <p>Outside the NC no-restriction rule: ${a.statewideDaily}/day, ${a.statewideSeason}/season. One of those ${a.statewideSeason} may be any antlered buck on private land and on Holly Springs NF. Hills (and other unit) antler criteria still apply to the other two.</p>
    </div>
    <div class="card rule-card stack-gap">
      <h3>Velvet archery</h3>
      <p>Only ${a.velvetArcheryBucks} legal buck during the September velvet period. It counts toward the annual bag.</p>
    </div>
    <h3 class="section-label">Antlerless</h3>
    <div class="regs-glance">
      <div class="regs-stat"><div class="n">${n.privateNorthCentralSeason}</div><div class="l">Private North Central: ${n.privateNorthCentralSeason}/season. No daily limit in ${n.noDailyLimitUnits.join(", ")}</div></div>
      <div class="regs-stat"><div class="n">${n.privateStatewideSeason}</div><div class="l">Private statewide default (Hills / Delta): ${n.privateStatewideSeason}/season</div></div>
      <div class="regs-stat wide"><div class="n">USFS ${n.usfsDaily}/day · ${n.usfsSeason}/yr</div><div class="l">National Forests including Holly Springs: ${n.usfsDaily}/day, max ${n.usfsSeason}/season (Southeast unit is ${n.usfsSoutheastSeason} — not Frank and Leo’s focus)</div></div>
    </div>
  `;
}

function regsSeasonsHtml() {
  const rows = DEER_SEASONS_NC_HILLS_DELTA.filter((r) => r.id !== "velvet-archery")
    .map(
      (r) => `<div class="card season-card">
        <div class="badges"><span class="badge">${esc(r.dates)}</span></div>
        <div class="name">${esc(r.method)}</div>
        ${landCells(r)}
      </div>`,
    )
    .join("");
  const velvet = DEER_SEASONS_NC_HILLS_DELTA.find((r) => r.id === "velvet-archery");
  return `
    <p class="lede">${esc(OPEN_PUBLIC_NOTE)}</p>
    <div class="hint-box">
      <p class="kicker">Read the HSNF column</p>
      <h3>Holly Springs is often either-sex when other open public is bucks only</h3>
      <p>Gun-with-dogs, gun-without-dogs, and late archery/primitive: either-sex on private and HSNF; legal bucks only on other open public.</p>
    </div>
    <h3 class="section-label">2026–2027 · NC / Hills / Delta</h3>
    <div class="card-list">${rows}</div>
    ${
      velvet
        ? `<h3 class="section-label">Velvet archery</h3>
           <div class="card season-card">
             <div class="badges"><span class="badge">${esc(velvet.dates)}</span></div>
             <div class="name">${esc(velvet.method)}</div>
             <p class="meta">${esc(velvet.note || "")}</p>
             ${landCells(velvet)}
           </div>`
        : ""
    }
    <p class="lede">${esc(SEASON_CARVEOUT_NOTE)}</p>
  `;
}

function regsUsfsHtml() {
  return `
    <p class="lede">Forest Order ${esc(USFS_ORDER_ID)} highlights for National Forests in Mississippi, including Holly Springs. Same rules on the eRegulations NF hunting page.</p>
    <div class="rule-list">${USFS_RULES.map(
      (r) => `<div class="card rule-card"><h3>${esc(r.title)}</h3><p>${esc(r.body)}</p></div>`,
    ).join("")}</div>
  `;
}

function regsCwdHtml() {
  return `
    <p class="lede">${esc(CWD.zoneName)} covers Frank and Leo’s North MS counties. Carcass and feed rules are statewide for this zone — not HSNF-only.</p>
    <h3 class="section-label">Whole counties</h3>
    <div class="county-wrap">${CWD.wholeCounties.map((c) => `<span class="badge">${esc(c)}</span>`).join("")}</div>
    <h3 class="section-label">Defined portions only</h3>
    <div class="county-wrap">${CWD.partialCounties.map((c) => `<span class="badge quiet">${esc(c)}</span>`).join("")}</div>
    <p class="lede">Coahoma, Pontotoc, Quitman, and Tunica are only in-zone where MDWFP draws the highway lines. Open the CWD page to confirm a spot on the edge.</p>
    <h3 class="section-label">Carcasses</h3>
    <div class="rule-list">${CWD.carcass.map((line) => `<div class="card rule-card"><p>${esc(line)}</p></div>`).join("")}</div>
    <div class="hint-box">
      <p class="kicker">Feeders</p>
      <h3>Supplemental feeding banned</h3>
      <p>${esc(CWD.feeding)}</p>
    </div>
  `;
}

function regsLandsHtml() {
  return `
    <p class="lede">${esc(NEARBY_LANDS.intro)}</p>
    <div class="card-list">${NEARBY_LANDS.wmas
      .map(
        (w) => `<div class="card">
          <div class="name">${esc(w.name)}</div>
          <div class="meta">${esc(w.note)}</div>
          <div class="badges"><span class="badge hint">WMA User Permit / check-in</span></div>
        </div>`,
      )
      .join("")}</div>
    <div class="warn-banner stack-gap">${esc(NEARBY_LANDS.pocketNote)}</div>
  `;
}

function regsSmallHtml() {
  return `
    <div class="rule-list">
      <div class="card rule-card">
        <div class="badges"><span class="badge">${BAGS.turkey.residentSeason} / season</span></div>
        <h3>${esc(SMALL_GAME.turkey.title)}</h3>
        <p>${esc(SMALL_GAME.turkey.body)}</p>
      </div>
      <div class="card rule-card">
        <div class="badges"><span class="badge">${BAGS.squirrel.fallDaily} / day fall</span></div>
        <h3>${esc(SMALL_GAME.squirrel.title)}</h3>
        <p>${esc(SMALL_GAME.squirrel.body)}</p>
      </div>
      <div class="card rule-card">
        <div class="badges"><span class="badge">${BAGS.rabbit.daily} / day</span></div>
        <h3>${esc(SMALL_GAME.rabbit.title)}</h3>
        <p>${esc(SMALL_GAME.rabbit.body)}</p>
      </div>
    </div>
  `;
}

function renderAbout() {
  setHeader("About", "On-device only", true);
  setTab("home");
  viewEl.innerHTML = `
    <img class="hero-mark" src="splash.jpg" alt="">
    <p class="kicker">Deadeye</p>
    <h2 class="page-title">Sight-in logger</h2>
    <div class="prose">
      <p><strong>Deadeye</strong> is a phone-first hunting sight-in / scope-zero logger for Frank Mulkey and Leo Mulkey. Crossbows, rifles, and red dots. Multi-scope profiles, range sessions with an optional target photo, a documents pocket for a hunting license and land permits, and a static <strong>Local regs</strong> card for Holly Springs NF / North Mississippi.</p>
      <h2>Data stays on this device</h2>
      <p>Profiles and notes live in this browser’s storage. Photos and PDFs live in IndexedDB on the phone. There is no account, no cloud sync, no share sheet, and no public link. Local regs are baked into the app shell — not live sync.</p>
      <h2>Documents pocket</h2>
      <p>Hunting license and land permits only (for example Butler Lake). Do not store a driver’s license or other wallet IDs.</p>
      <h2>Local regs</h2>
      <p>Unofficial ${esc(SEASON_YEAR)} field summary for Holly Springs National Forest and nearby North MS public land. Always verify MDWFP and USFS. No sharing features.</p>
      <h2>Traditional yardage hints</h2>
      <p>When you create a profile, Deadeye offers conventional ladders (crossbow 20–60, rifle BDC 100–500, red-dot 50-yard POA). They are labeled <em>suggested</em>. You can change every number.</p>
      <h2>Install</h2>
      <p>On Android Chrome: menu → <strong>Install app</strong> / Add to Home screen. Works offline after the first visit. Live path after Pages is on: <code>https://shootngo.github.io/deadeye/</code></p>
      <h2>Phase 1 — not in this build</h2>
      <ul>
        <li>Cloud sync / accounts</li>
        <li>Sharing or social export</li>
        <li>Ballistics solver</li>
        <li>Alexa / voice</li>
      </ul>
    </div>
  `;
}

/* ---------- routing ---------- */

async function render() {
  errorMsg = "";
  menu.classList.add("hidden");
  revokeUrls();
  const route = parseRoute();
  const name = route.name.split("?")[0];
  const id = (route.id || "").split("?")[0];
  const extra = (route.extra || "").split("?")[0];

  try {
    if (name === "home" || name === "") {
      profileDraft = sessionDraft = docDraft = null;
      renderHome();
    } else if (name === "profile" && id === "new") {
      if (!profileDraft || db.getProfile(profileDraft.id)) startProfileDraft(null);
      renderProfileForm();
    } else if (name === "profile" && id && extra === "edit") {
      const p = db.getProfile(id);
      if (!p) return renderHome();
      if (!profileDraft || profileDraft.id !== id) startProfileDraft(p);
      renderProfileForm();
    } else if (name === "profile" && id) {
      profileDraft = null;
      await renderProfileDetail(id);
    } else if (name === "sessions") {
      sessionDraft = null;
      renderSessions();
    } else if (name === "session" && id === "new") {
      const want = queryParam("profile");
      if (!sessionDraft || db.getSession(sessionDraft.id)) startSessionDraft(null);
      else if (want && db.getProfile(want)) sessionDraft.profileId = want;
      await renderSessionForm();
    } else if (name === "session" && id && extra === "edit") {
      const s = db.getSession(id);
      if (!s) return renderSessions();
      if (!sessionDraft || sessionDraft.id !== id) startSessionDraft(s);
      await renderSessionForm();
    } else if (name === "session" && id) {
      sessionDraft = null;
      await renderSessionDetail(id);
    } else if (name === "docs" && id === "new") {
      if (!docDraft || db.getDocument(docDraft.id)) startDocDraft(null);
      await renderDocForm();
    } else if (name === "docs" && id && extra === "edit") {
      const d = db.getDocument(id);
      if (!d) return renderDocs();
      if (!docDraft || docDraft.id !== id) startDocDraft(d);
      await renderDocForm();
    } else if (name === "docs" && id) {
      docDraft = null;
      await renderDocDetail(id);
    } else if (name === "docs") {
      docDraft = null;
      renderDocs();
    } else if (name === "regs" && id) {
      renderRegsSection(id);
    } else if (name === "regs") {
      renderRegsHub();
    } else if (name === "about") {
      renderAbout();
    } else {
      renderHome();
    }
  } catch (err) {
    console.error(err);
    viewEl.innerHTML = `<div class="empty">Something broke rendering this screen. Try going home.</div>`;
  }
}

function readDraftFields() {
  if (profileDraft) {
    const name = document.getElementById("p-name");
    const notes = document.getElementById("p-notes");
    if (name) profileDraft.name = name.value;
    if (notes) profileDraft.weaponNotes = notes.value;
    viewEl.querySelectorAll(".dot-row").forEach((row) => {
      const i = Number(row.dataset.dotI);
      if (!profileDraft.dots[i]) return;
      const label = row.querySelector('[data-dot-field="label"]');
      const yards = row.querySelector('[data-dot-field="yards"]');
      if (label) profileDraft.dots[i].label = label.value;
      if (yards) {
        const n = Number(yards.value);
        if (profileDraft.dots[i].yards !== n) profileDraft.dots[i].fromHint = false;
        profileDraft.dots[i].yards = yards.value === "" ? "" : n;
      }
    });
  }
  if (sessionDraft) {
    const date = document.getElementById("s-date");
    const load = document.getElementById("s-load");
    const notes = document.getElementById("s-notes");
    const profile = document.getElementById("s-profile");
    if (date) sessionDraft.date = date.value;
    if (load) sessionDraft.load = load.value;
    if (notes) sessionDraft.notes = notes.value;
    if (profile) sessionDraft.profileId = profile.value;
  }
  if (docDraft) {
    const title = document.getElementById("d-title");
    const date = document.getElementById("d-date");
    const notes = document.getElementById("d-notes");
    if (title) docDraft.title = title.value;
    if (date) docDraft.date = date.value;
    if (notes) docDraft.notes = notes.value;
  }
}

async function saveProfile(ev) {
  ev.preventDefault();
  readDraftFields();
  const d = profileDraft;
  if (!d.name.trim()) {
    errorMsg = "Name the profile so you can find it at the range.";
    return renderProfileForm();
  }
  const dots = (d.opticType === "reddot" ? d.dots.slice(0, 1) : d.dots)
    .map((x) => ({
      label: String(x.label || "").trim() || "Dot",
      yards: Number(x.yards) || 0,
    }))
    .filter((x) => x.yards > 0);
  if (!dots.length) {
    errorMsg = "Set at least one yardage. Suggested ladders are a starting point — you can type any number.";
    return renderProfileForm();
  }
  db.saveProfile({
    id: d.id,
    name: d.name.trim(),
    opticType: d.opticType,
    weaponNotes: d.weaponNotes.trim(),
    dots,
    createdAt: d.createdAt,
  });
  db.setLastProfileId(d.id);
  profileDraft = null;
  go(`#/profile/${d.id}`);
}

async function saveSession(ev) {
  ev.preventDefault();
  readDraftFields();
  const d = sessionDraft;
  const profile = db.getProfile(d.profileId);
  if (!profile) {
    errorMsg = "Pick a scope profile so this day is tied to zeros/dots.";
    return renderSessionForm();
  }
  if (!d.date) {
    errorMsg = "Date is required.";
    return renderSessionForm();
  }
  let photoId = d.removePhoto ? null : d.photoId;
  if (d.photoFile) {
    const blob = await db.compressImage(d.photoFile);
    photoId = photoId || db.uid();
    await db.putBlob(photoId, blob);
  } else if (d.removePhoto && d.photoId) {
    await db.deleteBlob(d.photoId);
    photoId = null;
  }
  db.saveSession({
    id: d.id,
    date: d.date,
    profileId: profile.id,
    profileName: profile.name,
    load: d.load.trim(),
    notes: d.notes.trim(),
    photoId,
    dotsSnapshot: snapshotDots(profile.dots),
    createdAt: d.createdAt,
  });
  db.setLastProfileId(profile.id);
  sessionDraft = null;
  go(`#/session/${d.id}`);
}

async function saveDoc(ev) {
  ev.preventDefault();
  readDraftFields();
  const d = docDraft;
  if (!d.title.trim()) {
    errorMsg = "Give it a title (license year, Butler Lake, …).";
    return renderDocForm();
  }
  let fileId = d.fileId;
  let mimeType = d.mimeType;
  if (d.file) {
    let blob = d.file;
    if (d.file.type.startsWith("image/")) blob = await db.compressImage(d.file);
    fileId = fileId || db.uid();
    mimeType = blob.type || d.file.type || "application/octet-stream";
    await db.putBlob(fileId, blob);
  }
  db.saveDocument({
    id: d.id,
    kind: d.kind === "license" ? "license" : "permit",
    title: d.title.trim(),
    date: d.date || "",
    notes: d.notes.trim(),
    fileId,
    mimeType,
    createdAt: d.createdAt,
  });
  docDraft = null;
  go(`#/docs/${d.id}`);
}

/* ---------- events ---------- */

document.getElementById("splash-enter").addEventListener("click", () => {
  splash.classList.add("hidden");
  sessionStorage.setItem("deadeye.entered", "1");
});

if (sessionStorage.getItem("deadeye.entered")) splash.classList.add("hidden");

btnBack.addEventListener("click", () => history.back());
btnMenu.addEventListener("click", (e) => {
  e.stopPropagation();
  menu.classList.toggle("hidden");
});
document.addEventListener("click", () => menu.classList.add("hidden"));
menu.addEventListener("click", (e) => e.stopPropagation());

viewEl.addEventListener("click", async (e) => {
  const t = e.target.closest("[data-go],[data-optic],[data-apply-main],[data-apply-alt],[data-add-dot],[data-remove-dot],[data-pick-photo],[data-clear-photo],[data-pick-doc],[data-doc-kind],[data-delete-session],[data-delete-doc],[data-delete-profile],[data-lightbox]");
  if (!t) return;

  if (t.dataset.go) {
    go(t.dataset.go);
    return;
  }
  if (t.dataset.lightbox) {
    const box = document.createElement("div");
    box.className = "lightbox";
    box.innerHTML = `<img src="${esc(t.dataset.lightbox)}" alt="">`;
    box.addEventListener("click", () => box.remove());
    document.body.appendChild(box);
    return;
  }
  if (t.dataset.optic) {
    readDraftFields();
    const next = t.dataset.optic;
    const keepCustom = profileDraft.dots.some((d) => d.fromHint === false);
    profileDraft.opticType = next;
    if (!keepCustom) profileDraft.dots = suggestedDots(next);
    else if (next === "reddot") profileDraft.dots = profileDraft.dots.slice(0, 1);
    renderProfileForm();
    return;
  }
  if (t.hasAttribute("data-apply-main")) {
    readDraftFields();
    profileDraft.dots = suggestedDots(profileDraft.opticType);
    renderProfileForm();
    return;
  }
  if (t.dataset.applyAlt) {
    readDraftFields();
    profileDraft.dots = suggestedDots(profileDraft.opticType, t.dataset.applyAlt);
    renderProfileForm();
    return;
  }
  if (t.hasAttribute("data-add-dot")) {
    readDraftFields();
    profileDraft.dots.push({ label: `${profileDraft.dots.length + 1}th`, yards: "", fromHint: false });
    renderProfileForm();
    return;
  }
  if (t.dataset.removeDot != null) {
    readDraftFields();
    const i = Number(t.dataset.removeDot);
    if (profileDraft.dots.length > 1) profileDraft.dots.splice(i, 1);
    renderProfileForm();
    return;
  }
  if (t.dataset.pickPhoto) {
    document.getElementById(t.dataset.pickPhoto === "camera" ? "photo-camera" : "photo-file")?.click();
    return;
  }
  if (t.hasAttribute("data-clear-photo")) {
    sessionDraft.photoFile = null;
    sessionDraft.photoPreviewUrl = null;
    sessionDraft.removePhoto = true;
    renderSessionForm();
    return;
  }
  if (t.dataset.pickDoc) {
    document.getElementById(t.dataset.pickDoc === "camera" ? "doc-camera" : "doc-file")?.click();
    return;
  }
  if (t.dataset.docKind) {
    readDraftFields();
    docDraft.kind = t.dataset.docKind;
    renderDocForm();
    return;
  }
  if (t.dataset.deleteSession) {
    if (confirm("Delete this range session from this phone? This cannot be undone.")) {
      await db.deleteSession(t.dataset.deleteSession);
      go("#/sessions");
    }
    return;
  }
  if (t.dataset.deleteDoc) {
    if (confirm("Delete this document from this phone? This cannot be undone.")) {
      await db.deleteDocument(t.dataset.deleteDoc);
      go("#/docs");
    }
    return;
  }
  if (t.dataset.deleteProfile) {
    if (
      confirm(
        "Delete this scope profile from this phone? Linked range sessions stay, with the zeros that were saved that day.",
      )
    ) {
      db.deleteProfile(t.dataset.deleteProfile);
      go("#/");
    }
  }
});

viewEl.addEventListener("change", async (e) => {
  if (e.target.id === "s-profile") {
    readDraftFields();
    renderSessionForm();
    return;
  }
  if (e.target.id === "photo-camera" || e.target.id === "photo-file") {
    const file = e.target.files?.[0];
    if (!file) return;
    sessionDraft.photoFile = file;
    sessionDraft.removePhoto = false;
    if (sessionDraft.photoPreviewUrl) URL.revokeObjectURL(sessionDraft.photoPreviewUrl);
    sessionDraft.photoPreviewUrl = URL.createObjectURL(file);
    renderSessionForm();
    return;
  }
  if (e.target.id === "doc-camera" || e.target.id === "doc-file") {
    const file = e.target.files?.[0];
    if (!file) return;
    docDraft.file = file;
    docDraft.mimeType = file.type;
    if (docDraft.previewUrl) URL.revokeObjectURL(docDraft.previewUrl);
    docDraft.previewUrl = URL.createObjectURL(file);
    renderDocForm();
  }
});

viewEl.addEventListener("submit", (e) => {
  if (e.target.id === "profile-form") return saveProfile(e);
  if (e.target.id === "session-form") return saveSession(e);
  if (e.target.id === "doc-form") return saveDoc(e);
});

window.addEventListener("hashchange", render);

document.getElementById("btn-install")?.addEventListener("click", async () => {
  if (!installEvent) return;
  installEvent.prompt();
  await installEvent.userChoice;
  installEvent = null;
  installBar.classList.add("hidden");
});

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  installEvent = e;
  installBar.classList.remove("hidden");
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("./sw.js").catch((err) => console.warn("SW failed", err));
}

render();
