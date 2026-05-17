import { renderBoard } from "../render/renderBoard.js";

export function resetDice(elements) {

    const d = elements.dau;

    d.innerText = "🎲";

    d.classList.add("reset");

    setTimeout(
        () => d.classList.remove("reset"),
        200
    );
}

export function rollDice(
    elements,
    getCurrentTeam,
    moveStepByStep
) {

    const r = Math.floor(Math.random() * 6) + 1;

    elements.dau.innerText = r;

    const t = getCurrentTeam();
    if (!t) return;

    moveStepByStep(
        t,
        r,
        window.casellesTotals,
        () => renderBoard(
            window.elements,
            window.taulell,
            equips,
            equipActiu,
            window.columnesTaulell,
            window.pintaMarcador
        ),
        () => window.gestionaEventCasella()
    );
}

export function seguentTorn() {

    window.equipActiu = (window.equipActiu + 1) % window.equips.length;

    window.elements.dau.innerText = "🎲";

    renderBoard(
        window.elements,
        window.taulell,
        window.equips,
        window.equipActiu,
        window.columnesTaulell,
        window.pintaMarcador
    );

    resetDice(window.elements);

    guardaPartida();
}

export function shuffle(arr) {

    const copy = [...arr];

    for (let i = copy.length - 1; i > 0; i--) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [copy[i], copy[j]] =
            [copy[j], copy[i]];
    }

    return copy;
}



