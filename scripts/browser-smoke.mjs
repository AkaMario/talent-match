// Prueba visual y de navegación con Chrome local y su protocolo DevTools.
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
const base = process.env.APP_URL || "http://localhost:5173";
const userDir = mkdtempSync(join(tmpdir(), "talentmatch-browser-"));
const chrome = spawn(
  process.env.CHROME_BIN || "google-chrome",
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--remote-debugging-port=9223",
    `--user-data-dir=${userDir}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);
let socket;
let seq = 0;
const pending = new Map();
const errors = [];
async function waitFor(fn, description, timeout = 40000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const value = await fn();
      if (value) return value;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Tiempo agotado: ${description}`);
}
function command(method, params = {}) {
  return new Promise((resolve, reject) => {
    const id = ++seq;
    const timeout = setTimeout(() => {
      pending.delete(id);
      reject(new Error(`DevTools timeout: ${method}`));
    }, 30000);
    pending.set(id, {
      resolve: (v) => {
        clearTimeout(timeout);
        resolve(v);
      },
      reject,
    });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function js(expression) {
  const result = await command("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails)
    throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function textIncludes(text) {
  return js(`document.body.innerText.includes(${JSON.stringify(text)})`);
}
async function clickText(text) {
  return js(
    `(()=>{const button=[...document.querySelectorAll('button')].find(b=>b.textContent.trim()===${JSON.stringify(text)});if(!button)throw Error('Botón no encontrado');button.click();return true;})()`,
  );
}
async function screenshot(name) {
  const r = await command("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
  });
  writeFileSync(
    `artifacts/screenshots/${name}.png`,
    Buffer.from(r.data, "base64"),
  );
}
async function login(username) {
  await command("Page.navigate", { url: base });
  await waitFor(
    () => textIncludes("Ingresar a TalentMatch"),
    "pantalla inicial",
  );
  await clickText("Ingresar a TalentMatch");
  await waitFor(
    () => js('!!document.querySelector("#username")'),
    "formulario Keycloak",
  );
  await js(
    `document.querySelector('#username').value=${JSON.stringify(username)};document.querySelector('#password').value='Demo2026!';document.querySelector('#kc-login').click();`,
  );
  await waitFor(
    () =>
      textIncludes(username === "estudiante" ? "Hola, Mariana" : "Hola, Nexo"),
    "panel autenticado",
  );
}
try {
  const targets = await waitFor(async () => {
    const r = await fetch("http://localhost:9223/json/list");
    return r.json();
  }, "inicio de Chrome");
  socket = new WebSocket(
    targets.find((t) => t.type === "page").webSocketDebuggerUrl,
  );
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  socket.addEventListener("message", (e) => {
    const msg = JSON.parse(e.data);
    if (msg.id) {
      const p = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) p?.reject(new Error(msg.error.message));
      else p?.resolve(msg.result);
    } else if (msg.method === "Runtime.exceptionThrown")
      errors.push(msg.params.exceptionDetails.text);
  });
  await command("Runtime.enable");
  await command("Page.enable");
  await command("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  mkdirSync("artifacts/screenshots", { recursive: true });
  await command("Page.navigate", { url: base });
  await waitFor(() => textIncludes("Ingresar a TalentMatch"), "landing");
  await screenshot("01-inicio");
  await login("estudiante");
  await screenshot("02-estudiante");
  await clickText("Explorar prácticas");
  await waitFor(() => textIncludes("Encuentra tu próxima práctica"), "listado");
  await js(
    `document.querySelector('button[aria-label="Ver Practicante de análisis de datos"]').click()`,
  );
  await waitFor(() => textIncludes("Tus coincidencias"), "detalle de práctica");
  assert.ok(await textIncludes("Power BI"));
  await screenshot("03-brechas");
  await js(`document.querySelector('button[aria-label="Cerrar"]').click()`);
  await clickText("Mi perfil");
  await waitFor(() => textIncludes("Tus documentos"), "perfil");
  const fileInput = await command("DOM.getDocument");
  const query = await command("DOM.querySelector", {
    nodeId: fileInput.root.nodeId,
    selector: 'input[type="file"]',
  });
  await command("DOM.setFileInputFiles", {
    nodeId: query.nodeId,
    files: [resolve("documents/CV-demostracion.pdf")],
  });
  await clickText("Subir documento");
  await waitFor(
    () => textIncludes("Documento guardado."),
    "carga CV en navegador",
  );
  await command("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  await clickText("Vista general");
  await waitFor(() => textIncludes("Hola, Mariana"), "panel móvil");
  assert.ok(
    await js("document.documentElement.scrollWidth<=window.innerWidth"),
  );
  assert.ok(await js(`document.querySelector('button[aria-label="Cerrar sesión en móvil"]').getBoundingClientRect().width > 0`), 'Logout disponible en móvil');
  assert.ok(await js(`[...document.querySelectorAll('nav button')].every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth;})`), 'Toda la navegación visible en móvil');
  assert.ok(await js(`document.querySelector('.stat .stat-top span').getBoundingClientRect().left - document.querySelector('.stat > strong').getBoundingClientRect().right >= 8`), 'Valor y etiqueta del perfil separados');
  await screenshot("04-estudiante-movil");
  await command("Emulation.setDeviceMetricsOverride", {
    width: 1440,
    height: 1000,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await js(
    `document.querySelector('button[aria-label="Cerrar sesión"]').click()`,
  );
  await waitFor(
    () => textIncludes("Ingresar a TalentMatch"),
    "logout estudiante",
  );
  await login("empresa");
  await screenshot("05-empresa");
  await clickText("Candidatos");
  await waitFor(() => textIncludes("Conoce a tus candidatos"), "candidatos");
  await screenshot("06-candidatos");
  assert.deepEqual(errors, [], "Errores JavaScript del navegador");
  console.log(
    "✓ Login PKCE real para estudiante y empresa, navegación, brechas, carga CV, logout y diseño móvil sin desbordamiento.",
  );
  console.log("Capturas: artifacts/screenshots/");
} finally {
  socket?.close();
  chrome.kill("SIGTERM");
  await new Promise((r) => setTimeout(r, 500));
  rmSync(userDir, { recursive: true, force: true });
}
