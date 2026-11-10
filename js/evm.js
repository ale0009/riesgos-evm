// Lógica del simulador de valor ganado (EVM): funciones puras, sin acceso al DOM.
// Fórmulas estándar del PMI. Los resultados sin redondear; el redondeo es cosa de la vista.

/** Línea base: valor planificado acumulado al cierre de cada sprint (sprint 0 = inicio). */
export function lineaBase({ sprints, costoSprint }) {
  return Array.from({ length: sprints + 1 }, (_, k) => k * costoSprint);
}

/** PV (Planned Value) acumulado al cierre del sprint `corte`. */
export function valorPlanificado(corte, { costoSprint, sprints }) {
  if (corte < 0 || corte > sprints) throw new RangeError("Corte fuera del proyecto");
  return corte * costoSprint;
}

/** EV (Earned Value) = (SP completados / SP totales) x BAC. */
export function valorGanado(spCompletados, { totalSP, bac }) {
  return (spCompletados / totalSP) * bac;
}

const div = (a, b) => (b === 0 ? null : a / b);

/**
 * Métricas EVM a partir de los acumulados al corte.
 * @param {{pv:number, ev:number, ac:number, bac:number}} v
 */
export function metricas({ pv, ev, ac, bac }) {
  const cv = ev - ac;
  const sv = ev - pv;
  const cpi = div(ev, ac);
  const spi = div(ev, pv);
  const eac = cpi ? bac / cpi : null; // supone que la eficiencia de costo actual se mantiene
  const etc = eac == null ? null : eac - ac;
  const vac = eac == null ? null : bac - eac;
  const tcpi = div(bac - ev, bac - ac); // null si ya se gastó todo el presupuesto
  const eacSpi = spi ? bac / spi : null; // variante que usa la fuente (ver fe de erratas)
  const eacCpiSpi = cpi && spi ? ac + (bac - ev) / (cpi * spi) : null; // variante estándar PMI
  return { pv, ev, ac, bac, cv, sv, cpi, spi, eac, etc, vac, tcpi, eacSpi, eacCpiSpi };
}

/**
 * Simula el proyecto sprint a sprint.
 * @param {object} base  datos del ejercicio (totalSP, sprints, costoSprint, bac)
 * @param {{sp:number, costo:number}[]} reales  avance y costo real de CADA sprint (no acumulados)
 * @param {number} corte  último sprint ejecutado (1..sprints)
 */
export function simular(base, reales, corte) {
  if (!Number.isInteger(corte) || corte < 1 || corte > base.sprints) {
    throw new RangeError(`El corte debe estar entre 1 y ${base.sprints}`);
  }
  const serie = [{ sprint: 0, pv: 0, ev: 0, ac: 0, sp: 0 }];
  let sp = 0;
  let ac = 0;
  for (let k = 1; k <= base.sprints; k++) {
    const pv = valorPlanificado(k, base);
    if (k <= corte) {
      sp = Math.min(base.totalSP, sp + (reales[k - 1]?.sp ?? 0));
      ac += reales[k - 1]?.costo ?? 0;
      serie.push({ sprint: k, pv, ev: valorGanado(sp, base), ac, sp });
    } else {
      serie.push({ sprint: k, pv, ev: null, ac: null, sp: null });
    }
  }
  const actual = serie[corte];
  return {
    serie,
    spAcumulados: sp,
    spPlanificados: corte * (base.totalSP / base.sprints),
    ...metricas({ pv: actual.pv, ev: actual.ev, ac: actual.ac, bac: base.bac }),
  };
}

/**
 * Semáforo de un índice (CPI o SPI).
 * verde >= 1; ámbar entre 0,8 y 1; rojo < 0,8.
 * El umbral 0,8 es el disparador del riesgo R06 del caso de riesgos ("SPI inferior a 0,8").
 */
export function semaforo(indice) {
  if (indice == null || Number.isNaN(indice)) return "sin-dato";
  if (indice >= 1) return "verde";
  if (indice >= 0.8) return "ambar";
  return "rojo";
}

/** Reparte un acumulado en partes iguales entre n sprints (enteros para SP). */
export function repartir(total, n, entero = false) {
  if (!entero) return Array.from({ length: n }, () => total / n);
  const base = Math.floor(total / n);
  const resto = total - base * n;
  return Array.from({ length: n }, (_, k) => base + (k < resto ? 1 : 0));
}
