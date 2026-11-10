// Tema claro/oscuro compartido por la herramienta (/) y la página de proceso (/proceso/).
// El tema guardado se aplica antes de pintar con un <script> en línea en cada HTML.

export function temaActual() {
  const forzado = document.documentElement.dataset.theme;
  if (forzado) return forzado;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Conecta el botón #tema (con su texto en #tema-texto) y avisa con el evento "tema-cambiado". */
export function iniciarTema() {
  const boton = document.getElementById("tema");
  const texto = document.getElementById("tema-texto");
  if (!boton) return;
  const pintar = () => {
    const oscuro = temaActual() === "dark";
    boton.setAttribute("aria-pressed", String(oscuro));
    if (texto) texto.textContent = oscuro ? "Modo claro" : "Modo oscuro";
  };
  boton.addEventListener("click", () => {
    const nuevo = temaActual() === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nuevo;
    try { localStorage.setItem("tema", nuevo); } catch { /* sin almacenamiento: no pasa nada */ }
    pintar();
    document.dispatchEvent(new CustomEvent("tema-cambiado"));
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", pintar);
  pintar();
}
