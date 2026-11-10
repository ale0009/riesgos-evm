// Página /proceso/: gráficas calculadas con los mismos datos y funciones que la herramienta.
// Nada de lo que se dibuja aquí está escrito a mano: sale de js/datos.js, js/riesgos.js y js/evm.js.
import { iniciarTema } from "./tema.js";
import { CASOS, EJERCICIO_EVM as E } from "./datos.js";
import { evaluar, matrizCalor, conteoPorNivel, rangoNivel } from "./riesgos.js";
import { metricas, valorGanado, valorPlanificado } from "./evm.js";

const miles = (v) => Math.round(v).toLocaleString("es-CO");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Matriz 5 × 5 de un caso: color por nivel, valor P × I y número de riesgos en cada celda. */
function svgMatriz(caso) {
  const evaluados = evaluar(caso.riesgos, caso.escala);
  const filas = matrizCalor(evaluados, caso.escala);
  const L = 54; // lado de celda
  const x0 = 34;
  const y0 = 6;
  let celdas = "";
  filas.forEach((fila, f) => {
    fila.forEach((c, k) => {
      const x = x0 + k * L;
      const y = y0 + f * L;
      const n = rangoNivel(c.nivel, caso.escala);
      const clase = `pm-n${n}${n === caso.escala.length - 1 ? " pm-max" : ""}`;
      const borde = c.valor === 10 ? `<rect class="pm-diez" x="${x + 4}" y="${y + 4}" width="${L - 8}" height="${L - 8}"/>` : "";
      const cuenta = c.ids.length
        ? `<circle class="pm-bola" cx="${x + L - 15}" cy="${y + L - 15}" r="10"/><text class="pm-cuenta" x="${x + L - 15}" y="${y + L - 11}" text-anchor="middle">${c.ids.length}</text>`
        : "";
      celdas += `<g><title>P ${c.p} × I ${c.i} = ${c.valor} · ${c.nivel}${c.ids.length ? " · " + c.ids.join(", ") : ""}</title>`
        + `<rect class="pm-celda ${clase}" x="${x}" y="${y}" width="${L - 3}" height="${L - 3}"/>${borde}`
        + `<text class="pm-valor" x="${x + 5}" y="${y + 15}">${c.valor}</text>${cuenta}</g>`;
    });
  });
  let ejes = "";
  for (let k = 0; k < 5; k++) {
    ejes += `<text class="pm-eje" x="${x0 + k * L + (L - 3) / 2}" y="${y0 + 5 * L + 14}" text-anchor="middle">${k + 1}</text>`;
    ejes += `<text class="pm-eje" x="${x0 - 8}" y="${y0 + k * L + L / 2 + 3}" text-anchor="end">${5 - k}</text>`;
  }
  ejes += `<text class="pm-titulo" x="${x0 + (5 * L) / 2}" y="${y0 + 5 * L + 32}" text-anchor="middle">Impacto (I)</text>`;
  ejes += `<text class="pm-titulo" transform="translate(10 ${y0 + (5 * L) / 2}) rotate(-90)" text-anchor="middle">Probabilidad (P)</text>`;
  const W = x0 + 5 * L + 4;
  const H = y0 + 5 * L + 40;
  const conteo = conteoPorNivel(evaluados, caso.escala);
  const resumen = caso.escala.map((t) => `${conteo[t.nivel]} ${t.nivel}`).join(", ");
  return {
    svg: `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Matriz de probabilidad por impacto del caso ${esc(caso.nombre)}: ${resumen}.">${ejes}${celdas}</svg>`,
    resumen,
  };
}

/** Barras horizontales con la etiqueta encima (se lee bien a 390 px). */
function svgBarras(items, tope, ref) {
  const W = 360;
  const fila = 46;
  const izq = 4;
  const ancho = W - izq - 70;
  const H = items.length * fila + 6;
  const x = (v) => izq + (v / tope) * ancho;
  // la línea de referencia va primero para quedar detrás de las etiquetas
  let g = ref != null ? `<line class="pb-ref" x1="${x(ref)}" x2="${x(ref)}" y1="16" y2="${H}"/>` : "";
  items.forEach((it, k) => {
    const y = k * fila;
    g += `<text class="pb-etiqueta" x="${izq}" y="${y + 14}">${esc(it.etiqueta)}</text>`;
    g += `<rect class="pb-barra ${it.clase}" x="${izq}" y="${y + 20}" width="${Math.max(2, x(it.valor) - izq)}" height="18"/>`;
    g += `<text class="pb-valor" x="${x(it.valor) + 6}" y="${y + 34}">${miles(it.valor)}</text>`;
  });
  const texto = items.map((it) => `${it.etiqueta}: ${miles(it.valor)} USD`).join("; ");
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(texto)}">${g}</svg>`;
}

function iniciar() {
  iniciarTema();

  for (const caso of CASOS) {
    const cont = document.getElementById(`m-${caso.id}`);
    if (!cont) continue;
    const { svg, resumen } = svgMatriz(caso);
    cont.innerHTML = svg;
    const nota = document.getElementById(`m-${caso.id}-resumen`);
    if (nota) nota.textContent = `Calculado aquí con la escala del caso: ${resumen}.`;
  }

  const { corteFuente: c } = E;
  const pv = valorPlanificado(c.sprint, E);
  const ev = valorGanado(c.spCompletados, E);
  const m = metricas({ pv, ev, ac: c.costoReal, bac: E.bac });

  const corte = document.getElementById("g-corte");
  if (corte) {
    corte.innerHTML = svgBarras([
      { etiqueta: "PV · lo planeado al Sprint 2", valor: m.pv, clase: "pb-pv" },
      { etiqueta: "EV · lo entregado (14 de 24 SP)", valor: m.ev, clase: "pb-ev" },
      { etiqueta: "AC · lo gastado", valor: m.ac, clase: "pb-ac" },
    ], 14000);
  }

  const eac = document.getElementById("g-eac");
  if (eac) {
    eac.innerHTML = svgBarras([
      { etiqueta: "BAC · presupuesto aprobado", valor: E.bac, clase: "pb-pv" },
      { etiqueta: "EAC = AC + (BAC − EV) · desvío puntual", valor: m.ac + (E.bac - m.ev), clase: "pb-gris" },
      { etiqueta: "EAC = BAC / SPI · variante de la fuente", valor: m.eacSpi, clase: "pb-gris" },
      { etiqueta: "EAC = BAC / CPI · la que usa la herramienta", valor: m.eac, clase: "pb-ac" },
      { etiqueta: "EAC = AC + (BAC − EV) / (CPI × SPI)", valor: m.eacCpiSpi, clase: "pb-gris" },
    ], 24000, E.bac);
  }
}

iniciar();
