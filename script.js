"use strict";

/* ---------- Data: swap any id here to change an image ---------- */
const CATEGORIES = {
  clothing: [
    ["1441986300917-64674bd600d8", "The Rail", "A considered rack of tailored separates in soft neutrals."],
    ["1445205170230-053b83016050", "Quiet Layers", "Hanging knitwear and outerwear in a muted autumn range."],
    ["1490481651871-ab68de25d43d", "Overcoat Study", "Long lines and a relaxed shoulder for the colder months."],
    ["1469334031218-e382a71b716b", "Street Editorial", "Everyday dressing shot on location in natural light."],
    ["1515886657613-9f3515b0c78f", "Studio Portrait", "A clean silhouette against a plain backdrop."],
    ["1434389677669-e08b4cac3105", "Folded Wool", "Stacked basics, pressed and ready to wear."]
  ],
  watches: [
    ["1523275335684-37898b6baf30", "Reference One", "A minimalist dial with slim hands and a leather strap."],
    ["1524592094714-0f0654e20314", "Steel Hours", "Brushed steel case in soft studio light."],
    ["1522312346375-d1a52e2b99b3", "The Wrist", "Classic proportions worn the way they are meant to be."],
    ["1547996160-81dfa63595aa", "Chronograph", "Close-up detail of sub-dials and polished bezel."],
    ["1508685096489-7aacd43bd3b1", "Night Dial", "A dark face with luminous markers."],
    ["1542496658-e33a6d0d50f6", "Time Kept", "A quiet product still life on a neutral surface."]
  ],
  footwear: [
    ["1542291026-7eec264c27ff", "Red Runner", "A single sneaker as sculpture, one bold colour."],
    ["1549298916-b41d501d3772", "Daily Pair", "Clean leather shoes made for long walks."],
    ["1460353581641-37baddab0fa2", "Court Classic", "A low-profile sneaker with a worn-in sole."],
    ["1595950653106-6c9ebd614d3a", "White Out", "Minimal trainers photographed on a pale ground."],
    ["1543163521-1bf539c55dd2", "Evening Heel", "A sharp heel finished for the late hours."],
    ["1491553895911-0055eca6402d", "In Motion", "Performance footwear with an editorial eye."]
  ],
  bags: [
    ["1584917865442-de89df76afd3", "The Tote", "Structured leather with room for a full day."],
    ["1548036328-c9fa89d128fa", "Shoulder Line", "A compact bag with a soft, rounded body."],
    ["1590874103328-eac38a683ce7", "Hand Carry", "Polished hardware and a refined handle."],
    ["1553062407-98eeb64c6a62", "Field Pack", "A utility backpack in washed canvas."],
    ["1566150905458-1bf1fc113f0d", "Boxed Calf", "Clean edges and a single clasp."],
    ["1594223274512-ad4803739b7c", "Weekender", "Travel-ready proportions in supple leather."]
  ]
};

const img = (id, w) => `./images/${id}.jpg`;

/* Interleave categories so ALL feels mixed, then number pieces */
const ITEMS = [];
for (let i = 0; i < 6; i++) {
  for (const [cat, list] of Object.entries(CATEGORIES)) {
    const [id, title, caption] = list[i];
    ITEMS.push({ cat, id, title, caption, num: String(ITEMS.length + 1).padStart(2, "0") });
  }
}

/* ---------- Elements & state ---------- */
const $ = (s) => document.querySelector(s);
const gallery = $("#gallery"), countEl = $("#count"), lightbox = $("#lightbox");
const lb = { img: $("#lb-img"), cat: $("#lb-cat"), title: $("#lb-title"), text: $("#lb-text"), num: $("#lb-num") };
let current = "all", visible = [], lbIndex = 0, lastFocus = null, busy = false;

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
const label = (c) => c.charAt(0).toUpperCase() + c.slice(1);

/* ---------- Gallery ---------- */
function render() {
  visible = current === "all" ? ITEMS : ITEMS.filter((it) => it.cat === current);
  gallery.innerHTML = "";
  visible.forEach((it, i) => {
    const tile = document.createElement("button");
    tile.className = "tile reveal";
    if (i % 7 === 0) tile.classList.add("tall");
    else if (i % 7 === 4) tile.classList.add("wide");
    tile.style.setProperty("--i", Math.min(i, 12));
    tile.setAttribute("aria-label", `View ${it.title}, ${label(it.cat)}`);
    tile.innerHTML = `
      <img src="${img(it.id, 900)}" alt="${it.title}: ${it.caption}" loading="lazy">
      <span class="cap"><small><span>${label(it.cat)}</span><span>${it.num}</span></small><strong>${it.title}</strong></span>`;
    const image = tile.querySelector("img");
    image.addEventListener("load", () => image.classList.add("is-loaded"));
    image.addEventListener("error", () => tile.classList.add("fallback"));
    tile.addEventListener("click", () => openLightbox(i, tile));
    gallery.append(tile);
  });
  countEl.textContent = visible.length;
}

function setFilter(cat) {
  if (cat === current || busy) return;
  current = cat;
  document.querySelectorAll(".filter").forEach((b) => {
    const on = b.dataset.filter === cat;
    b.classList.toggle("is-active", on);
    b.setAttribute("aria-pressed", on);
  });
  if (reduced) return render();
  busy = true;
  gallery.classList.add("is-out");
  setTimeout(() => { render(); gallery.classList.remove("is-out"); busy = false; }, 260);
}

document.querySelectorAll(".filter").forEach((b) => b.addEventListener("click", () => setFilter(b.dataset.filter)));
$("#brand").addEventListener("click", (e) => {
  e.preventDefault();
  setFilter("all");
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
});

/* ---------- Lightbox ---------- */
function showLightbox(i) {
  lbIndex = (i + visible.length) % visible.length;
  const it = visible[lbIndex];
  lb.img.src = img(it.id, 1600);
  lb.img.alt = `${it.title}: ${it.caption}`;
  lb.cat.textContent = label(it.cat);
  lb.title.textContent = it.title;
  lb.text.textContent = it.caption;
  lb.num.textContent = `No. ${it.num} · ${lbIndex + 1} of ${visible.length}`;
}

function openLightbox(i, trigger) {
  lastFocus = trigger;
  showLightbox(i);
  lightbox.hidden = false;
  requestAnimationFrame(() => lightbox.classList.add("is-open"));
  document.body.classList.add("no-scroll");
  lightbox.querySelector(".lb-close").focus();
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  document.body.classList.remove("no-scroll");
  setTimeout(() => { lightbox.hidden = true; lb.img.src = ""; }, reduced ? 0 : 350);
  if (lastFocus) lastFocus.focus();
}

lightbox.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeLightbox));
$("#lb-prev").addEventListener("click", () => showLightbox(lbIndex - 1));
$("#lb-next").addEventListener("click", () => showLightbox(lbIndex + 1));
lb.img.addEventListener("error", () => { lb.text.textContent = "This image could not be loaded."; });

document.addEventListener("keydown", (e) => {
  if (lightbox.hidden) return;
  if (e.key === "Escape") closeLightbox();
  else if (e.key === "ArrowLeft") showLightbox(lbIndex - 1);
  else if (e.key === "ArrowRight") showLightbox(lbIndex + 1);
  else if (e.key === "Tab") { /* keep focus inside the dialog */
    const f = [...lightbox.querySelectorAll("button")];
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
});

render();
