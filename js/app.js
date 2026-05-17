import { pintaMarcador } from "./render/renderScoreboard.js";
import { renderBoard } from "./render/renderBoard.js";
import { resetDice, rollDice, shuffle } from "./core/gameEngine.js";
import { gameState } from "./core/gameState.js";
import { saveGame, loadGame, saveTeams, loadTeams } from "./core/persistence.js";
import { showModal, startTimer } from "./core/modalService.js";
import { seguentTorn, gestionaEventCasella } from "./core/gameController.js";

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
            () => gameState.equips[gameState.equipActiu],
            moveStepByStep
        );
    });

document.getElementById("fullResetGameBtn")
    .addEventListener("click", reiniciComplet);


// ======================================================
// VARIABLES GLOBALS D'ESTAT
// ======================================================



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

function getCategoryLabel(id) {

    const found =
        gameState.config.tipusCaselles
            .find(t => t.id === id);

    return found
        ? found.label
        : id;
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

    saveGame({
        equips: gameState.equips,
        active: gameState.equipActiu,
        turns: gameState.quantitatDeTorns
    });
}


function carregaPartida() {

    return loadGame();

}


function guardaEquips() {

    saveTeams(gameState.equips);
}


function carregaEquips() {

    return loadTeams();
}


function netejaSistema() {

    localStorage.removeItem("bassaTeams");
    localStorage.removeItem("bassaGame");

    gameState.equips = [];

    gameState.equipActiu = 0;
    gameState.quantitatDeTorns = 0;

    elements.previewEquips.innerHTML = "";

    renderBoard(
        elements,
        taulell,
        gameState.equips,
        gameState.equipActiu,
        columnesTaulell,
        pintaMarcador
    );
}


function reiniciComplet() {

    localStorage.removeItem("bassaGame");
    localStorage.removeItem("bassaTeams");

    gameState.equipActiu = 0;
    gameState.quantitatDeTorns = 0;

    gameState.equips.forEach(equip => {

        equip.posicioTaulell = 0;
        equip.barra1 = 0;
        equip.barra2 = 0;
    });

    elements.setup.style.display = "flex";

    pintaPreviewEquips();

    renderBoard(
        elements,
        taulell,
        gameState.equips,
        gameState.equipActiu,
        columnesTaulell,
        pintaMarcador
    );
}


function resetGame() {

    gameState.equips.forEach(equip => {

        equip.posicioTaulell = 0;
        equip.barra1 = 0;
        equip.barra2 = 0;
    });

    gameState.equipActiu = 0;
    gameState.quantitatDeTorns = 0;

    localStorage.removeItem("bassaGame");

    guardaEquips();

    renderBoard(
        elements,
        taulell,
        gameState.equips,
        gameState.equipActiu,
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
                gameState.equips,
                gameState.equipActiu,
                columnesTaulell,
                pintaMarcador
            );

            setTimeout(() => {

                gestionaEventCasella(
                    gameState,
                    taulell,
                    preguntes,
                    getRandomQuestion,
                    (data) => showModal(
                        data,
                        elements,
                        gameState,
                        () => startTimer(elements, tempsPerTorn),
                        () => {

                            gameState.quantitatDeTorns++;
                            if (
                                gameState.config.unfairSystem.enabled
                                && gameState.quantitatDeTorns
                                % gameState.config.unfairSystem.frequency === 0
                            ) {
                                unfair();
                            }

                            guardaPartida();

                            seguentTorn(
                                gameState,
                                elements,
                                taulell,
                                columnesTaulell,
                                pintaMarcador,
                                renderBoard,
                                resetDice,
                                guardaPartida
                            );
                        }
                    ),
                    () => seguentTorn(
                        gameState,
                        elements,
                        taulell,
                        columnesTaulell,
                        pintaMarcador,
                        renderBoard,
                        resetDice,
                        guardaPartida
                    )
                );

            }, 500);


            return;
        }

        equip.posicioTaulell++;

        renderBoard(
            elements,
            taulell,
            gameState.equips,
            gameState.equipActiu,
            columnesTaulell,
            pintaMarcador
        );

        count++;

    }, 250);
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
// SISTEMA INJUST
// ======================================================

function unfair() {

    const sorted = [...gameState.equips]
        .sort((a, b) => b.barra1 - a.barra1);

    sorted[0].barra1 +=
        gameState.config.unfairSystem.leaderBonus;

    sorted[sorted.length - 1].barra1 -=
        gameState.config.unfairSystem.lastPenalty;
}

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

    gameState.equips = names.map((n, i) => {

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
        damShuffled.length < gameState.equips.length
        || smxShuffled.length < gameState.equips.length
    ) {

        alert(
            "No hi ha prou alumnes de cada grup per garantir barreja!"
        );
    }

    gameState.equips.forEach((t, i) => {

        if (damShuffled[i]) {
            t.membresEq.push(damShuffled[i]);
        }
    });

    gameState.equips.forEach((t, i) => {

        if (smxShuffled[i]) {
            t.membresEq.push(smxShuffled[i]);
        }
    });

    const remaining = [
        ...damShuffled.slice(gameState.equips.length),
        ...smxShuffled.slice(gameState.equips.length)
    ];

    shuffle(remaining);

    remaining.forEach((s, i) => {

        gameState.equips[i % gameState.equips.length]
            .membresEq.push(s);
    });

    pintaPreviewEquips();

    guardaEquips();
}


function pintaPreviewEquips() {

    elements.previewEquips.innerHTML = gameState.equips.map(equip => `
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

    gameState.equipActiu = 0;
    gameState.quantitatDeTorns = 0;

    gameState.equips.forEach(t => {

        t.posicioTaulell = 0;
        t.barra1 = 0;
        t.barra2 = 0;
    });

    renderBoard(
        elements,
        taulell,
        gameState.equips,
        gameState.equipActiu,
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
    gameState.config = config;
    tempsPerTorn = config.tempsPerTorn;
    columnesTaulell = config.columnesTaulell;
    tipusCaselles = config.tipusCaselles.map(t => t.id);
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

        gameState.equips = loadedGame.equips;

        gameState.equipActiu = loadedGame.active;

        gameState.quantitatDeTorns = loadedGame.turns;

        elements.setup
            .style.display = "none";

        renderBoard(
            elements,
            taulell,
            gameState.equips,
            gameState.equipActiu,
            columnesTaulell,
            pintaMarcador
        );

        return;
    }

    const loadedTeams = carregaEquips();

    if (loadedTeams) {

        gameState.equips = loadedTeams;

        pintaPreviewEquips();

        return;
    }

    buildRandomTeams();

    renderBoard(
        elements,
        taulell,
        gameState.equips,
        gameState.equipActiu,
        columnesTaulell,
        pintaMarcador
    );
}


// Inicialitzar aplicació

window.elements = elements;
// window.equipActiu = equipActiu;
window.taulell = taulell;
window.columnesTaulell = columnesTaulell;
window.pintaMarcador = pintaMarcador;
window.gestionaEventCasella = gestionaEventCasella;
window.guardaPartida = guardaPartida;
window.getCategoryLabel = getCategoryLabel;

init();