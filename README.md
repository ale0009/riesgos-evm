# Control de proyectos TIC

**Español** · [English](README.en.md)

Página estática e interactiva con dos herramientas de gerencia de proyectos, construidas a partir de trabajos académicos reales de Ingeniería de Sistemas:

- **A. Tablero de riesgos.** Registro de 12 riesgos por caso, matriz de calor P × I clicable, filtros por categoría y estrategia, detalle de cada riesgo (disparador, respuesta, contingencia, responsable, indicador) y un «¿qué pasa si aplico la respuesta?» que **no inventa el riesgo residual**: como la fuente no lo trae, deja que el visitante proponga su hipótesis y la rotula como tal.
- **B. Simulador de valor ganado (EVM).** Mueves el avance (puntos de historia) y el costo real de cada sprint y ves en vivo PV, EV, AC, CV, SV, CPI, SPI, EAC, ETC, VAC y TCPI, con curvas S en SVG propio y semáforo.

Incluye una **fe de erratas** con las incoherencias encontradas en los documentos de origen, en lugar de esconderlas.

## Glosario mínimo

| Sigla | Qué es |
|---|---|
| P × I | Probabilidad por impacto (1 a 5 cada una): severidad del riesgo. |
| BAC | *Budget at Completion*: presupuesto total aprobado. |
| PV | *Planned Value*: valor del trabajo que debía estar hecho al corte. |
| EV | *Earned Value*: valor del trabajo realmente terminado. |
| AC | *Actual Cost*: lo gastado hasta el corte. |
| CV / SV | Variación de costo (EV − AC) y de cronograma (EV − PV). |
| CPI / SPI | Índices de costo (EV / AC) y de cronograma (EV / PV). |
| EAC / ETC | Costo final estimado (BAC / CPI) y lo que falta por gastar (EAC − AC). |
| VAC | Variación al terminar (BAC − EAC). |
| TCPI | Eficiencia necesaria en lo que falta para no pasarse: (BAC − EV) / (BAC − AC). |

## Datos y origen

| Dato | Origen |
|---|---|
| Caso 1: 12 riesgos, escala Alto ≥ 10 / Medio 5–9 / Bajo ≤ 4, plan de respuesta e indicadores | Plan de gestión de riesgos (PMBOK 7 + ISO 31000) para un proveedor regional de servicios gestionados y data centers (caso de estudio, anonimizado). |
| Caso 2: 12 riesgos, escala de 4 niveles con Crítico 20–25 | Taller de matriz de riesgos para un sistema web de gestión académica. |
| 24 SP, 8 SP/sprint, 3 sprints, 5.800 USD/sprint, BAC 17.400 USD; corte al Sprint 2: 14 SP y 12.500 USD | Ejercicio de EVM ágil para una empresa logística (caso didáctico). |

Resultados de la fuente que reproducen las pruebas: PV 11.600 · EV 10.150 · AC 12.500 · CV −2.350 · SV −1.450 · CPI 0,812 · SPI 0,875 · EAC 21.428,57 · EAC(SPI) 19.885,71 USD.

## Estructura

```
index.html          página (sin build)
css/estilo.css      estilo "Tinta y trama", modo claro y oscuro
js/datos.js         datos de los casos (anonimizados)
js/riesgos.js       lógica pura del tablero
js/evm.js           lógica pura del EVM
js/ui-*.js, js/grafica.js, js/main.js   interfaz
test/*.test.js      pruebas con node --test
```

## Uso local

```bash
python3 -m http.server 8000   # y abrir http://localhost:8000
node --test                   # pruebas (Node 20 o superior)
```

Para publicarla en GitHub Pages basta con servir la rama `main` desde la raíz.

## Accesibilidad

Contraste AA, navegación completa con teclado, foco visible, niveles de riesgo codificados con color **y** trama/texto, gráfica con resumen accesible y tabla de datos, `prefers-reduced-motion` y `prefers-color-scheme` respetados, sin scroll horizontal de 390 a 1440 px.

## Créditos

Trabajos académicos de Mario Puerta y David Rincón «Kuronoma» (Ingeniería de Sistemas, Universidad ECCI). [David Rincón «Kuronoma» en LinkedIn](https://www.linkedin.com/in/davidalexanderrinconcorredorkuronoma/).

Licencia MIT © 2026 Mario Alejandro Puerta Alarcón.
