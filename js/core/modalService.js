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
    
    const lletresRespostes = ["A", "B", "C", "D", "E", "F", "G"];

    data.choices.forEach((resposta, index) => {

        const botoResposta = document.createElement("button");

        botoResposta.className = "choice";
        botoResposta.innerText =
            `${lletresRespostes[index]}) ${resposta.text}`;

        botoResposta.onclick = () => {

            const t =
                gameState.equips[
                    gameState.equipActiu
                ];

            t.barra1 += resposta.barra1 || 0;
            t.barra2 += resposta.barra2 || 0;

            elements.overlay.classList.remove("show");

            clearInterval(interval);

            onAnswer();
        };

        elements.choices.appendChild(botoResposta);
    });

    startTimerCallback();
}