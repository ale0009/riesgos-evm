// Gráfica de curvas S en SVG propio (sin librerías). Los colores salen de las clases CSS,
// así que funciona en modo claro y oscuro sin redibujar con otros valores.

const NS = "http://www.w3.org/2000/svg";

function nodo(tag, attrs = {}, texto) {
  const n = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) if (v != null) n.setAttribute(k, String(v));
  if (texto != null) n.textContent = texto;
  return n;
}

const miles = (v) => Math.round(v).toLocaleString("es-CO");

/** Paso "bonito" para las marcas del eje Y. */
function pasoEje(max) {
  const bruto = max / 5;
  const pot = 10 ** Math.floor(Math.log10(bruto));
  const n = bruto / pot;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * pot;
}

/**
 * @param {HTMLElement} cont  contenedor
 * @param {object} s  resultado de simular()
 * @param {object} E  datos del ejercicio
 */
export function dibujarCurvas(cont, s, E) {
  const estrecho = cont.clientWidth > 0 && cont.clientWidth < 560;
  const W = estrecho ? 360 : 760;
  const H = estrecho ? 300 : 340;
  const m = { izq: estrecho ? 52 : 70, der: estrecho ? 14 : 130, arr: 18, aba: estrecho ? 78 : 44 };
  const ancho = W - m.izq - m.der;
  const alto = H - m.arr - m.aba;

  const maxY = Math.max(E.bac, s.eac ?? 0, s.ac ?? 0) * 1.08;
  const paso = pasoEje(maxY);
  const topeY = Math.ceil(maxY / paso) * paso;
  const x = (k) => m.izq + (k / E.sprints) * ancho;
  const y = (v) => m.arr + alto - (v / topeY) * alto;

  const resumen =
    `Curvas S al cierre del Sprint ${s.serie.findLastIndex((f) => f.ev != null)}: ` +
    `planeado ${miles(s.pv)} USD, ganado ${miles(s.ev)} USD, gastado ${miles(s.ac)} USD. ` +
    `Presupuesto ${miles(E.bac)} USD; costo final proyectado ${s.eac == null ? "sin dato" : miles(s.eac) + " USD"}.`;

  const svg = nodo("svg", { viewBox: `0 0 ${W} ${H}`, role: "img", "aria-label": resumen });
  svg.append(nodo("title", {}, "Curvas S de valor planificado, valor ganado y costo real"));

  // Reja y eje Y
  for (let v = 0; v <= topeY + 1e-6; v += paso) {
    svg.append(nodo("line", { class: "g-reja", x1: m.izq, x2: W - m.der, y1: y(v), y2: y(v) }));
    svg.append(nodo("text", { class: "g-texto", x: m.izq - 8, y: y(v) + 4, "text-anchor": "end" }, estrecho ? `${Math.round(v / 1000)}k` : miles(v)));
  }
  // Eje X
  svg.append(nodo("line", { class: "g-eje", x1: m.izq, x2: W - m.der, y1: y(0), y2: y(0) }));
  svg.append(nodo("line", { class: "g-eje", x1: m.izq, x2: m.izq, y1: m.arr, y2: y(0) }));
  for (let k = 0; k <= E.sprints; k++) {
    svg.append(nodo("text", { class: "g-texto", x: x(k), y: y(0) + 18, "text-anchor": "middle" }, k === 0 ? "Inicio" : `S${k}`));
  }

  // Línea vertical del corte
  const corte = s.serie.findLastIndex((f) => f.ev != null);
  svg.append(nodo("line", { class: "g-corte", x1: x(corte), x2: x(corte), y1: m.arr, y2: y(0) }));
  svg.append(nodo("text", { class: "g-texto", x: x(corte) + (corte === E.sprints ? -4 : 4), y: m.arr + 12, "text-anchor": corte === E.sprints ? "end" : "start" }, "corte"));

  // Líneas horizontales BAC y EAC
  const horizontal = (v, clase, texto) => {
    svg.append(nodo("line", { class: clase, x1: m.izq, x2: W - m.der, y1: y(v), y2: y(v) }));
    if (!estrecho) svg.append(nodo("text", { class: "g-etiqueta", x: W - m.der + 8, y: y(v) + 4 }, texto));
  };
  horizontal(E.bac, "g-bac", `BAC ${miles(E.bac)}`);
  if (s.eac != null && Math.abs(s.eac - E.bac) > 1) horizontal(s.eac, "g-eac", `EAC ${miles(s.eac)}`);

  // Curvas
  const camino = (puntos) => puntos.map(([k, v], n) => `${n ? "L" : "M"}${x(k).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const pv = s.serie.map((f) => [f.sprint, f.pv]);
  const ev = s.serie.filter((f) => f.ev != null).map((f) => [f.sprint, f.ev]);
  const ac = s.serie.filter((f) => f.ac != null).map((f) => [f.sprint, f.ac]);
  svg.append(nodo("path", { class: "g-pv", d: camino(pv) }));
  svg.append(nodo("path", { class: "g-ac", d: camino(ac) }));
  svg.append(nodo("path", { class: "g-ev", d: camino(ev) }));
  // Marcadores con formas distintas: no dependen solo del color
  for (const [k, v] of pv) svg.append(nodo("circle", { class: "g-punto-pv", cx: x(k), cy: y(v), r: 4.5 }));
  for (const [k, v] of ac) svg.append(nodo("rect", { class: "g-punto-ac", x: x(k) - 5, y: y(v) - 5, width: 10, height: 10 }));
  for (const [k, v] of ev) {
    const cx = x(k), cy = y(v);
    svg.append(nodo("path", { class: "g-punto-ev", d: `M${cx},${cy - 7} L${cx + 7},${cy} L${cx},${cy + 7} L${cx - 7},${cy} Z` }));
  }

  // Leyenda
  const items = [
    ["g-pv", "PV planeado", "circle"],
    ["g-ev", "EV ganado", "diamond"],
    ["g-ac", "AC gastado", "square"],
  ];
  if (!estrecho) items.push(["g-eac", "EAC proyectado", null], ["g-bac", "BAC presupuesto", null]);
  const ley = nodo("g", { "aria-hidden": "true" });
  items.forEach(([clase, texto], n) => {
    let lx, ly;
    if (estrecho) { lx = 12 + [0, 116, 220][n]; ly = H - 36; }
    else { lx = W - m.der + 8; ly = m.arr + 150 + n * 22; }
    ley.append(nodo("line", { class: clase, x1: lx, x2: lx + 22, y1: ly, y2: ly }));
    ley.append(nodo("text", { class: "g-leyenda", x: lx + 28, y: ly + 4 }, texto));
  });
  if (estrecho) {
    ley.append(nodo("line", { class: "g-bac", x1: 12, x2: 34, y1: H - 14, y2: H - 14 }));
    ley.append(nodo("text", { class: "g-leyenda", x: 40, y: H - 10 }, `BAC ${miles(E.bac)}`));
    if (s.eac != null) {
      ley.append(nodo("line", { class: "g-eac", x1: 128, x2: 150, y1: H - 14, y2: H - 14 }));
      ley.append(nodo("text", { class: "g-leyenda", x: 156, y: H - 10 }, `EAC ${miles(s.eac)}`));
    }
  }
  svg.append(ley);

  cont.replaceChildren(svg);
}
