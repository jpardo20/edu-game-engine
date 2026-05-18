import {
    saveGame,
    loadGame,
    saveTeams,
    loadTeams
} from "./persistence.js";

export function guardaPartida(gameState) {

    saveGame({
        equips: gameState.equips,
        active: gameState.equipActiu,
        turns: gameState.quantitatDeTorns
    });
}

export function carregaPartida() {
    return loadGame();
}

export function guardaEquips(gameState) {
    saveTeams(gameState.equips);
}

export function carregaEquips() {
    return loadTeams();
}

export function eliminaPartida() {
    localStorage.removeItem("bassaGame");
}

export function eliminaEquips() {
    localStorage.removeItem("bassaTeams");
}