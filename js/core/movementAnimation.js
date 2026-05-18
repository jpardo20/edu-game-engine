export function moveStepByStep(
    equip,
    steps,
    casellesTotals,
    renderCallback,
    finishedCallback
) {

    let count = 0;

    const move = setInterval(() => {

        if (
            count >= steps
            || equip.posicioTaulell >= casellesTotals - 1
        ) {

            clearInterval(move);

            renderCallback();

            finishedCallback();

            return;
        }

        equip.posicioTaulell++;

        renderCallback();

        count++;

    }, 250);
}