// Lógica del tablero de riesgos: funciones puras, sin acceso al DOM.

/** Severidad = probabilidad x impacto (escala 1 a 5 cada uno). */
export function severidad(p, i) {
  if (![p, i].every((v) => Number.isInteger(v) && v >= 1 && v <= 5)) {
    throw new RangeError(`P e I deben ser enteros de 1 a 5 (recibido P=${p}, I=${i})`);
  }
  return p * i;
}

/** Devuelve el nombre del nivel según la escala del caso (lista de rangos {nivel, min, max}). */
export function nivelDe(valor, escala) {
  const tramo = escala.find((t) => valor >= t.min && valor <= t.max);
  if (!tramo) throw new RangeError(`El valor ${valor} no cae en ningún tramo de la escala`);
  return tramo.nivel;
}

/** Posición del nivel en la escala (0 = el más bajo). Sirve para colorear y ordenar. */
export function rangoNivel(nivel, escala) {
  return escala.findIndex((t) => t.nivel === nivel);
}

/** Es el nivel más alto de la escala (en el caso 1 es "Alto", en el caso 2 "Crítico"). */
export function esNivelMaximo(nivel, escala) {
  return rangoNivel(nivel, escala) === escala.length - 1;
}

/** Enriquece cada riesgo con severidad y nivel calculados. */
export function evaluar(riesgos, escala) {
  return riesgos.map((r) => {
    const valor = severidad(r.p, r.i);
    return { ...r, valor, nivel: nivelDe(valor, escala) };
  });
}

/** Riesgos cuyo nivel calculado no coincide con el que declara la fuente (para la fe de erratas). */
export function discrepancias(riesgos, escala) {
  return evaluar(riesgos, escala).filter((r) => r.nivelFuente && r.nivel !== r.nivelFuente);
}

/** Filtra por categoría y estrategia; "todas" (o vacío) no filtra. */
export function filtrar(riesgos, { categoria = "todas", estrategia = "todas" } = {}) {
  return riesgos.filter(
    (r) =>
      (!categoria || categoria === "todas" || r.categoria === categoria) &&
      (!estrategia || estrategia === "todas" || r.estrategia === estrategia),
  );
}

/** Valores distintos de un campo, en orden de aparición. */
export function valoresUnicos(riesgos, campo) {
  return [...new Set(riesgos.map((r) => r[campo]))];
}

/** Cuenta riesgos por nivel, con todos los niveles de la escala presentes (aunque valgan 0). */
export function conteoPorNivel(riesgosEvaluados, escala) {
  const conteo = Object.fromEntries(escala.map((t) => [t.nivel, 0]));
  for (const r of riesgosEvaluados) conteo[r.nivel] += 1;
  return conteo;
}

/**
 * Matriz de calor 5x5. Filas de P=5 (arriba) a P=1; columnas de I=1 a I=5.
 * Cada celda: { p, i, valor, nivel, ids: [...] }.
 */
export function matrizCalor(riesgosEvaluados, escala) {
  const filas = [];
  for (let p = 5; p >= 1; p--) {
    const fila = [];
    for (let i = 1; i <= 5; i++) {
      const valor = p * i;
      fila.push({
        p, i, valor,
        nivel: nivelDe(valor, escala),
        ids: riesgosEvaluados.filter((r) => r.p === p && r.i === i).map((r) => r.id),
      });
    }
    filas.push(fila);
  }
  return filas;
}

/**
 * Escenario "¿qué pasa si...?": compara el riesgo inherente con un riesgo residual.
 * El residual SOLO se calcula si alguien lo aporta (la fuente o el visitante); aquí no se inventa.
 * Devuelve null si no hay residual.
 */
export function compararResidual(riesgo, residual, escala) {
  if (!residual || residual.p == null || residual.i == null) return null;
  const antes = severidad(riesgo.p, riesgo.i);
  const despues = severidad(residual.p, residual.i);
  return {
    antes, despues,
    nivelAntes: nivelDe(antes, escala),
    nivelDespues: nivelDe(despues, escala),
    reduccion: antes - despues,
    reduccionPct: Math.round(((antes - despues) / antes) * 1000) / 10,
  };
}

/** Qué busca cada estrategia según la definición que trae la propia fuente (PMBOK 7 / ISO 31000). */
export const EFECTO_ESTRATEGIA = {
  Evitar: "Eliminar la amenaza modificando el plan del proyecto.",
  Transferir: "Trasladar el impacto a un tercero mediante seguros o contratos.",
  Mitigar: "Reducir la probabilidad o el impacto hasta un umbral aceptable.",
  Aceptar: "Reconocer el riesgo sin acción proactiva, normalmente con un plan de contingencia.",
};
