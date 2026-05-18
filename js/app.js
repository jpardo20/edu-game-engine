import { pintaMarcador } from "./render/renderScoreboard.js";
import { renderBoard } from "./render/renderBoard.js";
import { renderDice, resetDice } from "./render/renderDice.js";

import { gameState } from "./core/state.js";
import { createGameEngine } from "./core/gameEngine.js";
import { seguentTorn, gestionaEventCasella } from "./core/gameController.js";
import { showModal, startTimer } from "./core/modalService.js";

import {
    carregaPartida,
    guardaPartida,
    carregaEquips,
    guardaEquips,
    eliminaPartida,
    eliminaEquips
} from "./core/gamePersistence.js";

import {
    carregaConfiguracio,
    carregaPreguntes,
    carregaAlumnes,
    ompleTextarea
} from "./core/gameSetup.js";

import { creaTaulell, getCategoryLabel } from "./core/boardFactory.js";
import { createQuestionManager } from "./core/questions.js";
import { buildRandomTeams as buildTeams } from "./core/teamBuilder.js";
import { moveStepByStep } from "./core/movementAnimation.js";

import Partida from "./core/Partida.js";

// ======================================================
// LA BASSA DIGITAL
// Fitxer principal: wiring, listeners i coordinació general
// ======================================================

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

const partida = new Partida();
partida.inici();

const questionManager = createQuestionManager();
let preguntes = {};
let alumnesData = [];

let tempsPerTorn;
let columnesTaulell;
let tipusCaselles;
let casellesTotals;
let taulell = [];

const game = createGameEngine(gameState);

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

function renderGame() {
    renderBoard(
        elements,
        taulell,
        gameState.equips,
        gameState.equipActiu,
        columnesTaulell,
        pintaMarcador
    );
}

function finalitzaTorn() {
    gameState.quantitatDeTorns++;

    game.applyUnfairSystem();

    guardaPartida(gameState);

    seguentTorn(
        gameState,
        elements,
        taulell,
        columnesTaulell,
        pintaMarcador,
        renderBoard,
        resetDice,
        () => guardaPartida(gameState)
    );
}

function gestionaCasellaActual() {
    gestionaEventCasella(
        gameState,
        taulell,
        preguntes,
        (type) => questionManager.getRandomQuestion(type, preguntes),
        (data) => showModal(
            data,
            elements,
            gameState,
            () => startTimer(elements, tempsPerTorn),
            finalitzaTorn
        ),
        finalitzaTorn
    );
}

function buildRandomTeams() {
    gameState.equips = buildTeams(alumnesData);
    pintaPreviewEquips();
    guardaEquips(gameState);
}

function iniciaPartida() {
    elements.setup.style.display = "none";

    game.resetTeams();

    renderGame();

    guardaPartida(gameState);
}

function netejaSistema() {
    eliminaEquips();
    eliminaPartida();

    gameState.equips = [];
    gameState.equipActiu = 0;
    gameState.quantitatDeTorns = 0;

    elements.previewEquips.innerHTML = "";

    renderGame();
}

function reiniciComplet() {
    eliminaPartida();
    eliminaEquips();

    game.resetTeams();

    elements.setup.style.display = "flex";

    pintaPreviewEquips();
    renderGame();
}

function resetGame() {
    game.resetTeams();

    eliminaPartida();
    guardaEquips(gameState);

    renderGame();

    elements.setup.style.display = "none";
}

function configuraEvents() {
    document.getElementById("shuffleBtn")
        .addEventListener("click", buildRandomTeams);

    document.getElementById("startBtn")
        .addEventListener("click", iniciaPartida);

    document.getElementById("clearTeamsBtn")
        .addEventListener("click", netejaSistema);

    document.getElementById("resetCurrentGameBtn")
        .addEventListener("click", resetGame);

    document.getElementById("fullResetGameBtn")
        .addEventListener("click", reiniciComplet);

    document.getElementById("resetGameBtn")
        .addEventListener("click", resetGame);

    document.getElementById("diceBtn")
        .addEventListener("click", () => {

            const currentTeam = game.getCurrentPlayer();

            if (!currentTeam) return;

            const value = game.roll();

            renderDice(elements, value);

            moveStepByStep(
                currentTeam,
                value,
                casellesTotals,
                () => renderGame(),
                () => setTimeout(gestionaCasellaActual, 500)
            );
        });
}

async function init() {
    const setup = await carregaConfiguracio();

    gameState.config = setup.config;

    tempsPerTorn = setup.tempsPerTorn;
    columnesTaulell = setup.columnesTaulell;
    tipusCaselles = setup.tipusCaselles;
    casellesTotals = setup.casellesTotals;

    taulell = creaTaulell(casellesTotals, tipusCaselles);
    gameState.taulell = taulell;

    preguntes = await carregaPreguntes();
    alumnesData = await carregaAlumnes();

    ompleTextarea(alumnesData);

    const loadedGame = carregaPartida();

    if (loadedGame) {
        gameState.equips = loadedGame.equips;
        gameState.equipActiu = loadedGame.active;
        gameState.quantitatDeTorns = loadedGame.turns;

        elements.setup.style.display = "none";

        renderGame();
        return;
    }

    const loadedTeams = carregaEquips();

    if (loadedTeams) {
        gameState.equips = loadedTeams;
        pintaPreviewEquips();
        return;
    }

    buildRandomTeams();
    renderGame();
}

// Compatibilitat amb renderScoreboard/renderBoard existents
window.elements = elements;
window.taulell = taulell;
window.columnesTaulell = columnesTaulell;
window.pintaMarcador = pintaMarcador;
window.gestionaEventCasella = gestionaCasellaActual;
window.guardaPartida = () => guardaPartida(gameState);
window.getCategoryLabel = (id) => getCategoryLabel(id, gameState.config);
window.gameState = gameState;

configuraEvents();
init();