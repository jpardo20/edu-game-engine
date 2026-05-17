export function renderBoard(
    elements,
    taulell,
    equips,
    equipActiu,
    columnesTaulell,
    pintaMarcador
) {

    elements.taulell.innerHTML = "";

    const filesTaulell = Math.ceil(taulell.length / columnesTaulell);

    let orderedIndexes = [];

    for (let filaTaulell = 0; filaTaulell < filesTaulell; filaTaulell++) {

        let files = [];

        for (let c = 0; c < columnesTaulell; c++) {

            const index = filaTaulell * columnesTaulell + c;

            if (index < taulell.length) {
                files.push(index);
            }
        }

        if (filaTaulell % 2 === 1) {
            files.reverse();
        }

        orderedIndexes = orderedIndexes.concat(files);
    }

    orderedIndexes.forEach((indexTaulell, posicioTaulell) => {

        const casellaActual = taulell[indexTaulell];

        const seguentPosicio = posicioTaulell + 1;

        let direccio = "";

        // ==============================================
        // DIRECCIÓ DE FLETXA
        // ==============================================
        //
        // Important:
        // La casella final es detecta per l'índex REAL
        // del taulell, no per la posició visual dins del grid.
        //
        // Això evita que la bandera surti a la casella visualment
        // més extrema de l'última fila i fa que aparegui a la
        // darrera casella real del joc.
        // ==============================================

        if (indexTaulell === taulell.length - 1) {

            direccio = "end";

        } else {

            const fila = Math.floor(posicioTaulell / columnesTaulell);

            const esFilaInvertida = fila % 2 === 1;

            const esUltimaCasellaFilaNormal =
                !esFilaInvertida
                && posicioTaulell % columnesTaulell === columnesTaulell - 1;

            const esUltimaCasellaFilaInvertida =
                esFilaInvertida
                && posicioTaulell % columnesTaulell === 0;

            if (
                esUltimaCasellaFilaNormal
                || esUltimaCasellaFilaInvertida
            ) {

                direccio = "down";

            } else if (esFilaInvertida) {

                direccio = "left";

            } else {

                direccio = "right";
            }
        }

        const etiquetaCasella = (
            casellaActual.type !== "start"
            && casellaActual.type !== "final"
        )
            ? `<div class="cell-type">${window.getCategoryLabel
                ? window.getCategoryLabel(casellaActual.type)
                : casellaActual.type
            }</div>`
            : "";

        const quiHiHaAqui = equips.some(
            equip => equip.posicioTaulell === indexTaulell
        );

        const div = document.createElement("div");

        div.className =
            `cell ${casellaActual.type} dir-${direccio} ${quiHiHaAqui ? "active-cell" : ""}`;

        div.innerHTML = `
            <div class='cell-number'>${indexTaulell}</div>
            ${etiquetaCasella}
            <div id='t${indexTaulell}'></div>
        `;

        elements.taulell.appendChild(div);
    });

    equips.forEach(equip => {

        const tok = document.createElement("div");

        tok.className = "token";

        tok.style.background = equip.color;

        tok.textContent = equip.nomEq[0];

        const slot = document.getElementById("t" + equip.posicioTaulell);

        if (slot) {
            slot.appendChild(tok);
        }
    });

    const elTorn = elements.torn;

    if (elTorn && equips[equipActiu]) {
        elTorn.innerText = "Torn: " + equips[equipActiu].nomEq;
    }

    pintaMarcador(
        elements,
        equips,
        equipActiu
    );

}