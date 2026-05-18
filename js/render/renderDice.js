export function renderDice(elements, value) {
    if (!elements?.dau) return;

    elements.dau.innerText = value;
}

export function resetDice(elements) {
    if (!elements?.dau) return;

    const d = elements.dau;

    d.innerText = "🎲";

    d.classList.add("reset");

    setTimeout(
        () => d.classList.remove("reset"),
        200
    );
}