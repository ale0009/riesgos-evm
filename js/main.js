// Punto de entrada: tema claro/oscuro y arranque de las dos herramientas.
import { iniciarRiesgos } from "./ui-riesgos.js";
import { iniciarEvm } from "./ui-evm.js";

function temaActual() {
  const forzado = document.documentElement.dataset.theme;
  if (forzado) return forzado;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function pintarBotonTema() {
  const oscuro = temaActual() === "dark";
  const boton = document.getElementById("tema");
  boton.setAttribute("aria-pressed", String(oscuro));
  document.getElementById("tema-texto").textContent = oscuro ? "Modo claro" : "Modo oscuro";
}

document.getElementById("tema").addEventListener("click", () => {
  const nuevo = temaActual() === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = nuevo;
  try { localStorage.setItem("tema", nuevo); } catch { /* sin almacenamiento: no pasa nada */ }
  pintarBotonTema();
  document.dispatchEvent(new CustomEvent("tema-cambiado"));
});
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", pintarBotonTema);

pintarBotonTema();
iniciarRiesgos();
iniciarEvm();
