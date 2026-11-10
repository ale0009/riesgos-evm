// Interfaz del tablero de riesgos. La lógica está en riesgos.js (funciones puras).
import { CASOS } from "./datos.js";
import {
  evaluar, filtrar, valoresUnicos, conteoPorNivel, matrizCalor,
  rangoNivel, esNivelMaximo, compararResidual, EFECTO_ESTRATEGIA,
} from "./riesgos.js";

const $ = (id) => document.getElementById(id);

const estado = {
  caso: CASOS[0],
  filtros: { categoria: "todas", estrategia: "todas" },
  seleccion: null, // id de riesgo
  celda: null, // {p, i}
  residual: null, // {p, i} hipótesis del visitante para el riesgo seleccionado
};

/** Crea un elemento con atributos e hijos (texto o nodos). */
function el(tag, attrs = {}, ...hijos) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === "class") n.className = v;
    else if (k.startsWith("on")) n.addEventListener(k.slice(2), v);
    else n.setAttribute(k, v === true ? "" : v);
  }
  for (const h of hijos.flat()) if (h != null) n.append(h);
  return n;
}

// Clase de color por posición en la escala: n0 (más bajo) ... n3 (Crítico, rojo sólido).
const claseNivel = (nivel, escala) => `n${rangoNivel(nivel, escala)}`;

const insignia = (nivel, escala) => el("span", { class: `insignia ${claseNivel(nivel, escala)}` }, nivel);

function evaluados() {
  return evaluar(estado.caso.riesgos, estado.caso.escala);
}
function visibles() {
  return filtrar(evaluados(), estado.filtros);
}

/* ---------- controles ---------- */
function pintarCasos() {
  const cont = $("casos");
  cont.replaceChildren(
    ...CASOS.map((c, k) =>
      el("label", {},
        el("input", {
          type: "radio", name: "caso", value: c.id, checked: c === estado.caso,
          onchange: () => {
            estado.caso = CASOS[k];
            estado.filtros = { categoria: "todas", estrategia: "todas" };
            estado.seleccion = null; estado.celda = null; estado.residual = null;
            pintarTodo();
          },
        }),
        el("span", {}, k === 0 ? "Proveedor de servicios gestionados" : "Sistema de gestión académica"),
      ),
    ),
  );
}

function pintarFiltros() {
  const { riesgos } = estado.caso;
  const opciones = (sel, campo, plural) => {
    sel.replaceChildren(
      el("option", { value: "todas" }, `Todas (${plural})`),
      ...valoresUnicos(riesgos, campo).map((v) => el("option", { value: v }, v)),
    );
    sel.value = estado.filtros[campo];
  };
  opciones($("f-categoria"), "categoria", `${valoresUnicos(riesgos, "categoria").length} categorías`);
  opciones($("f-estrategia"), "estrategia", `${valoresUnicos(riesgos, "estrategia").length} estrategias`);
}

/* ---------- matriz de calor ---------- */
function pintarMatriz() {
  const { escala } = estado.caso;
  const todos = evaluados();
  const vis = new Set(visibles().map((r) => r.id));
  const matriz = matrizCalor(todos, escala);
  const cont = $("matriz");
  cont.className = `matriz escala${escala.length}`;
  const nodos = [
    el("div", { class: "matriz__titulo-y", "aria-hidden": "true" }, "Probabilidad"),
  ];
  matriz.forEach((fila, f) => {
    nodos.push(el("div", { class: "matriz__eje", style: `grid-column:2;grid-row:${f + 1}`, "aria-hidden": "true" }, String(fila[0].p)));
    fila.forEach((celda, c) => {
      const idsVisibles = celda.ids.filter((id) => vis.has(id));
      const vacia = idsVisibles.length === 0;
      const seleccionada = estado.celda && estado.celda.p === celda.p && estado.celda.i === celda.i;
      const esResidual = estado.residual && estado.residual.p === celda.p && estado.residual.i === celda.i;
      const atenuada = !vacia ? false : celda.ids.length > 0;
      const etiqueta = `P ${celda.p}, I ${celda.i}: severidad ${celda.valor}, nivel ${celda.nivel}. ` +
        (vacia ? "Sin riesgos" : `${idsVisibles.length} riesgo${idsVisibles.length > 1 ? "s" : ""}: ${idsVisibles.join(", ")}`) +
        (esResidual ? ". Posición residual de tu hipótesis" : "");
      nodos.push(
        el("button", {
          type: "button",
          class: `celda ${claseNivel(celda.nivel, escala)}${vacia ? " celda--vacia" : ""}${atenuada ? " celda--atenuada" : ""}${esResidual ? " celda--residual" : ""}`,
          style: `grid-column:${c + 3};grid-row:${f + 1}`,
          "aria-label": etiqueta,
          "aria-pressed": seleccionada ? "true" : "false",
          "aria-disabled": vacia ? "true" : null,
          onclick: () => {
            if (vacia) return;
            estado.celda = { p: celda.p, i: celda.i };
            estado.seleccion = idsVisibles.length === 1 ? idsVisibles[0] : null;
            estado.residual = null;
            pintarMatriz(); pintarRegistro(); pintarDetalle(true);
          },
        },
          el("span", { class: "celda__valor", "aria-hidden": "true" }, String(celda.valor)),
          el("span", { class: "celda__ids", "aria-hidden": "true" }, idsVisibles.join(" ")),
        ),
      );
    });
  });
  [1, 2, 3, 4, 5].forEach((i) =>
    nodos.push(el("div", { class: "matriz__eje", style: `grid-column:${i + 2};grid-row:6`, "aria-hidden": "true" }, String(i))),
  );
  nodos.push(el("div", { class: "matriz__titulo-x", "aria-hidden": "true" }, "Impacto"));
  cont.replaceChildren(...nodos);

  $("escala-nota").textContent =
    "Escala: " + escala.map((t) => `${t.nivel} ${t.min}–${t.max}`).join(" · ") + ". Filas: probabilidad; columnas: impacto.";
  $("leyenda").replaceChildren(
    ...escala.map((t) => {
      const n = conteoPorNivel(todos, escala)[t.nivel];
      return el("li", {},
        el("span", { class: `muestra ${claseNivel(t.nivel, escala)}`, "aria-hidden": "true" }),
        `${t.nivel}: ${n}`,
      );
    }),
  );
}

/* ---------- registro ---------- */
function pintarRegistro() {
  const { escala } = estado.caso;
  const vis = visibles();
  const filas = vis.map((r) => {
    const abrir = () => {
      estado.seleccion = r.id;
      estado.celda = { p: r.p, i: r.i };
      estado.residual = null;
      pintarMatriz(); pintarRegistro(); pintarDetalle(true);
    };
    return el("tr", { class: r.id === estado.seleccion ? "activa" : null, onclick: abrir },
      el("td", {}, el("button", { type: "button", class: "fila-boton", onclick: (e) => { e.stopPropagation(); abrir(); }, "aria-label": `Ver detalle de ${r.id}: ${r.titulo}` }, r.id)),
      el("td", {}, r.titulo, el("span", { class: "meta" }, `${r.categoria} · ${r.estrategia}`)),
      el("td", { class: "col-ancha" }, r.categoria),
      el("td", { class: "num" }, String(r.p)),
      el("td", { class: "num" }, String(r.i)),
      el("td", { class: "num" }, String(r.valor)),
      el("td", {}, insignia(r.nivel, escala)),
      el("td", { class: "col-ancha" }, r.estrategia),
    );
  });
  $("registro").replaceChildren(...filas);
  const total = estado.caso.riesgos.length;
  $("conteo").textContent = vis.length === total ? `${total} riesgos` : `${vis.length} de ${total} riesgos`;
  $("caso-sub").textContent = `${estado.caso.subtitulo} Marco: ${estado.caso.marco}.`;
}

/* ---------- detalle y simulación ---------- */
// En pantallas estrechas el detalle queda debajo de la matriz: lo traemos a la vista.
function llevarAlDetalle(cont) {
  if (!matchMedia("(max-width: 960px)").matches) return; // en escritorio basta con aria-live
  const suave = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  cont.scrollIntoView({ behavior: suave ? "smooth" : "auto", block: "start" });
  cont.focus({ preventScroll: true });
}

function campo(titulo, valor) {
  return [el("dt", {}, titulo), el("dd", {}, valor ?? el("span", { class: "sin-dato" }, "La fuente no lo documenta."))];
}

function pintarDetalle(enfocar = false) {
  const cont = $("detalle");
  const { escala, indicadores, indicadoresGenerales } = estado.caso;
  const todos = evaluados();
  const r = todos.find((x) => x.id === estado.seleccion);

  if (!r) {
    if (estado.celda) {
      const vis = new Set(visibles().map((x) => x.id));
      const enCelda = todos.filter((x) => x.p === estado.celda.p && x.i === estado.celda.i && vis.has(x.id));
      cont.replaceChildren(
        el("p", { class: "detalle__codigo" }, `Celda P ${estado.celda.p} × I ${estado.celda.i}`),
        el("p", {}, `${enCelda.length} riesgos comparten esta celda. Elige uno:`),
        el("div", { class: "detalle__lista" },
          enCelda.map((x) => el("button", {
            type: "button", class: "boton boton--claro",
            onclick: () => { estado.seleccion = x.id; pintarRegistro(); pintarDetalle(true); },
          }, `${x.id} · ${x.titulo}`)),
        ),
      );
    } else {
      cont.replaceChildren(el("p", { class: "detalle__vacio" }, "Toca una celda de la matriz o una fila del registro."));
    }
    if (enfocar) llevarAlDetalle(cont);
    return;
  }

  const maximo = esNivelMaximo(r.nivel, escala);
  const listaIndicadores = (r.indicadores ?? []).map((k) => indicadores[k]).filter(Boolean);
  const generales = (indicadoresGenerales ?? []).map((k) => indicadores[k]).filter(Boolean);
  const dIndicador = listaIndicadores.length
    ? el("ul", {}, listaIndicadores.map((x) => el("li", {}, `${x.nombre} (meta ${x.meta}, ${x.frecuencia.toLowerCase()})`)))
    : generales.length
      ? el("span", {}, "La fuente no le asigna uno propio; se sigue con los generales: ",
          generales.map((x) => `${x.nombre} (meta ${x.meta})`).join(" y "), ".")
      : null;

  const nodos = [
    el("div", { class: "detalle__cabecera" },
      el("div", {},
        el("p", { class: "detalle__codigo" }, `${r.id} · ${r.categoria}`),
        el("h3", { class: "detalle__titulo" }, r.titulo),
        el("p", { class: "comparacion" }, `P ${r.p} × I ${r.i} = ${r.valor}`, insignia(r.nivel, escala)),
      ),
      maximo ? el("p", { class: "alerta", role: "img", "aria-label": `Alerta: nivel ${r.nivel}, el máximo de la escala` }, "¡ALERTA!") : null,
    ),
    el("dl", {},
      r.desc ? campo("Descripción", r.desc) : null,
      r.disparador
        ? campo("Causa y efecto", el("span", { class: "sin-dato" }, "La fuente no los separa: documenta la descripción, el disparador y la contingencia."))
        : null,
      r.disparador ? campo("Disparador (señal temprana)", r.disparador) : null,
      campo("Respuesta", el("span", {}, el("strong", {}, `${r.estrategia}. `), r.acciones)),
      r.contingencia ? campo("Contingencia (si ocurre)", r.contingencia) : null,
      r.responsable ? campo("Responsable (rol)", r.responsable) : null,
      r.frecuencia ? campo("Revisión", r.frecuencia) : null,
      dIndicador ? campo("Indicador de seguimiento", dIndicador) : null,
    ),
    r.disparador ? null : el("p", { class: "nota" },
      "El taller solo documenta categoría, P, I, estrategia y plan de acción: no trae causa y efecto, disparador, contingencia, responsable ni indicador."),
    pintarSimulacion(r),
  ];
  cont.replaceChildren(...nodos.filter(Boolean));
  if (enfocar) llevarAlDetalle(cont);
}

function pintarSimulacion(r) {
  const { escala } = estado.caso;
  const residual = estado.residual ?? { p: r.p, i: r.i };
  const comparacion = estado.residual ? compararResidual(r, residual, escala) : null;

  const selector = (eje, nombre) => el("label", {}, nombre,
    el("select", {
      onchange: (e) => {
        estado.residual = { ...residual, [eje]: Number(e.target.value) };
        pintarMatriz(); pintarDetalle();
        document.querySelector(`#detalle select[data-eje="${eje}"]`)?.focus();
      },
      "data-eje": eje,
    }, [1, 2, 3, 4, 5].map((v) => {
      const o = el("option", { value: String(v) }, String(v));
      if (v === residual[eje]) o.selected = true;
      return o;
    })),
  );

  return el("section", { class: "simulacion", "aria-labelledby": "t-sim" },
    el("h4", { id: "t-sim" }, "¿Qué pasa si aplico la respuesta?"),
    el("p", {}, el("strong", {}, `${r.estrategia}: `), EFECTO_ESTRATEGIA[r.estrategia] ?? ""),
    el("p", {}, "Riesgo residual según la fuente: ",
      el("span", { class: "sin-dato" }, "no se documenta (ninguno de los dos casos estima P e I después de la respuesta).")),
    el("p", {}, el("span", { class: "etiqueta-hipotesis" }, "Tu hipótesis"), " Propón la probabilidad y el impacto que esperarías tras aplicar la respuesta:"),
    el("div", { class: "simulacion__controles" },
      selector("p", "P residual"),
      selector("i", "I residual"),
      estado.residual
        ? el("button", { type: "button", class: "boton boton--texto", onclick: () => { estado.residual = null; pintarMatriz(); pintarDetalle(); } }, "Borrar hipótesis")
        : null,
    ),
    comparacion
      ? el("p", { class: "comparacion" },
          `${comparacion.antes}`, insignia(comparacion.nivelAntes, escala), " → ",
          `${comparacion.despues}`, insignia(comparacion.nivelDespues, escala),
          el("span", {}, comparacion.reduccion > 0
            ? ` (−${comparacion.reduccionPct} %)`
            : comparacion.reduccion < 0 ? " (empeora)" : " (sin cambio)"),
        )
      : el("p", { class: "nota" }, "Mueve P o I y verás la casilla «residual» en la matriz."),
  );
}

function pintarTodo() {
  pintarCasos();
  pintarFiltros();
  pintarMatriz();
  pintarRegistro();
  pintarDetalle();
}

export function iniciarRiesgos() {
  $("f-categoria").addEventListener("change", (e) => {
    estado.filtros.categoria = e.target.value; estado.seleccion = null; estado.celda = null; estado.residual = null;
    pintarMatriz(); pintarRegistro(); pintarDetalle();
  });
  $("f-estrategia").addEventListener("change", (e) => {
    estado.filtros.estrategia = e.target.value; estado.seleccion = null; estado.celda = null; estado.residual = null;
    pintarMatriz(); pintarRegistro(); pintarDetalle();
  });
  $("f-limpiar").addEventListener("click", () => {
    estado.filtros = { categoria: "todas", estrategia: "todas" };
    pintarFiltros(); pintarMatriz(); pintarRegistro(); pintarDetalle();
  });
  // Arranca mostrando el riesgo más severo del primer caso, para que la página no empiece vacía.
  const masSevero = [...evaluados()].sort((a, b) => b.valor - a.valor)[0];
  estado.seleccion = masSevero.id;
  estado.celda = { p: masSevero.p, i: masSevero.i };
  pintarTodo();
}
