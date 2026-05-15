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
                data-tooltip="Mesura la capacitat del grup per captar atenció, generar impacte i influir dins les xarxes socials.">
                Viralitat
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

      <!-- PENSAMENT CRÍTIC -->

      <div class="metric">

        <div class="metric-info">
            <span 
                class="metric-label crit tooltip"
                data-tooltip="Mesura la capacitat del grup per detectar manipulacions, contrastar informació i prendre decisions reflexives.">
                Pensament crític
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

        <span class="pos" style="float:right; font-size:0.9rem;">
          Casella ${equip.posicioTaulell}
        </span>
      </div>

  </div>

</div>
`;
    }).join("");
}