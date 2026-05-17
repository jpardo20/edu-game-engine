import { pintaMarcador } from "./render/renderScoreboard.js";
import { renderBoard } from "./render/renderBoard.js";
// import { resetDice, rollDice, seguentTorn, shuffle, moveStepByStep } from "./core/gameEngine.js";
import { resetDice, rollDice, shuffle } from "./core/gameEngine.js";


// ======================================================
// LA BASSA DIGITAL
// ------------------------------------------------------
// Aquest fitxer conté tota la lògica principal del joc:
// - càrrega de dades JSON
// - generació d’equips
// - renderització del tauler
// - moviment de fitxes
// - sistema de preguntes
// - puntuacions
// - persistència amb localStorage
// ======================================================
import Equip from "./core/Equip.js";
import Partida from "./core/Partida.js";

const partida = new Partida();

partida.inici();

// ======================================================
// CONFIGURACIÓ GLOBAL
// ======================================================

const preguntesFetes = {};

let equips = [];

const elements = {
    taulell: document.getElementById("board"),
    dau: document.getElementById("dice"),
    marcador: document.getElementById("scores"),
    torn: document.getElementById("turn"),
    overlay: document.getElementById("overlay"),
    choices: document.getElementById("choices"),
    timer: document.getElementById("timer"),
    setup: document.getElementById("setup"),
    previewEquips: document.getElementById("teamsPreview")
};



// ======================================================
// EVENTS DE BOTONS
// ======================================================

document.getElementById("shuffleBtn")
    .addEventListener("click", buildRandomTeams);

document.getElementById("startBtn")
    .addEventListener("click", iniciaPartida);

document.getElementById("clearTeamsBtn")
    .addEventListener("click", netejaSistema);

document.getElementById("resetGameBtn")
    .addEventListener("click", resetGame);

document.getElementById("diceBtn")
    .addEventListener("click", () => {

        rollDice(
            elements,
            () => equips[equipActiu],
            moveStepByStep
        );
    });

document.getElementById("fullResetGameBtn")
    .addEventListener("click", reiniciComplet);


// ======================================================
// VARIABLES GLOBALS D'ESTAT
// ======================================================

let equipActiu = 0;
let quantitatDeTorns = 0;
let interval;

let preguntes = {};

let config = {};
let tempsPerTorn;
let columnesTaulell;
let tipusCaselles;
let casellesTotals;

let taulell = [];


// ======================================================
// CREACIÓ DEL TAULER
// ======================================================

function creaTaulell() {

    taulell = [...Array(casellesTotals)].map((_, i) => {

        if (i === 0) {
            return { type: "start" };
        }

        if (i === casellesTotals - 1) {
            return { type: "final" };
        }

        return {
            type: tipusCaselles[
                i % tipusCaselles.length
            ]
        };
    });
}


// ======================================================
// ALUMNES
// ======================================================

let alumnesData = [];


/**
 * Carrega el fitxer alumnes.json.
 */
async function carregaAlumnes() {

    try {

        const res = await fetch("data/alumnes.json");
        const data = await res.json();

        alumnesData = data.alumnes;

        ompleTextarea();

    } catch (err) {

        console.error("Error carregant alumnes:", err);
    }
}


/**
 * Omple el textarea de la pantalla inicial
 * amb els noms dels alumnes carregats.
 */
function ompleTextarea() {

    const textarea = document.getElementById("studentsInput");

    textarea.value = alumnesData
        .map(a => `${a.firstname} ${a.lastname}`)
        .join("\n");
}


// ======================================================
// GUARDAR / CARREGAR PARTIDA
// ======================================================

function guardaPartida() {

    const data = {
        equips,
        active: equipActiu,
        turns: quantitatDeTorns
    };

    localStorage.setItem(
        "bassaGame",
        JSON.stringify(data)
    );
}


function carregaPartida() {

    const data = localStorage.getItem("bassaGame");

    if (!data) return null;

    try {

        return JSON.parse(data);

    } catch {

        return null;
    }
}


function guardaEquips() {

    localStorage.setItem(
        "bassaTeams",
        JSON.stringify(equips)
    );
}


function carregaEquips() {

    const data = localStorage.getItem("bassaTeams");

    if (!data) return null;

    try {

        return JSON.parse(data);

    } catch {

        return null;
    }
}


function netejaSistema() {

    localStorage.removeItem("bassaTeams");
    localStorage.removeItem("bassaGame");

    equips = [];

    equipActiu = 0;
    quantitatDeTorns = 0;

    elements.previewEquips.innerHTML = "";

    renderBoard(
        elements,
        taulell,
        equips,
        equipActiu,
        columnesTaulell,
        pintaMarcador
    );
}


function reiniciComplet() {

    localStorage.removeItem("bassaGame");
    localStorage.removeItem("bassaTeams");

    equipActiu = 0;
    quantitatDeTorns = 0;

    equips.forEach(equip => {

        equip.posicioTaulell = 0;
        equip.barra1 = 0;
        equip.barra2 = 0;
    });

    elements.setup.style.display = "flex";

    pintaPreviewEquips();

    renderBoard(
        elements,
        taulell,
        equips,
        equipActiu,
        columnesTaulell,
        pintaMarcador
    );
}


function resetGame() {

    equips.forEach(equip => {

        equip.posicioTaulell = 0;
        equip.barra1 = 0;
        equip.barra2 = 0;
    });

    equipActiu = 0;
    quantitatDeTorns = 0;

    localStorage.removeItem("bassaGame");

    guardaEquips();

    renderBoard(
        elements,
        taulell,
        equips,
        equipActiu,
        columnesTaulell,
        pintaMarcador
    );

    elements.setup.style.display = "none";
}


// ======================================================
// PREGUNTES
// ======================================================

async function carregaPreguntes() {

    const res = await fetch("./data/preguntes.json");

    preguntes = await res.json();
}


// ======================================================
// RENDER DEL TAULER
// ======================================================

function moveStepByStep(equip, steps) {

    let count = 0;

    const move = setInterval(() => {

        if (
            count >= steps
            || equip.posicioTaulell >= casellesTotals - 1
        ) {

            clearInterval(move);
            renderBoard(
                elements,
                taulell,
                equips,
                equipActiu,
                columnesTaulell,
                pintaMarcador
            );

            setTimeout(() => gestionaEventCasella(), 500);


            return;
        }

        equip.posicioTaulell++;

        renderBoard(
            elements,
            taulell,
            equips,
            equipActiu,
            columnesTaulell,
            pintaMarcador
        );

        count++;

    }, 250);
}


// ======================================================
// DAU
// ======================================================




// ======================================================
// EVENTS DE CASELLES
// ======================================================

function gestionaEventCasella() {

    const t = equips[equipActiu];

    const casellaActual = taulell[t.posicioTaulell];

    if (!casellaActual) {

        console.error(
            "Casella inexistent:",
            t.posicioTaulell
        );

        return;
    }

    const type = casellaActual.type;

    if (type === "start") {

        seguentTorn();

        return;
    }

    if (type === "final") {

        const finalQ = preguntes.final?.[0];

        showModal(finalQ);

        return;
    }

    const pool = preguntes[type];

    if (!pool || pool.length === 0) {

        console.warn("Sense preguntes per:", type);

        seguentTorn();

        return;
    }

    const data = getRandomQuestion(type);

    showModal(data);
}


// ======================================================
// MODAL DE PREGUNTES
// ======================================================

function showModal(data) {

    elements.overlay.classList.add("show");

    document.getElementById("title").innerText = data.title;
    document.getElementById("text").innerText = data.text;

    elements.choices.innerHTML = "";

    data.choices.forEach(opt => {

        const b = document.createElement("button");

        b.className = "choice";
        b.innerText = opt.text;

        b.onclick = () => {

            const t = equips[equipActiu];

            t.barra1 += opt.barra1 || 0;
            t.barra2 += opt.barra2 || 0;

            elements.overlay.classList.remove("show");

            clearInterval(interval);

            quantitatDeTorns++;

            if (quantitatDeTorns % 3 === 0) {
                unfair();
            }

            guardaPartida();

            seguentTorn();
        };

        elements.choices.appendChild(b);
    });

    startTimer();
}


// ======================================================
// PREGUNTA ALEATÒRIA
// ======================================================

function getRandomQuestion(type) {

    if (!preguntesFetes[type]) {
        preguntesFetes[type] = [];
    }

    const pool = preguntes[type];

    const available = pool.filter(
        (_, i) => !preguntesFetes[type].includes(i)
    );

    if (available.length === 0) {

        preguntesFetes[type] = [];

        return getRandomQuestion(type);
    }

    const index = Math.floor(
        Math.random() * available.length
    );

    const q = available[index];

    preguntesFetes[type].push(pool.indexOf(q));

    return q;
}


// ======================================================
// TIMER
// ======================================================

function startTimer() {

    let time = tempsPerTorn;

    if (!elements.timer) return;

    clearInterval(interval);

    interval = setInterval(() => {

        time--;

        if (time > 5) {

            elements.timer.innerText =
                `${time}s → decidiu`;

            elements.timer.style.color = "orange";

        } else if (time > 0) {

            elements.timer.innerText = `⚠️ ${time}s`;

            elements.timer.style.color = "red";

        } else {

            elements.timer.innerText =
                "Temps! Porta veu!";

            clearInterval(interval);
        }

    }, 1000);
}


// ======================================================
// SISTEMA INJUST
// ======================================================

function unfair() {

    const sorted = [...equips]
        .sort((a, b) => b.barra1 - a.barra1);

    sorted[0].barra1 += 2;

    sorted[sorted.length - 1].barra1 -= 1;
}


// ======================================================
// CANVI DE TORN
// ======================================================

function seguentTorn() {

    equipActiu = (equipActiu + 1) % equips.length;

    elements.dau.innerText = "🎲";

    renderBoard(
        elements,
        taulell,
        equips,
        equipActiu,
        columnesTaulell,
        pintaMarcador
    );

    resetDice(elements);

    guardaPartida();
}





// ======================================================
// MOVIMENT ANIMAT
// ======================================================



// ======================================================
// ALUMNES / EQUIPS
// ======================================================

function getStudentsObjects() {

    return alumnesData;
}





function buildRandomTeams() {

    const students = getStudentsObjects();

    const names = [
        "A - Grup A",
        "B - Grup B",
        "C - Grup C",
        "D - Grup D"
    ];

    const colors = [
        "green",
        "blue",
        "red",
        "purple"
    ];

    equips = names.map((n, i) => {

        const equip = new Equip(n);

        equip.color = colors[i];

        return equip;
    });

    const dam = students.filter(
        s => s.grup === "DAM"
    );

    const smx = students.filter(
        s => s.grup === "SMX"
    );

    const damShuffled = shuffle(dam);
    const smxShuffled = shuffle(smx);

    if (
        damShuffled.length < equips.length
        || smxShuffled.length < equips.length
    ) {

        alert(
            "No hi ha prou alumnes de cada grup per garantir barreja!"
        );
    }

    equips.forEach((t, i) => {

        if (damShuffled[i]) {
            t.membresEq.push(damShuffled[i]);
        }
    });

    equips.forEach((t, i) => {

        if (smxShuffled[i]) {
            t.membresEq.push(smxShuffled[i]);
        }
    });

    const remaining = [
        ...damShuffled.slice(equips.length),
        ...smxShuffled.slice(equips.length)
    ];

    shuffle(remaining);

    remaining.forEach((s, i) => {

        equips[i % equips.length]
            .membresEq.push(s);
    });

    pintaPreviewEquips();

    guardaEquips();
}


function pintaPreviewEquips() {

    elements.previewEquips.innerHTML = equips.map(equip => `
        <div style="margin-bottom:10px">
            <strong style="color:${equip.color}">
                ${equip.nomEq}
            </strong><br>

            ${equip.membresEq
            .map(m => `${m.firstname} ${m.lastname}`)
            .join(", ")}
        </div>
    `).join("");
}


function iniciaPartida() {

    elements.setup
        .style.display = "none";

    equipActiu = 0;
    quantitatDeTorns = 0;

    equips.forEach(t => {

        t.posicioTaulell = 0;
        t.barra1 = 0;
        t.barra2 = 0;
    });

    renderBoard(
        elements,
        taulell,
        equips,
        equipActiu,
        columnesTaulell,
        pintaMarcador
    );

    guardaPartida();
}


// ======================================================
// INIT
// ======================================================

async function carregaConfiguracio() {

    const res = await fetch("./data/config.json");

    config = await res.json();

    tempsPerTorn = config.tempsPerTorn;
    columnesTaulell = config.columnesTaulell;
    tipusCaselles = config.tipusCaselles;
    casellesTotals = config.casellesTotals;

    window.casellesTotals = casellesTotals;
}


async function init() {

    await carregaConfiguracio();

    creaTaulell();

    await carregaPreguntes();

    await carregaAlumnes();

    const loadedGame = carregaPartida();

    if (loadedGame) {

        equips = loadedGame.equips;

        equipActiu = loadedGame.active;

        quantitatDeTorns = loadedGame.turns;

        elements.setup
            .style.display = "none";

        renderBoard(
            elements,
            taulell,
            equips,
            equipActiu,
            columnesTaulell,
            pintaMarcador
        );

        return;
    }

    const loadedTeams = carregaEquips();

    if (loadedTeams) {

        equips = loadedTeams;

        pintaPreviewEquips();

        return;
    }

    buildRandomTeams();

    renderBoard(
        elements,
        taulell,
        equips,
        equipActiu,
        columnesTaulell,
        pintaMarcador
    );
}


// Inicialitzar aplicació

window.elements = elements;
window.equips = equips;
// window.equipActiu = equipActiu;
window.taulell = taulell;
window.columnesTaulell = columnesTaulell;
window.pintaMarcador = pintaMarcador;
window.gestionaEventCasella = gestionaEventCasella;
window.guardaPartida = guardaPartida;

init();