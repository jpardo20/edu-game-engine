let interval;


export function startTimer(elements, tempsPerTorn) {

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


export function showModal(
    data,
    elements,
    gameState,
    startTimerCallback,
    onAnswer
) {

    elements.overlay.classList.add("show");

    document.getElementById("title").innerText = data.title;
    document.getElementById("text").innerText = data.text;

    elements.choices.innerHTML = "";

    data.choices.forEach(opt => {

        const b = document.createElement("button");

        b.className = "choice";
        b.innerText = opt.text;

        b.onclick = () => {

            const t =
                gameState.equips[
                    gameState.equipActiu
                ];

            t.barra1 += opt.barra1 || 0;
            t.barra2 += opt.barra2 || 0;

            elements.overlay.classList.remove("show");

            clearInterval(interval);

            onAnswer();
        };

        elements.choices.appendChild(b);
    });

    startTimerCallback();
}