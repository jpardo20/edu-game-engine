// ======================================================
// LA BASSA DIGITAL
// ------------------------------------------------------
// Aquest fitxer conté tota la lògica principal del joc:
// - càrrega de dades JSON
// - generació d’equips
// - renderització del tauler
// - moviment de fitxes
// - sistema de preguntes
// - puntuacions
// - persistència amb localStorage
// ======================================================
import Equip from "./core/Equip.js";
import Partida from "./core/Partida.js";

const partida = new Partida();

partida.inici();

// ======================================================
// CONFIGURACIÓ GLOBAL
// ======================================================

// Temps per defecte (en segons) del temporitzador
// que apareix dins del modal de preguntes.
const TEMPS_PER_DEFECTE = 10;

// Nombre de columnes del tauler.
// IMPORTANT:
// Ha de coincidir amb el valor definit al CSS.
const columnesTaulell = 6;

// Objecte utilitzat per recordar quines preguntes
// ja han sortit durant la partida.
// Exemple:
// used["decisio"] = [0,2]
const preguntesFetes = {};

// Variable global que contindrà tots els equips.
let equips = [];


// Tipus de caselles possibles del tauler.
// Aquest array es reutilitza cíclicament.
const tipus = [
    "decisio",
    "algoritme",
    "trampa",
    "pressio",
    "viral",
    "decisio",
    "trampa",
    "algoritme"
];


// Nombre total de caselles del tauler.
const qtatTotalDeCaselles = 36;



// ======================================================
// EVENTS DE BOTONS
// ======================================================

// Barrejar equips
document.getElementById("shuffleBtn")
    .addEventListener("click", buildRandomTeams);

// Iniciar partida
document.getElementById("startBtn")
    .addEventListener("click", iniciaPartida);

// Eliminar equips guardats
document.getElementById("clearTeamsBtn")
    .addEventListener("click", netejaSistema);

// Reiniciar partida mantenint equips
document.getElementById("resetGameBtn")
    .addEventListener("click", resetGame);

document.getElementById("diceBtn")
    .addEventListener("click",rollDice)

document.getElementById("resetGameBtn")
    .addEventListener("click",resetGame)

document.getElementById("fullResetGameBtn")
    .addEventListener("click",reiniciComplet)


// ======================================================
// VARIABLES GLOBALS D'ESTAT
// ======================================================

// Índex de l’equip actiu.
let equipActiu = 0;

// Nombre total de torns jugats.
let quantitatDeTorns = 0;

// Referència al temporitzador.
let interval;


// Objecte que contindrà totes les preguntes carregades
// des de preguntes.json
let preguntes = {};



// ======================================================
// CREACIÓ DEL TAULER
// ======================================================

// Generem el tauler automàticament.
// La primera casella és START.
// L’última és FINAL.
// La resta van alternant tipus.
const taulell = [...Array(qtatTotalDeCaselles)].map((_, i) => {

    // Casella inicial
    if (i === 0) return { type: "start" };

    // Casella final
    if (i === qtatTotalDeCaselles - 1) return { type: "final" };

    // Caselles normals
    return { type: tipus[i % tipus.length] };
});



// ======================================================
// ALUMNES
// ======================================================

// Aquí guardarem els alumnes carregats
// des del JSON.
let alumnesData = [];



/**
 * Carrega el fitxer alumnes.json.
 * 
 * El JSON conté:
 * - firstname
 * - lastname
 * - grup (DAM o SMX)
 */
async function carregaAlumnes() {

    try {

        const res = await fetch("data/alumnes.json");
        const data = await res.json();

        alumnesData = data.alumnes;

        ompleTextarea();

    } catch (err) {

        console.error("Error carregant alumnes:", err);
    }
}



/**
 * Omple el textarea de la pantalla inicial
 * amb els noms dels alumnes carregats.
 */
function ompleTextarea() {

    const textarea = document.getElementById("studentsInput");

    textarea.value = alumnesData
        .map(a => `${a.firstname} ${a.lastname}`)
        .join("\n");
}



// ======================================================
// GUARDAR / CARREGAR PARTIDA
// ======================================================



/**
 * Guarda l’estat actual de la partida.
 * 
 * Es desa:
 * - equips
 * - torn actiu
 * - número de torns
 */
function guardaPartida() {

    const data = {
        equips,
        active: equipActiu,
        turns: quantitatDeTorns
    };

    localStorage.setItem(
        "bassaGame",
        JSON.stringify(data)
    );
}



/**
 * Carrega una partida guardada.
 * 
 * Retorna:
 * - objecte amb dades
 * - o null si no existeix
 */
function carregaPartida() {

    const data = localStorage.getItem("bassaGame");

    if (!data) return null;

    try {

        return JSON.parse(data);

    } catch {

        return null;
    }
}



/**
 * Guarda només els equips.
 * 
 * Això permet:
 * - mantenir equips
 * - reiniciar partida
 * - conservar distribució
 */
function guardaEquips() {

    localStorage.setItem(
        "bassaTeams",
        JSON.stringify(equips)
    );
}



/**
 * Carrega equips guardats.
 */
function carregaEquips() {

    const data = localStorage.getItem("bassaTeams");

    if (!data) return null;

    try {

        return JSON.parse(data);

    } catch {

        return null;
    }
}



/**
 * Elimina:
 * - equips
 * - partida
 * 
 * i deixa el sistema net.
 */
function netejaSistema() {

    localStorage.removeItem("bassaTeams");
    localStorage.removeItem("bassaGame");

    equips = [];

    equipActiu = 0;
    quantitatDeTorns = 0;

    document.getElementById("teamsPreview").innerHTML = "";

    hoPintaTot();
}



/**
 * Reinici total complet.
 * 
 * Elimina:
 * - equips
 * - partida
 * 
 * i torna a mostrar el setup inicial.
 */
function reiniciComplet() {

    localStorage.removeItem("bassaGame");
    localStorage.removeItem("bassaTeams");

    equipActiu = 0;
    quantitatDeTorns = 0;

    equips.forEach(equip => {

        equip.posicioTaulell = 0;
        equip.barra1 = 0;
        equip.barra2 = 0;
    });

    document.getElementById("setup").style.display = "flex";

    pintaPreviewEquips();

    hoPintaTot();
}



/**
 * Reinicia la partida
 * però conserva els equips.
 */
function resetGame() {

    equips.forEach(equip => {

        equip.posicioTaulell = 0;
        equip.barra1 = 0;
        equip.barra2 = 0;
    });

    equipActiu = 0;
    quantitatDeTorns = 0;

    localStorage.removeItem("bassaGame");

    guardaEquips();

    hoPintaTot();

    document.getElementById("setup").style.display = "none";
}



// ======================================================
// PREGUNTES
// ======================================================



/**
 * Carrega preguntes.json.
 */
async function carregaPreguntes() {

    const res = await fetch("./data/preguntes.json");

    preguntes = await res.json();
}



// ======================================================
// RENDER DEL TAULER
// ======================================================



/**
 * Renderitza TOT:
 * - tauler
 * - fitxes
 * - marcador
 * - equips
 * - torn actiu
 */
function hoPintaTot() {

    const elTaulell = document.getElementById("board");

    elTaulell.innerHTML = "";

    const filesTaulell = Math.ceil(taulell.length / columnesTaulell);

    let orderedIndexes = [];


    // ==================================================
    // CONSTRUCCIÓ ORDRE "SERP"
    // ==================================================
    //
    // Exemple:
    //
    // 0 1 2 3 4 5
    // 11 10 9 8 7 6
    // 12 13 14 ...
    //
    // ==================================================

    for (let filaTaulell = 0; filaTaulell < filesTaulell; filaTaulell++) {

        let files = [];

        for (let c = 0; c < columnesTaulell; c++) {

            const index = filaTaulell * columnesTaulell + c;

            if (index < taulell.length) {
                files.push(index);
            }
        }

        // Files imparells invertides
        if (filaTaulell % 2 === 1) {
            files.reverse();
        }

        orderedIndexes = orderedIndexes.concat(files);
    }

    // ==================================================
    // CREACIÓ DE CASELLES
    // ==================================================

    orderedIndexes.forEach((indexTaulell, posicioTaulell) => {

        const casellaActual = taulell[indexTaulell];

        const seguentPosicio = posicioTaulell + 1;

        let direccio = "";


        // ==============================================
        // DIRECCIÓ DE FLETXA
        // ==============================================

        if (seguentPosicio < orderedIndexes.length) {

            const fila = Math.floor(posicioTaulell / columnesTaulell);
            const columna = posicioTaulell % columnesTaulell;

            const seguentFila = Math.floor(seguentPosicio / columnesTaulell);
            const seguentColumna = seguentPosicio % columnesTaulell;

            // Mateixa fila
            if (fila === seguentFila) {

                direccio = (seguentColumna > columna)
                    ? "right"
                    : "left";

            } else {

                // Salt de fila
                direccio = "down";
            }

        } else {

            direccio = "end";
        }


        // Etiqueta tipus de casella
        const etiquetaCasella = (
            casellaActual.type !== "start"
            && casellaActual.type !== "final"
        )
            ? `<div class="cell-type">${casellaActual.type.toUpperCase()}</div>`
            : "";


        // Detectar si hi ha equips a la casella
        const quiHiHaAqui = equips.some(t => t.posicioTaulell === indexTaulell);


        // Crear element HTML
        const div = document.createElement("div");

        div.className =
            `cell ${casellaActual.type} dir-${direccio} ${quiHiHaAqui ? "active-cell" : ""}`;


        // HTML intern de la casella
        div.innerHTML = `
            <div class='cell-number'>${indexTaulell}</div>
            ${etiquetaCasella}
            <div id='t${indexTaulell}'></div>
        `;

        elTaulell.appendChild(div);
    });



    // ==================================================
    // TOKENS / FITXES
    // ==================================================

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



    // ==================================================
    // TORN ACTIU
    // ==================================================

    const elTorn = document.getElementById("turn");

    if (elTorn) {
        elTorn.innerText = "Torn: " + equips[equipActiu].nomEq;
    }



    // ==================================================
    // MARCADOR
    // ==================================================

    const elMarcador = document.getElementById("scores");

    if (!elMarcador) return;

    elMarcador.innerHTML = equips.map(equip => {
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



// ======================================================
// DAU
// ======================================================



/**
 * Genera un número aleatori de 1 a 6
 * i inicia el moviment.
 */
function rollDice() {

    const r = Math.floor(Math.random() * 6) + 1;

    document.getElementById("dice").innerText = r;

    const t = equips[equipActiu];

    moveStepByStep(t, r);
}



// ======================================================
// EVENTS DE CASELLES
// ======================================================



/**
 * Gestiona l’event de la casella actual.
 */
function gestionaEventCasella() {

    const t = equips[equipActiu];

    const type = taulell[t.posicioTaulell].type;


    // START
    if (type === "start") {

        seguentTorn();

        return;
    }


    // FINAL
    if (type === "final") {

        const finalQ = preguntes.final?.[0];

        showModal(finalQ);

        return;
    }


    // Preguntes del tipus corresponent
    const pool = preguntes[type];

    if (!pool || pool.length === 0) {

        console.warn("Sense preguntes per:", type);

        seguentTorn();

        return;
    }


    // Pregunta aleatòria
    const data = getRandomQuestion(type);

    showModal(data);
}



// ======================================================
// MODAL DE PREGUNTES
// ======================================================



/**
 * Mostra el modal amb:
 * - títol
 * - text
 * - opcions
 */
function showModal(data) {

    const o = document.getElementById("overlay");

    o.classList.add("show");

    document.getElementById("title").innerText = data.title;

    document.getElementById("text").innerText = data.text;

    const ch = document.getElementById("choices");

    ch.innerHTML = "";


    // Crear botons d’opcions
    data.choices.forEach(opt => {

        const b = document.createElement("button");

        b.className = "choice";

        b.innerText = opt.text;


        // ==============================================
        // QUÈ PASSA QUAN TRIEM UNA OPCIÓ
        // ==============================================

        b.onclick = () => {

            const t = equips[equipActiu];

            // Modificar puntuacions
            t.barra1 += opt.barra1 || 0;
            t.barra2 += opt.barra2 || 0;

            // Tancar modal
            o.classList.remove("show");

            clearInterval(interval);

            // Comptador de torns
            quantitatDeTorns++;

            // Sistema injust cada 3 torns
            if (quantitatDeTorns % 3 === 0) {
                unfair();
            }

            guardaPartida();

            seguentTorn();
        };

        ch.appendChild(b);
    });

    startTimer();
}



// ======================================================
// PREGUNTA ALEATÒRIA
// ======================================================



/**
 * Retorna una pregunta aleatòria
 * evitant repeticions immediates.
 */
function getRandomQuestion(type) {

    if (!preguntesFetes[type]) {
        preguntesFetes[type] = [];
    }

    const pool = preguntes[type];

    const available = pool.filter(
        (_, i) => !preguntesFetes[type].includes(i)
    );

    // Reiniciar si ja s’han fet totes
    if (available.length === 0) {

        preguntesFetes[type] = [];

        return getRandomQuestion(type);
    }

    const index = Math.floor(
        Math.random() * available.length
    );

    const q = available[index];

    preguntesFetes[type].push(pool.indexOf(q));

    return q;
}



// ======================================================
// TIMER
// ======================================================



/**
 * Inicia el temporitzador del modal.
 */
function startTimer() {

    let time = TEMPS_PER_DEFECTE;

    const timerEl = document.getElementById("timer");

    if (!timerEl) return;

    clearInterval(interval);


    interval = setInterval(() => {

        time--;


        // Temps normal
        if (time > 5) {

            timerEl.innerText =
                `${time}s → decidiu`;

            timerEl.style.color = "orange";


        // Temps crític
        } else if (time > 0) {

            timerEl.innerText = `⚠️ ${time}s`;

            timerEl.style.color = "red";


        // Temps esgotat
        } else {

            timerEl.innerText =
                "Temps! Porta veu!";

            clearInterval(interval);
        }

    }, 1000);
}



// ======================================================
// SISTEMA INJUST
// ======================================================



/**
 * Sistema que afavoreix qui ja és viral.
 * 
 * Simula el funcionament dels algoritmes:
 * qui ja destaca, encara destaca més.
 */
function unfair() {

    const sorted = [...equips]
        .sort((a, b) => b.barra1 - a.barra1);

    sorted[0].barra1 += 2;

    sorted[sorted.length - 1].barra1 -= 1;
}



// ======================================================
// CANVI DE TORN
// ======================================================



/**
 * Passa el torn al següent equip.
 */
function seguentTorn() {

    equipActiu = (equipActiu + 1) % equips.length;

    document.getElementById("dice").innerText = "🎲";

    hoPintaTot();

    resetDice();

    guardaPartida();
}



/**
 * Animació visual del dau.
 */
function resetDice() {

    const d = document.getElementById("dice");

    d.innerText = "🎲";

    d.classList.add("reset");

    setTimeout(
        () => d.classList.remove("reset"),
        200
    );
}



// ======================================================
// MOVIMENT ANIMAT
// ======================================================



/**
 * Mou una fitxa pas a pas.
 */
function moveStepByStep(equip, steps) {

    let count = 0;

    const move = setInterval(() => {

        // Final moviment
        if (
            count >= steps
            || equip.posicioTaulell >= qtatTotalDeCaselles - 1
        ) {

            clearInterval(move);

            hoPintaTot();

            // Petit delay abans del modal
            setTimeout(() => gestionaEventCasella(), 500);

            return;
        }

        // Avançar una casella
        equip.posicioTaulell++;

        hoPintaTot();

        count++;

    }, 250);
}



// ======================================================
// ALUMNES / EQUIPS
// ======================================================



/**
 * Retorna tots els alumnes carregats.
 */
function getStudentsObjects() {

    return alumnesData;
}



/**
 * Barreja aleatòriament un array
 * utilitzant Fisher-Yates.
 */
function shuffle(arr) {

    const copy = [...arr];

    for (let i = copy.length - 1; i > 0; i--) {

        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [copy[i], copy[j]] =
            [copy[j], copy[i]];
    }

    return copy;
}



/**
 * Genera equips equilibrats.
 * 
 * Objectiu:
 * cada equip ha de tenir:
 * - DAM
 * - SMX
 */
function buildRandomTeams() {

    const students = getStudentsObjects();

    const names = [
        "A - Grup A",
        "B - Grup B",
        "C - Grup C",
        "D - Grup D"
    ];

    const colors = [
        "green",
        "blue",
        "red",
        "purple"
    ];


    // Crear equips buits
    equips = names.map((n, i) => {

        const equip = new Equip(n);

        equip.color = colors[i];

        return equip;

    });


    // Separar alumnes per grup
    const dam = students.filter(
        s => s.grup === "DAM"
    );

    const smx = students.filter(
        s => s.grup === "SMX"
    );


    shuffle(dam);
    shuffle(smx);


    // Validació mínima
    if (
        dam.length < equips.length
        || smx.length < equips.length
    ) {

        alert(
            "No hi ha prou alumnes de cada grup per garantir barreja!"
        );
    }


    // Assignar 1 DAM
    equips.forEach((t, i) => {

        if (dam[i]) {
            t.membresEq.push(dam[i]);
        }
    });


    // Assignar 1 SMX
    equips.forEach((t, i) => {

        if (smx[i]) {
            t.membresEq.push(smx[i]);
        }
    });


    // Resta alumnes
    const remaining = [
        ...dam.slice(equips.length),
        ...smx.slice(equips.length)
    ];

    shuffle(remaining);

    remaining.forEach((s, i) => {

        equips[i % equips.length]
            .membresEq.push(s);
    });


    pintaPreviewEquips();

    guardaEquips();
}



/**
 * Mostra els equips generats
 * a la pantalla inicial.
 */
function pintaPreviewEquips() {

    const el = document.getElementById("teamsPreview");

    el.innerHTML = equips.map(equip => `
        <div style="margin-bottom:10px">
            <strong style="color:${equip.color}">
                ${equip.nomEq}
            </strong><br>

            ${equip.membresEq
                .map(m => `${m.firstname} ${m.lastname}`)
                .join(", ")}
        </div>
    `).join("");
}



/**
 * Inicia una nova partida.
 */
function iniciaPartida() {

    document.getElementById("setup")
        .style.display = "none";

    equipActiu = 0;

    quantitatDeTorns = 0;


    equips.forEach(t => {

        t.posicioTaulell = 0;
        t.barra1 = 0;
        t.barra2 = 0;
    });

    hoPintaTot();

    guardaPartida();
}



// ======================================================
// INIT
// ======================================================



/**
 * Inicialització principal del sistema.
 */
async function init() {

    await carregaPreguntes();

    await carregaAlumnes();


    // ==================================================
    // 1. PARTIDA EN CURS
    // ==================================================

    const loadedGame = carregaPartida();

    if (loadedGame) {

        equips = loadedGame.equips;

        equipActiu = loadedGame.active;

        quantitatDeTorns = loadedGame.turns;

        document.getElementById("setup")
            .style.display = "none";

        hoPintaTot();

        return;
    }


    // ==================================================
    // 2. EQUIPS GUARDATS
    // ==================================================

    const loadedTeams = carregaEquips();

    if (loadedTeams) {

        equips = loadedTeams;

        pintaPreviewEquips();

        return;
    }


    // ==================================================
    // 3. PRIMERA EXECUCIÓ
    // ==================================================

    buildRandomTeams();

    hoPintaTot();
}



// Inicialitzar aplicació
init();