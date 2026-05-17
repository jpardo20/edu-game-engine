export function pintaMarcador(
    elements,
    equips,
    equipActiu
) {

    if (!elements.marcador) return;

    elements.marcador.innerHTML = equips.map(equip => {

        const isActive = equip === equips[equipActiu];

        return `
    <div class="score-row">

  <div class="team-members-side">
    ${equip.membresEq
                .map(m => `${m.firstname} ${m.lastname}`)
                .join("<hr>")}
  </div>

  <div class='score ${isActive ? "active" : ""}'>

      <div class="score-header">
        <span class="team-name" style="background:${equip.color}">
          ${equip.nomEq}
        </span>

      </div>

      <!-- VIRALITAT -->

      <div class="metric">

        <div class="metric-info">
            <span 
                class="metric-label viralitat tooltip"
                data-tooltip="${window.gameState?.config?.scoreSystem?.tooltip?.[0]}">
                ${
    window.gameState?.config?.scoreSystem?.labels?.[0]
    || "Barra 1"
}
            </span>

          <span class="value ${equip.barra1 < 0 ? "neg" : "pos"}">
            ${equip.barra1}
          </span>
        </div>

        <div class="bar">
          <div
            class="fill pop pos"
            style="
                width:${Math.max(0, equip.barra1) * 10}%">
          </div>

          <div
            class="fill pop neg"
            style="
                width:${Math.max(0, -equip.barra1) * 10}%">
          </div>
        </div>

      </div>

      ${
        window.gameState?.config?.scoreSystem?.bars === 2
            ? `

      <!-- PENSAMENT CRÍTIC -->

      <div class="metric">

        <div class="metric-info">
            <span 
                class="metric-label crit tooltip"
                data-tooltip="${window.gameState?.config?.scoreSystem?.tooltip?.[1]}">
                ${
    window.gameState?.config?.scoreSystem?.labels?.[1]
    || "Barra 1"
}
            </span>

          <span class="value ${equip.barra2 < 0 ? "neg" : "pos"}">
            ${equip.barra2}
          </span>
        </div>

        <div class="bar">
          <div
            class="fill crit pos"
            style="
                width:${Math.max(0, equip.barra2) * 10}%">
          </div>

          <div
            class="fill crit neg"
                style="width:${Math.max(0, -equip.barra2) * 10}%">
          </div>
        </div>

      </div>

      `
            : ""
    }

        <span class="pos" style="float:right; font-size:0.9rem;">
          Casella ${equip.posicioTaulell}
        </span>

  </div>

</div>
`;
    }).join("");
}