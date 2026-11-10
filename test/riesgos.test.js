import { test } from "node:test";
import assert from "node:assert/strict";
import { CASO_PROVEEDOR as C1, CASO_ACADEMICO as C2 } from "../js/datos.js";
import {
  severidad, nivelDe, evaluar, discrepancias, filtrar, valoresUnicos,
  conteoPorNivel, matrizCalor, compararResidual, esNivelMaximo,
} from "../js/riesgos.js";

test("caso 1: doce riesgos con el nivel que declara la fuente", () => {
  assert.equal(C1.riesgos.length, 12);
  assert.deepEqual(discrepancias(C1.riesgos, C1.escala), []);
});

test("caso 1: 6 Alto, 5 Medio y 1 Bajo, como dicen las conclusiones", () => {
  const c = conteoPorNivel(evaluar(C1.riesgos, C1.escala), C1.escala);
  assert.deepEqual(c, { Bajo: 1, Medio: 5, Alto: 6 });
  const altos = evaluar(C1.riesgos, C1.escala).filter((r) => r.nivel === "Alto").map((r) => r.id);
  assert.deepEqual(altos, ["R01", "R02", "R03", "R04", "R05", "R11"]);
});

test("caso 1: 10 mitigar, 1 evitar (R07), 1 aceptar (R09), 0 transferir", () => {
  assert.equal(filtrar(C1.riesgos, { estrategia: "Mitigar" }).length, 10);
  assert.deepEqual(filtrar(C1.riesgos, { estrategia: "Evitar" }).map((r) => r.id), ["R07"]);
  assert.deepEqual(filtrar(C1.riesgos, { estrategia: "Aceptar" }).map((r) => r.id), ["R09"]);
  assert.equal(filtrar(C1.riesgos, { estrategia: "Transferir" }).length, 0);
});

test("caso 1: el texto dice 'seis categorías' pero el registro tiene siete (fe de erratas)", () => {
  assert.equal(valoresUnicos(C1.riesgos, "categoria").length, 7);
});

test("caso 2: niveles del taller (2 Crítico, 6 Alto, 4 Medio, 0 Bajo)", () => {
  assert.deepEqual(discrepancias(C2.riesgos, C2.escala), []);
  const c = conteoPorNivel(evaluar(C2.riesgos, C2.escala), C2.escala);
  assert.deepEqual(c, { Bajo: 0, Medio: 4, Alto: 6, "Crítico": 2 });
});

test("caso 2: la matriz de calor reproduce la del taller", () => {
  const m = matrizCalor(evaluar(C2.riesgos, C2.escala), C2.escala);
  const celda = (p, i) => m[5 - p][i - 1].ids;
  assert.deepEqual(celda(5, 4), ["R01"]);
  assert.deepEqual(celda(4, 4), ["R03", "R06"]);
  assert.deepEqual(celda(4, 5), ["R04"]);
  assert.deepEqual(celda(3, 3), ["R09", "R10"]);
  assert.deepEqual(celda(3, 4), ["R05", "R12"]);
  assert.deepEqual(celda(3, 5), ["R02", "R07"]);
  assert.deepEqual(celda(2, 5), ["R08", "R11"]);
  assert.equal(m[0][4].nivel, "Crítico");
});

test("escalas y funciones básicas", () => {
  assert.equal(severidad(3, 5), 15);
  assert.throws(() => severidad(0, 3), RangeError);
  assert.throws(() => severidad(2.5, 3), RangeError);
  assert.equal(nivelDe(10, C1.escala), "Alto");
  assert.equal(nivelDe(9, C1.escala), "Medio");
  assert.equal(nivelDe(4, C1.escala), "Bajo");
  assert.equal(nivelDe(20, C2.escala), "Crítico");
  assert.ok(esNivelMaximo("Alto", C1.escala));
  assert.ok(!esNivelMaximo("Alto", C2.escala));
  assert.equal(filtrar(C1.riesgos, { categoria: "Técnico", estrategia: "todas" }).length, 3);
});

test("el residual no se inventa: sin datos devuelve null", () => {
  const r01 = C1.riesgos[0];
  assert.equal(compararResidual(r01, null, C1.escala), null);
  const s = compararResidual(r01, { p: 2, i: 4 }, C1.escala);
  assert.deepEqual(s, { antes: 16, despues: 8, nivelAntes: "Alto", nivelDespues: "Medio", reduccion: 8, reduccionPct: 50 });
});
