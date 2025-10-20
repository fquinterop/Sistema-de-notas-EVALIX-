/*
 * Evalix — Integración con MockAPI (API de calificaciones)
 * --------------------------------------------------------
 * Este archivo implementa la lógica necesaria para que tu panel
 * funcione contra MockAPI (https://mockapi.io) sin tocar tu HTML.
 *
 * Qué incluye:
 *  - Esquema sugerido: colección "sheets"
 *  - CRUD con fetch (GET/POST/PUT/DELETE)
 *  - apiGetGrades(anio, periodo) y apiSaveGrades(anio, periodo, payload)
 *  - Manejo básico de errores y reintentos
 *
 * PASOS EN MOCKAPI (una sola vez)
 * 1) Crea un proyecto → obtienes un BASE URL tipo: https://<SUBDOMINIO>.mockapi.io/api/v1
 * 2) Crea un recurso (collection) llamado: sheets
 * 3) Campos sugeridos en "sheets":
 *    - id      (string)   // lo genera MockAPI
 *    - anio    (number)
 *    - periodo (number)
 *    - nextId  (number)
 *    - autoId  (boolean)
 *    - rows    (array)    // alumnos y notas
 *
 *    Ejemplo de rows[i]:
 *    {
 *      idEst: "1001",
 *      documento: "123456",
 *      nombre: "Ana Pérez",
 *      asignatura: "Matemáticas",
 *      n1: 4.5, n2: 3.9, n3: 0, n4: 0,
 *      prom: 4.20
 *    }
 */

// =========================
// CONFIG
// =========================
// ⬅️ Reemplaza por el BASE URL que te da MockAPI (¡sin barra final!)
const MOCKAPI_BASE = "https://68f555696b852b1d6f13e4d9.mockapi.io/Sheets";

// Nombre del recurso (collection) en MockAPI
const RESOURCE = "sheets"; // quedará: <BASE>/sheets

// Headers extra (si más adelante agregas auth por algún proxy)
function getAuthHeaders() {
  try {
    const u = JSON.parse(localStorage.getItem("evalix_user") || "{}");
    if (u && u.token) return { Authorization: `Bearer ${u.token}` };
  } catch {}
  return {};
}

// =========================
const isOk = (res) => res && res.ok;

async function http(method, url, body) {
  const init = {
    method,
    headers: {
      "Accept": "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...getAuthHeaders(),
    },
    credentials: "omit", // MockAPI no requiere cookies
    body: body ? JSON.stringify(body) : undefined,
  };

  // Backoff simple (hasta 2 reintentos)
  let lastErr;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, init);
      if (isOk(res)) return res.json();
      lastErr = new Error(`${method} ${url} → ${res.status}`);
      if (res.status >= 500) {
        await new Promise((r) => setTimeout(r, 400 * (i + 1)));
      } else {
        break; // 4xx: no reintentes
      }
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastErr || new Error(`${method} ${url} fallo`);
}

function buildUrl(path, params = null) {
  const u = new URL(`${MOCKAPI_BASE}/${path.replace(/^\//, "")}`);
  if (params) Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  return u.toString();
}

// =========================
// MODELO DE DATOS (por defecto)
// =========================
function makeEmptySheet(anio = 2025, periodo = 1) {
  return {
    anio: Number(anio) || 2025,
    periodo: Number(periodo) || 1,
    nextId: 1001,
    autoId: true,
    rows: [],
  };
}

// =========================
/** CRUD de sheets en MockAPI */
async function sheets_list({ anio, periodo } = {}) {
  // Filtros por query string (MockAPI los soporta como strings)
  const url = buildUrl(RESOURCE, {
    ...(anio ? { anio } : {}),
    ...(periodo ? { periodo } : {}),
  });
  return http("GET", url);
}

async function sheets_getById(id) {
  const url = buildUrl(`${RESOURCE}/${encodeURIComponent(id)}`);
  return http("GET", url);
}

async function sheets_create(doc) {
  const url = buildUrl(RESOURCE);
  return http("POST", url, doc);
}

async function sheets_update(id, doc) {
  const url = buildUrl(`${RESOURCE}/${encodeURIComponent(id)}`);
  return http("PUT", url, doc);
}

async function sheets_delete(id) {
  const url = buildUrl(`${RESOURCE}/${encodeURIComponent(id)}`);
  return http("DELETE", url);
}

// =========================
// API COMPATIBLE CON TU HTML
// =========================
/**
 * GET que devuelve UNA "sheet" por (anio, periodo).
 * Si no existe en MockAPI, la crea vacía y la retorna.
 */
async function apiGetGrades(anio, periodo) {
  // 1) intentar buscar por filtros (anio, periodo)
  const found = await sheets_list({ anio, periodo });
  if (Array.isArray(found) && found.length > 0) {
    const sheet = found[0];
    // Normalizar tipos
    sheet.anio = Number(sheet.anio);
    sheet.periodo = Number(sheet.periodo);
    sheet.nextId = Number(sheet.nextId || 1001);
    sheet.autoId = Boolean(sheet.autoId);
    sheet.rows = Array.isArray(sheet.rows) ? sheet.rows : [];
    return sheet;
  }
  // 2) si no existe, crearla
  const created = await sheets_create(makeEmptySheet(anio, periodo));
  created.anio = Number(created.anio);
  created.periodo = Number(created.periodo);
  created.nextId = Number(created.nextId || 1001);
  created.autoId = Boolean(created.autoId);
  created.rows = Array.isArray(created.rows) ? created.rows : [];
  return created;
}

/**
 * PUT que "upsertea": si existe (anio, periodo) → actualiza; si no → crea.
 */
async function apiSaveGrades(anio, periodo, payload) {
  const doc = {
    anio: Number(anio),
    periodo: Number(periodo),
    nextId: Number(payload?.nextId ?? 1001),
    autoId: Boolean(payload?.autoId ?? true),
    rows: Array.isArray(payload?.rows) ? payload.rows : [],
  };

  const found = await sheets_list({ anio, periodo });
  if (Array.isArray(found) && found.length > 0) {
    const current = found[0];
    const updated = await sheets_update(current.id, doc);
    return updated;
  }
  const created = await sheets_create(doc);
  return created;
}

// =========================
// UTILIDADES OPCIONALES
// =========================
async function listAllSheets() {
  return sheets_list();
}
async function deleteSheetById(id) {
  return sheets_delete(id);
}

// =========================
// EXPORTS (UMD light)
// =========================
const EvalixAPI = {
  apiGetGrades,
  apiSaveGrades,
  listAllSheets,
  deleteSheetById,
  _raw: { sheets_list, sheets_getById, sheets_create, sheets_update, sheets_delete },
};

// Node/CommonJS
if (typeof module !== "undefined" && module.exports) {
  module.exports = EvalixAPI;
}

// Navegador (script clásico)
if (typeof window !== "undefined") {
  window.EvalixAPI = EvalixAPI;
  // Backward-compat: expongo los nombres que tu HTML espera
  window.apiGetGrades = apiGetGrades;
  window.apiSaveGrades = apiSaveGrades;
}

/*
 * PRUEBA RÁPIDA (en consola del navegador, tras incluir este JS)
 *  1) Configura MOCKAPI_BASE arriba.
 *  2) Ejecuta:
 *     await apiGetGrades(2025, 1)
 *     await apiSaveGrades(2025, 1, {
 *       nextId: 1005,
 *       autoId: true,
 *       rows: [{ idEst: "1001", documento: "123", nombre: "Ana", asignatura: "Matemáticas", n1: 4.5, n2: 4.2, n3: 0, n4: 0, prom: 4.35 }]
 *     })
 */
