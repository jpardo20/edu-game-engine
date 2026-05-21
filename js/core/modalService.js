let interval;


export function startTimer(elements, tempsPerTorn) {

    let time = tempsPerTorn;
    
    elements.timer.style.color = "orange";
    
    if (!elements.timer) return;

    // RESET visual del timer
    elements.timer.style.color = "";
    elements.timer.style.backgroundColor = "";
    elements.timer.style.fontSize = "";

    clearInterval(interval);

    interval = setInterval(() => {
        time--;
        if (time > 10) {
            elements.timer.innerText =
                `⏱️ El temps passa volant ... → ${time} s.`;
            elements.timer.style.color = "orange";
        } else if (time > 5) {
            elements.timer.innerText = `⏳ Aneu pensant en donar una resposta!! → ${time} s.`;
            elements.timer.style.color = "red";
        }
        else if (time > 0) {
            elements.timer.innerText = `⚠️ Queda molt poc temps → ${time} s.`;
            elements.timer.style.color = "red";
        } else {
            elements.timer.innerHTML =
                "<p style=\"line-height: 1.3rem; margin: 0px;\">☠️&nbsp;&nbsp;&nbsp;→&nbsp;0&nbsp;s.<br>Time over!! Portaveu cal donar una resposta!</p>";
            elements.timer.style.color = "white";
            elements.timer.style.backgroundColor = "red";
            elements.timer.style.fontSize = "1.8rem";
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