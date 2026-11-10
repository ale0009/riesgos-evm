// Interfaz del simulador EVM. La lógica está en evm.js (funciones puras).
import { EJERCICIO_EVM as E } from "./datos.js";
import { simular, semaforo, repartir } from "./evm.js";
import { dibujarCurvas } from "./grafica.js";

const $ = (id) => document.getElementById(id);
const MAX_SP = 12;
const MAX_COSTO = 10000;

const usd = (v) => (v == null ? "—" : `${Math.round(v).toLocaleString("es-CO")} USD`);
const usdFirmado = (v) => (v == null ? "—" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(Math.round(v)).toLocaleString("es-CO")} USD`);
const indice = (v) => (v == null ? "—" : v.toLocaleString("es-CO", { minimumFractionDigits: 3, maximumFractionDigits: 3 }));

function escenarioFuente() {
  const sp = repartir(E.corteFuente.spCompletados, E.corteFuente.sprint, true);
  const costo = repartir(E.corteFuente.costoReal, E.corteFuente.sprint);
  return {
    corte: E.corteFuente.sprint,
    reales: Array.from({ length: E.sprints }, (_, k) => ({ sp: sp[k] ?? 0, costo: costo[k] ?? 0 })),
    nota: "Escenario de la fuente: al cierre del Sprint 2 se completaron 14 de 16 puntos y se gastaron 12.500 USD. El reparto 7 + 7 puntos y 6.250 + 6.250 USD es un supuesto de esta demo; la fuente solo da el acumulado.",
  };
}
function escenarioPlan() {
  return {
    corte: E.sprints,
    reales: Array.from({ length: E.sprints }, () => ({ sp: E.velocidad, costo: E.costoSprint })),
    nota: "Todo según el plan: 8 puntos y 5.800 USD por sprint. Los índices valen exactamente 1.",
  };
}

let estado = escenarioFuente();

/* ---------- controles ---------- */
function pintarCorte() {
  $("corte").replaceChildren(
    ...Array.from({ length: E.sprints }, (_, k) => {
      const n = k + 1;
      const lab = document.createElement("label");
      const inp = Object.assign(document.createElement("input"), { type: "radio", name: "corte", value: String(n), checked: n === estado.corte });
      inp.addEventListener("change", () => { estado.corte = n; estado.nota = ""; pintarSprints(); actualizar(); });
      const span = document.createElement("span");
      span.textContent = `Sprint ${n}`;
      lab.append(inp, span);
      return lab;
    }),
  );
}

function deslizador(k, campo, etiqueta, max, paso, unidad) {
  const id = `s${k}-${campo}`;
  const cont = document.createElement("div");
  cont.className = "deslizador";
  const lab = document.createElement("label");
  lab.htmlFor = id;
  lab.textContent = etiqueta;
  const rango = Object.assign(document.createElement("input"), { type: "range", id, min: "0", max: String(max), step: String(paso), value: String(estado.reales[k][campo]) });
  const num = Object.assign(document.createElement("input"), { type: "number", min: "0", max: String(max), step: String(paso), value: String(Math.round(estado.reales[k][campo])), inputMode: "numeric" });
  num.setAttribute("aria-label", `${etiqueta} (${unidad})`);
  const activo = k < estado.corte;
  rango.disabled = num.disabled = !activo;
  const fijar = (v, origen) => {
    let x = Number(v);
    if (!Number.isFinite(x)) return;
    x = Math.min(max, Math.max(0, x));
    estado.reales[k][campo] = x;
    estado.nota = "";
    if (origen !== rango) rango.value = String(x);
    if (origen !== num) num.value = String(Math.round(x));
    actualizar();
  };
  rango.addEventListener("input", () => fijar(rango.value, rango));
  num.addEventListener("change", () => fijar(num.value, num));
  cont.append(lab, rango, num);
  return cont;
}

function pintarSprints() {
  $("sprints").replaceChildren(
    ...Array.from({ length: E.sprints }, (_, k) => {
      const fs = document.createElement("fieldset");
      fs.className = "sprint";
      const activo = k < estado.corte;
      fs.dataset.inactivo = String(!activo);
      const lg = document.createElement("legend");
      lg.textContent = `Sprint ${k + 1}${activo ? "" : " · aún no ejecutado"}`;
      fs.append(
        lg,
        deslizador(k, "sp", `Puntos de historia terminados en el Sprint ${k + 1} (plan: ${E.velocidad})`, MAX_SP, 1, "puntos"),
        deslizador(k, "costo", `Costo real del Sprint ${k + 1} (plan: ${E.costoSprint.toLocaleString("es-CO")} USD)`, MAX_COSTO, 50, "USD"),
      );
      return fs;
    }),
  );
}

/* ---------- resultados ---------- */
const DEFINICIONES = [
  ["PV", "pv", "Valor planificado: lo que debía estar hecho al corte, en dinero.", usd],
  ["EV", "ev", "Valor ganado: lo realmente terminado (puntos / 24 × BAC).", usd],
  ["AC", "ac", "Costo real: lo que se ha gastado hasta el corte.", usd],
  ["CV", "cv", "Variación de costo = EV − AC. Negativo: sobrecosto.", usdFirmado],
  ["SV", "sv", "Variación de cronograma = EV − PV. Negativo: retraso.", usdFirmado],
  ["CPI", "cpi", "Índice de costo = EV / AC. Valor obtenido por cada dólar gastado.", indice],
  ["SPI", "spi", "Índice de cronograma = EV / PV. Ritmo frente al plan.", indice],
  ["EAC", "eac", "Estimación al terminar = BAC / CPI: costo final si sigue igual.", usd],
  ["ETC", "etc", "Estimación para terminar = EAC − AC: lo que falta por gastar.", usd],
  ["VAC", "vac", "Variación al terminar = BAC − EAC. Negativo: se pasará del presupuesto.", usdFirmado],
  ["TCPI", "tcpi", "Índice de desempeño por completar = (BAC − EV) / (BAC − AC): eficiencia necesaria para no pasarse.", indice],
];

// Valores que la fuente publica para el corte del Sprint 2 (para marcar "coincide con la fuente").
const PUBLICADOS = { pv: 11600, ev: 10150, ac: 12500, cv: -2350, sv: -1450, cpi: 0.812, spi: 0.875, eac: 21428.57 };

function esEscenarioFuente(s) {
  return estado.corte === E.corteFuente.sprint && s.spAcumulados === E.corteFuente.spCompletados && Math.round(s.ac) === E.corteFuente.costoReal;
}

const ETIQUETA_FOCO = { verde: "En plan o mejor", ambar: "Por debajo del plan", rojo: "Crítico (< 0,8)", "sin-dato": "Sin dato" };

function actualizar() {
  const s = simular(E, estado.reales, estado.corte);
  const deFuente = esEscenarioFuente(s);

  $("kpis").replaceChildren(
    ...DEFINICIONES.map(([sigla, clave, def, fmt]) => {
      const v = s[clave];
      const caja = document.createElement("div");
      caja.className = "kpi";
      const dt = document.createElement("dt");
      dt.textContent = sigla;
      if (clave === "cpi" || clave === "spi") {
        const color = semaforo(v);
        const foco = document.createElement("span");
        foco.className = `foco foco--${color}`;
        foco.textContent = ETIQUETA_FOCO[color];
        dt.append(foco);
      }
      const dd = document.createElement("dd");
      dd.className = "valor";
      if (["cv", "sv", "vac"].includes(clave) && v != null && v !== 0) dd.classList.add(v < 0 ? "negativo" : "positivo");
      if (clave === "tcpi" && v != null && v > 1) dd.classList.add("negativo");
      dd.textContent = fmt(v);
      const p = document.createElement("dd");
      p.className = "def";
      p.textContent = def;
      caja.append(dt, dd, p);
      if (deFuente && clave in PUBLICADOS && Math.abs(v - PUBLICADOS[clave]) < 0.01) {
        const f = document.createElement("dd");
        f.className = "fuente-dato";
        f.textContent = "Coincide con la fuente";
        caja.append(f);
      } else if (deFuente && clave !== "bac") {
        const f = document.createElement("dd");
        f.className = "fuente-dato";
        f.textContent = "Calculado aquí (la fuente no lo trae)";
        caja.append(f);
      }
      return caja;
    }),
  );

  // Diagnóstico en lenguaje claro
  const partes = [];
  if (s.cpi == null) partes.push("Aún no hay costo real: no se puede medir la eficiencia.");
  else if (s.cpi < 1) partes.push(`Sobrecosto: cada dólar gastado produce ${indice(s.cpi)} dólares de valor.`);
  else partes.push(`Costo bajo control: cada dólar produce ${indice(s.cpi)} de valor.`);
  if (s.spi != null) {
    if (s.spAcumulados < s.spPlanificados) partes.push(`Retraso: ${s.spAcumulados} de ${s.spPlanificados} puntos planeados.`);
    else if (s.spAcumulados > s.spPlanificados) partes.push(`Adelanto: ${s.spAcumulados} de ${s.spPlanificados} puntos planeados.`);
    else partes.push(`Cronograma al día: ${s.spAcumulados} de ${s.spPlanificados} puntos.`);
  }
  if (s.vac != null && s.vac < 0) partes.push(`Si nada cambia, el proyecto costará ${usd(s.eac)} (${usd(-s.vac)} más que el presupuesto).`);
  if (s.tcpi == null && estado.corte < E.sprints) partes.push("El presupuesto ya se agotó.");
  else if (s.tcpi != null && s.tcpi > 1 && estado.corte < E.sprints) partes.push(`Para no pasarse, lo que falta debe rendir ${indice(s.tcpi)} por dólar.`);
  if (s.spi != null && s.spi < 0.8) partes.push("Se activa el disparador de R06 del caso de riesgos (SPI < 0,8).");
  $("diagnostico").textContent = partes.join(" ");

  const peor = Math.min(s.cpi ?? 1, s.spi ?? 1);
  const grito = $("evm-grito");
  if (peor < 0.8) { grito.textContent = "¡ALERTA!"; grito.className = "onomatopeya onomatopeya--evm es-alerta"; }
  else if (peor < 1) { grito.textContent = "¡OJO!"; grito.className = "onomatopeya onomatopeya--evm"; }
  else { grito.textContent = "¡EN RUTA!"; grito.className = "onomatopeya onomatopeya--evm"; }

  $("nota-escenario").textContent = estado.nota ?? "";

  dibujarCurvas($("grafica"), s, E);

  $("tabla-grafica").replaceChildren(
    ...s.serie.map((f) => {
      const tr = document.createElement("tr");
      for (const v of [f.sprint === 0 ? "Inicio" : `Sprint ${f.sprint}`, usd(f.pv), usd(f.ev), usd(f.ac), f.sp ?? "—"]) {
        const td = document.createElement("td");
        td.textContent = String(v);
        tr.append(td);
      }
      return tr;
    }),
  );
}

export function iniciarEvm() {
  for (const b of document.querySelectorAll("[data-escenario]")) {
    b.addEventListener("click", () => {
      estado = b.dataset.escenario === "plan" ? escenarioPlan() : escenarioFuente();
      pintarCorte(); pintarSprints(); actualizar();
    });
  }
  document.addEventListener("tema-cambiado", actualizar);
  let pendiente = 0;
  addEventListener("resize", () => {
    cancelAnimationFrame(pendiente);
    pendiente = requestAnimationFrame(actualizar);
  });
  pintarCorte();
  pintarSprints();
  actualizar();
}
