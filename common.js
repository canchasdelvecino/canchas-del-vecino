// Utilidades compartidas por la web de clientes y el panel del administrador.
const CFG = window.APP_CONFIG || {};
const DOW = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const TZ = "America/Guayaquil";

function configured() { return !!(CFG.SUPABASE_URL && CFG.SUPABASE_ANON_KEY); }
const sb = configured() ? window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY) : null;

// Fecha y hora actuales en Ecuador, sin importar la zona del teléfono
function nowEc() {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hour12: false })
    .formatToParts(new Date()).map(x => [x.type, x.value]));
  return { date: `${p.year}-${p.month}-${p.day}`, hour: +p.hour % 24 };
}
function addDays(iso, n) { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function dayParts(iso) { const d = new Date(iso + "T12:00:00Z"); return { dow: DOW[d.getUTCDay()], d: d.getUTCDate(), m: MES[d.getUTCMonth()] }; }
function dayLabel(iso) { const p = dayParts(iso); return `${p.dow} ${p.d} ${p.m}`; }
const fmtH = h => String(h).padStart(2, "0") + ":00";
const money = v => "$" + Number(v).toFixed(Number(v) % 1 ? 2 : 0);
function esc(s) { return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function toast(msg) {
  let t = document.getElementById("toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.append(t); }
  t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => (t.hidden = true), 2600);
}
function errMsg(e) { return (e && (e.message || e.error_description)) || "Algo salió mal. Intenta de nuevo."; }
function waLink(phone, text) {
  const n = phone && phone.startsWith("09") ? "593" + phone.slice(1) : (phone || "");
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}
function setupMissing(el) {
  el.innerHTML = `<div class="card"><h2>Falta conectar la base de datos</h2><p class="muted">Completa <code>config.js</code> con la Project URL y la anon key de Supabase.</p></div>`;
}

// ---------- Instalar como app ----------
if ("serviceWorker" in navigator) addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
let installPrompt = null;
addEventListener("beforeinstallprompt", e => { e.preventDefault(); installPrompt = e; document.querySelectorAll("[data-install]").forEach(b => (b.hidden = false)); });
function isStandalone() { return matchMedia("(display-mode: standalone)").matches || navigator.standalone === true; }
function isIOS() { return /iphone|ipad|ipod/i.test(navigator.userAgent); }
// Devuelve el HTML de un botón "Instalar app" (Android) o una ayuda (iPhone); nada si ya está instalada
function installHtml() {
  if (isStandalone()) return "";
  if (isIOS()) return `<p class="muted" style="margin:0;font-size:13px">📲 Para tenerla como app: toca <b>Compartir</b> y luego <b>Agregar a inicio</b>.</p>`;
  return `<button class="btn ghost block" data-install ${installPrompt ? "" : "hidden"}>📲 Instalar app en el celular</button>`;
}
document.addEventListener("click", async e => {
  const b = e.target.closest("[data-install]"); if (!b || !installPrompt) return;
  installPrompt.prompt(); const r = await installPrompt.userChoice; installPrompt = null;
  document.querySelectorAll("[data-install]").forEach(x => (x.hidden = true));
  if (r.outcome === "accepted") toast("¡App instalada! Búscala en tu pantalla de inicio.");
});
