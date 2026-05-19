export function pintaMarcador(
    elements,
    equips,
    equipActiu,
    config
) {

    if (!elements.marcador) return;

    elements.marcador.innerHTML = equips.map(equip => {

        const isActive = equip === equips[equipActiu];

        return `
    <div class="score-row">
        <div class='score ${isActive ? "active" : ""}'>
        <div class="score-main">
        <div class="score-header">
            <span class="team-name" style="background:${equip.color}">${equip.nomEq}</span>
        
        </div>
        
        <!-- Primera barra -->
        <div class="metric">
        <div class="metric-info">
        <span class="metric-label primeraBarra tooltip"
        data-tooltip="${config?.scoreSystem?.barr_info?.[0]}">
        ${config?.scoreSystem?.labels?.[0]
            || "Barra 1"}
            </span>
                        <span class="value ${equip.barra1 < 0 ? "neg" : "pos"}">
                        ${equip.barra1}
                        </span>
                        </div>
                        <div class="bar">
                        <div class="fill pop pos" style="
                        width:${Math.max(0, equip.barra1) * 10}%">
                        </div>
                        <div class="fill pop neg" style="
                        width:${Math.max(0, -equip.barra1) * 10}%">
                        </div>
                        </div>
                        </div>${config?.scoreSystem?.bars === 2? `
                <!-- Segona barra -->
                <div class="metric">
                <div class="metric-info">
                <span class="metric-label segonaBarra tooltip"
                data-tooltip="${config?.scoreSystem?.barr_info?.[1]}">
                ${config?.scoreSystem?.labels?.[1]
                    || "Barra 1"}
                    </span>
                    <span class="value ${equip.barra2 < 0 ? "neg" : "pos"}">
                    ${equip.barra2}
                    </span>
                    </div>
                    <div class="bar">
                    <div class="fill segonaBarra pos" style="
                    width:${Math.max(0, equip.barra2) * 10}%">
                    </div>
                    <div class="fill segonaBarra neg" style="
                    width:${Math.max(0, -equip.barra2) * 10}%">
                    </div>
                    </div>
                    </div>
                    `: ""   }
                    <div class="casella">Casella: <strong>${equip.posicioTaulell}</strong></div>
                    </div>
                    <div class="team-members-side">
                    ${equip.membresEq
                        .map(m => ` - ${m.firstname} ${m.lastname}`)
                        .join("<br>")}
                        
                        </div>
                        </div>
        </div>
  `;
    }).join("");
}