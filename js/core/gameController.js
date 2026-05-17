export function seguentTorn(
    gameState,
    elements,
    taulell,
    columnesTaulell,
    pintaMarcador,
    renderBoard,
    resetDice,
    guardaPartida
) {

    gameState.equipActiu =
        (gameState.equipActiu + 1)
        % gameState.equips.length;

    elements.dau.innerText = "🎲";

    renderBoard(
        elements,
        taulell,
        gameState.equips,
        gameState.equipActiu,
        columnesTaulell,
        pintaMarcador
    );

    resetDice(elements);

    guardaPartida();
}

export function gestionaEventCasella(
    gameState,
    taulell,
    preguntes,
    getRandomQuestion,
    showModal,
    finalitzaTorn
) {

    const t = gameState.equips[gameState.equipActiu];

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

        finalitzaTorn();

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

        finalitzaTorn();

        return;
    }

    const data = getRandomQuestion(type);

    showModal(data);
}