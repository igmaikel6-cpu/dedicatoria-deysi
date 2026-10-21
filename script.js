
"use strict";

// Crear las estrellas decorativas.
const estrellas = document.getElementById("estrellas");

for (let i = 0; i < 38; i++) {
  const estrella = document.createElement("span");
  estrella.className = "estrella";
  estrella.textContent = Math.random() > 0.5 ? "✦" : "·";

  estrella.style.left = Math.random() * 100 + "%";
  estrella.style.top = Math.random() * 100 + "%";
  estrella.style.fontSize = (8 + Math.random() * 12) + "px";
  estrella.style.animationDelay = (Math.random() * 5) + "s";
  estrella.style.animationDuration = (3 + Math.random() * 4) + "s";

  estrellas.appendChild(estrella);
}

// Mostrar y ocultar la sorpresa final.
const botonSorpresa = document.getElementById("botonSorpresa");
const mensajeSorpresa = document.getElementById("mensajeSorpresa");

botonSorpresa.addEventListener("click", () => {
  const mostrar = mensajeSorpresa.hidden;
  mensajeSorpresa.hidden = !mostrar;

  botonSorpresa.textContent = mostrar
    ? "Cerrar sorpresa"
    : "Abrir mi última sorpresa";

  botonSorpresa.setAttribute("aria-expanded", String(mostrar));

  if (mostrar) {
    mensajeSorpresa.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
});

// Melodía instrumental generada con Web Audio API.
const botonMusica = document.getElementById("botonMusica");
const iconoMusica = document.getElementById("iconoMusica");
const textoMusica = document.getElementById("textoMusica");
const estadoMusica = document.getElementById("estadoMusica");

let contextoAudio = null;
let temporizadorMelodia = null;
let indiceNota = 0;
let reproduciendo = false;
let gananciaMaestra = null;
let generacionAudio = 0;

const melodia = [
  [523.25, 659.25, 783.99],
  [493.88, 587.33, 739.99],
  [440.00, 523.25, 659.25],
  [392.00, 493.88, 587.33],
  [440.00, 523.25, 659.25],
  [392.00, 493.88, 587.33],
  [349.23, 440.00, 523.25],
  [392.00, 493.88, 587.33],
  [523.25, 659.25, 783.99],
  [587.33, 698.46, 880.00],
  [523.25, 659.25, 783.99],
  [440.00, 523.25, 659.25],
  [493.88, 587.33, 739.99],
  [440.00, 523.25, 659.25],
  [392.00, 493.88, 587.33],
  [349.23, 440.00, 523.25]
];

function crearContextoAudio() {
  const AudioContextDisponible =
    window.AudioContext || window.webkitAudioContext;

  if (!AudioContextDisponible) {
    throw new Error("El navegador no admite audio sintetizado.");
  }

  if (!contextoAudio) {
    contextoAudio = new AudioContextDisponible();
    gananciaMaestra = contextoAudio.createGain();
    gananciaMaestra.gain.value = 0.0001;
    gananciaMaestra.connect(contextoAudio.destination);
  }

  return contextoAudio;
}

function tocarNota(frecuencia, inicio, duracion, volumen, tipo) {
  if (!contextoAudio || !gananciaMaestra) return;

  const oscilador = contextoAudio.createOscillator();
  const envolvente = contextoAudio.createGain();

  oscilador.type = tipo || "sine";
  oscilador.frequency.setValueAtTime(frecuencia, inicio);

  envolvente.gain.setValueAtTime(0.0001, inicio);
  envolvente.gain.exponentialRampToValueAtTime(
    volumen,
    inicio + 0.07
  );
  envolvente.gain.setValueAtTime(
    volumen,
    inicio + duracion * 0.55
  );
  envolvente.gain.exponentialRampToValueAtTime(
    0.0001,
    inicio + duracion
  );

  oscilador.connect(envolvente);
  envolvente.connect(gananciaMaestra);

  oscilador.start(inicio);
  oscilador.stop(inicio + duracion + 0.04);
}

function reproducirAcorde() {
  if (!reproduciendo || !contextoAudio) return;
  if (contextoAudio.state !== "running") return;

  const acorde = melodia[indiceNota % melodia.length];
  const ahora = contextoAudio.currentTime;

  tocarNota(acorde[0], ahora, 1.8, 0.075, "sine");
  tocarNota(acorde[1], ahora + 0.22, 1.7, 0.045, "sine");
  tocarNota(acorde[2], ahora + 0.45, 2.0, 0.035, "triangle");
  tocarNota(acorde[0] / 2, ahora, 2.2, 0.025, "sine");

  indiceNota++;
}

async function iniciarMusica() {
  crearContextoAudio();

  if (contextoAudio.state === "suspended") {
    await contextoAudio.resume();
  }

  if (reproduciendo) return;

  reproduciendo = true;
  generacionAudio++;
  indiceNota = 0;

  const miGeneracion = generacionAudio;
  const ahora = contextoAudio.currentTime;

  gananciaMaestra.gain.cancelScheduledValues(ahora);
  gananciaMaestra.gain.setValueAtTime(0.0001, ahora);
  gananciaMaestra.gain.linearRampToValueAtTime(0.20, ahora + 0.25);

  reproducirAcorde();

  temporizadorMelodia = window.setInterval(() => {
    if (miGeneracion === generacionAudio && reproduciendo) {
      reproducirAcorde();
    }
  }, 1700);

  iconoMusica.textContent = "Ⅱ";
  textoMusica.textContent = "Pausar melodía";
  botonMusica.setAttribute("aria-pressed", "true");
  estadoMusica.textContent = "Melodía sonando para ti ♡";
}

function detenerMusica() {
  reproduciendo = false;
  generacionAudio++;

  if (temporizadorMelodia !== null) {
    window.clearInterval(temporizadorMelodia);
    temporizadorMelodia = null;
  }

  if (gananciaMaestra && contextoAudio) {
    const ahora = contextoAudio.currentTime;

    gananciaMaestra.gain.cancelScheduledValues(ahora);
    gananciaMaestra.gain.setTargetAtTime(0.0001, ahora, 0.04);
  }

  iconoMusica.textContent = "▶";
  textoMusica.textContent = "Reproducir melodía";
  botonMusica.setAttribute("aria-pressed", "false");
  estadoMusica.textContent = "Melodía pausada.";
}

botonMusica.addEventListener("click", async () => {
  if (reproduciendo) {
    detenerMusica();
    return;
  }

  try {
    await iniciarMusica();
  } catch (error) {
    detenerMusica();
    estadoMusica.textContent =
      "No se pudo iniciar el audio. Inténtalo otra vez en Chrome.";
  }
});

// Pausar la melodía cuando se oculta la página.
document.addEventListener("visibilitychange", () => {
  if (document.hidden && reproduciendo) {
    detenerMusica();
  }
});
