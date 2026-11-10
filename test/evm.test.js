import { test } from "node:test";
import assert from "node:assert/strict";
import { EJERCICIO_EVM as E } from "../js/datos.js";
import { lineaBase, valorPlanificado, valorGanado, metricas, simular, semaforo, repartir } from "../js/evm.js";

const cerca = (real, esperado, tol = 0.01) =>
  assert.ok(Math.abs(real - esperado) <= tol, `${real} no está a ±${tol} de ${esperado}`);

test("la línea base reproduce la tabla de PV de la fuente", () => {
  assert.equal(E.bac, E.costoSprint * E.sprints);
  assert.deepEqual(lineaBase(E), [0, 5800, 11600, 17400]);
  assert.equal(E.velocidad * E.sprints, E.totalSP);
});

test("PV, EV y AC al cierre del Sprint 2 coinciden con la fuente", () => {
  const { sprint, spCompletados, costoReal } = E.corteFuente;
  assert.equal(valorPlanificado(sprint, E), E.resultadosFuente.pv);
  assert.equal(valorGanado(spCompletados, E), E.resultadosFuente.ev);
  assert.equal(costoReal, E.resultadosFuente.ac);
});

test("CV, SV, CPI, SPI y EAC coinciden con la fuente", () => {
  const r = E.resultadosFuente;
  const m = metricas({ pv: r.pv, ev: r.ev, ac: r.ac, bac: E.bac });
  assert.equal(m.cv, r.cv);
  assert.equal(m.sv, r.sv);
  cerca(m.cpi, r.cpi, 1e-9);
  cerca(m.spi, r.spi, 1e-9);
  cerca(m.eac, r.eac);
  cerca(m.eacSpi, r.eacSpi);
  cerca(-m.vac, r.sobrecosto, 0.5); // la fuente redondea 4.028,57 a 4.029
  cerca((-m.vac / E.bac) * 100, r.sobrecostoPct, 0.05);
});

test("ETC, VAC y TCPI (no los calcula la fuente) siguen las fórmulas del PMI", () => {
  const r = E.resultadosFuente;
  const m = metricas({ pv: r.pv, ev: r.ev, ac: r.ac, bac: E.bac });
  const { bac } = E;
  cerca(m.etc, r.eac - r.ac);
  cerca(m.vac, bac - r.eac);
  cerca(m.tcpi, (bac - r.ev) / (bac - r.ac), 1e-9);
  cerca(m.tcpi, 1.4796, 1e-4);
});

test("la simulación con el reparto por defecto reproduce el corte de la fuente", () => {
  const sp = repartir(14, 2, true);
  const costo = repartir(12500, 2);
  const reales = [0, 1, 2].map((k) => ({ sp: sp[k] ?? 0, costo: costo[k] ?? 0 }));
  const s = simular(E, reales, 2);
  assert.equal(s.spAcumulados, 14);
  assert.equal(s.spPlanificados, 16);
  assert.equal(s.pv, 11600);
  assert.equal(s.ev, 10150);
  assert.equal(s.ac, 12500);
  cerca(s.eac, 21428.57);
  assert.equal(s.serie[3].ev, null, "el sprint 3 aún no se ha ejecutado");
});

test("si todo sale según el plan, los índices valen 1 y el semáforo es verde", () => {
  const reales = [1, 2, 3].map(() => ({ sp: 8, costo: 5800 }));
  const s = simular(E, reales, 3);
  assert.equal(s.cpi, 1);
  assert.equal(s.spi, 1);
  assert.equal(s.vac, 0);
  assert.equal(semaforo(s.cpi), "verde");
});

test("casos borde: sin costo no hay CPI y el presupuesto agotado deja TCPI indefinido", () => {
  const m = metricas({ pv: 5800, ev: 0, ac: 0, bac: 17400 });
  assert.equal(m.cpi, null);
  assert.equal(m.eac, null);
  assert.equal(semaforo(m.cpi), "sin-dato");
  assert.equal(metricas({ pv: 5800, ev: 5000, ac: 17400, bac: 17400 }).tcpi, null);
  assert.throws(() => simular(E, [], 0), RangeError);
});

test("semáforo con el umbral 0,8 del disparador de R06", () => {
  assert.equal(semaforo(1.05), "verde");
  assert.equal(semaforo(0.875), "ambar");
  assert.equal(semaforo(0.812), "ambar");
  assert.equal(semaforo(0.79), "rojo");
});
