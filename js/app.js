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

import Game from "./core/Game.js";

const game = new Game();

game.start();

// ======================================================
// CONFIGURACIÓ GLOBAL
// ======================================================

// Temps per defecte (en segons) del temporitzador
// que apareix dins del modal de preguntes.
const TEMPS_PER_DEFECTE = 10;

// Nombre de columnes del tauler.
// IMPORTANT:
// Ha de coincidir amb el valor definit al CSS.
const cols = 6;

// Objecte utilitzat per recordar quines preguntes
// ja han sortit durant la partida.
// Exemple:
// used["decisio"] = [0,2]
const used = {};

// Variable global que contindrà tots els equips.
let teams = [];


// Tipus de caselles possibles del tauler.
// Aquest array es reutilitza cíclicament.
const types = [
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
const caselles = 36;



// ======================================================
// EVENTS DE BOTONS
// ======================================================

// Barrejar equips
document.getElementById("shuffleBtn")
    .addEventListener("click", buildRandomTeams);

// Iniciar partida
document.getElementById("startBtn")
    .addEventListener("click", startGame);

// Eliminar equips guardats
document.getElementById("clearTeamsBtn")
    .addEventListener("click", clearTeams);

// Reiniciar partida mantenint equips
document.getElementById("resetGameBtn")
    .addEventListener("click", resetGame);

document.getElementById("diceBtn")
    .addEventListener("click",rollDice)

document.getElementById("resetGameBtn")
    .addEventListener("click",resetGame)

document.getElementById("fullResetGameBtn")
    .addEventListener("click",fullResetGame)


// ======================================================
// VARIABLES GLOBALS D'ESTAT
// ======================================================

// Índex de l’equip actiu.
let active = 0;

// Nombre total de torns jugats.
let turns = 0;

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
const board = [...Array(caselles)].map((_, i) => {

    // Casella inicial
    if (i === 0) return { type: "start" };

    // Casella final
    if (i === caselles - 1) return { type: "final" };

    // Caselles normals
    return { type: types[i % types.length] };
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
async function loadAlumnes() {

    try {

        const res = await fetch("data/alumnes.json");
        const data = await res.json();

        alumnesData = data.alumnes;

        fillTextarea();

    } catch (err) {

        console.error("Error carregant alumnes:", err);
    }
}



/**
 * Omple el textarea de la pantalla inicial
 * amb els noms dels alumnes carregats.
 */
function fillTextarea() {

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
function saveGame() {

    const data = {
        teams,
        active,
        turns
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
function loadGame() {

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
function saveTeams() {

    localStorage.setItem(
        "bassaTeams",
        JSON.stringify(teams)
    );
}



/**
 * Carrega equips guardats.
 */
function loadTeams() {

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
function clearTeams() {

    localStorage.removeItem("bassaTeams");
    localStorage.removeItem("bassaGame");

    teams = [];

    active = 0;
    turns = 0;

    document.getElementById("teamsPreview").innerHTML = "";

    render();
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
function fullResetGame() {

    localStorage.removeItem("bassaGame");
    localStorage.removeItem("bassaTeams");

    active = 0;
    turns = 0;

    teams.forEach(t => {

        t.pos = 0;
        t.pop = 0;
        t.crit = 0;
    });

    document.getElementById("setup").style.display = "flex";

    renderTeamsPreview();

    render();
}



/**
 * Reinicia la partida
 * però conserva els equips.
 */
function resetGame() {

    teams.forEach(t => {

        t.pos = 0;
        t.pop = 0;
        t.crit = 0;
    });

    active = 0;
    turns = 0;

    localStorage.removeItem("bassaGame");

    saveTeams();

    render();

    document.getElementById("setup").style.display = "none";
}



// ======================================================
// PREGUNTES
// ======================================================



/**
 * Carrega preguntes.json.
 */
async function loadQuestions() {

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
function render() {

    const b = document.getElementById("board");

    b.innerHTML = "";

    const rows = Math.ceil(board.length / cols);

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

    for (let r = 0; r < rows; r++) {

        let row = [];

        for (let c = 0; c < cols; c++) {

            const index = r * cols + c;

            if (index < board.length) {
                row.push(index);
            }
        }

        // Files imparells invertides
        if (r % 2 === 1) {
            row.reverse();
        }

        orderedIndexes = orderedIndexes.concat(row);
    }



    // ==================================================
    // CREACIÓ DE CASELLES
    // ==================================================

    orderedIndexes.forEach((i, pos) => {

        const c = board[i];

        const nextPos = pos + 1;

        let direction = "";


        // ==============================================
        // DIRECCIÓ DE FLETXA
        // ==============================================

        if (nextPos < orderedIndexes.length) {

            const row = Math.floor(pos / cols);
            const col = pos % cols;

            const nextRow = Math.floor(nextPos / cols);
            const nextCol = nextPos % cols;

            // Mateixa fila
            if (row === nextRow) {

                direction = (nextCol > col)
                    ? "right"
                    : "left";

            } else {

                // Salt de fila
                direction = "down";
            }

        } else {

            direction = "end";
        }


        // Etiqueta tipus de casella
        const label = (
            c.type !== "start"
            && c.type !== "final"
        )
            ? `<div class="cell-type">${c.type.toUpperCase()}</div>`
            : "";


        // Detectar si hi ha equips a la casella
        const isHere = teams.some(t => t.pos === i);


        // Crear element HTML
        const div = document.createElement("div");

        div.className =
            `cell ${c.type} dir-${direction} ${isHere ? "active-cell" : ""}`;


        // HTML intern de la casella
        div.innerHTML = `
            <div class='cell-number'>${i}</div>
            ${label}
            <div id='t${i}'></div>
        `;

        b.appendChild(div);
    });



    // ==================================================
    // TOKENS / FITXES
    // ==================================================

    teams.forEach(t => {

        const tok = document.createElement("div");

        tok.className = "token";

        tok.style.background = t.color;

        tok.textContent = t.name[0];

        const slot = document.getElementById("t" + t.pos);

        if (slot) {
            slot.appendChild(tok);
        }
    });



    // ==================================================
    // TORN ACTIU
    // ==================================================

    const turnEl = document.getElementById("turn");

    if (turnEl) {
        turnEl.innerText = "Torn: " + teams[active].name;
    }



    // ==================================================
    // MARCADOR
    // ==================================================

    const scoresEl = document.getElementById("scores");

    if (!scoresEl) return;

    scoresEl.innerHTML = teams.map(t => {
        const isActive = t === teams[active];
        return `
    <div class="score-row">

  <div class="team-members-side">
    ${t.members
                .map(m => `${m.firstname} ${m.lastname}`)
                .join("<hr>")}
  </div>

  <div class='score ${isActive ? "active" : ""}'>

      <div class="score-header">
        <span class="team-name" style="background:${t.color}">
          ${t.name}
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

          <span class="value ${t.pop < 0 ? "neg" : "pos"}">
            ${t.pop}
          </span>
        </div>

        <div class="bar">
          <div
            class="fill pop pos"
            style="
                width:${Math.max(0, t.pop) * 10}%">
          </div>

          <div
            class="fill pop neg"
            style="
                width:${Math.max(0, -t.pop) * 10}%">
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

          <span class="value ${t.crit < 0 ? "neg" : "pos"}">
            ${t.crit}
          </span>
        </div>

        <div class="bar">
          <div
            class="fill crit pos"
            style="
                width:${Math.max(0, t.crit) * 10}%">
          </div>

          <div
            class="fill crit neg"
                style="width:${Math.max(0, -t.crit) * 10}%">
          </div>
        </div>

        <span class="pos" style="float:right; font-size:0.9rem;">
          Casella ${t.pos}
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

    const t = teams[active];

    moveStepByStep(t, r);
}



// ======================================================
// EVENTS DE CASELLES
// ======================================================



/**
 * Gestiona l’event de la casella actual.
 */
function event() {

    const t = teams[active];

    const type = board[t.pos].type;


    // START
    if (type === "start") {

        nextTurn();

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

        nextTurn();

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

            const t = teams[active];

            // Modificar puntuacions
            t.pop += opt.pop || 0;
            t.crit += opt.crit || 0;

            // Tancar modal
            o.classList.remove("show");

            clearInterval(interval);

            // Comptador de torns
            turns++;

            // Sistema injust cada 3 torns
            if (turns % 3 === 0) {
                unfair();
            }

            saveGame();

            nextTurn();
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

    if (!used[type]) {
        used[type] = [];
    }

    const pool = preguntes[type];

    const available = pool.filter(
        (_, i) => !used[type].includes(i)
    );

    // Reiniciar si ja s’han fet totes
    if (available.length === 0) {

        used[type] = [];

        return getRandomQuestion(type);
    }

    const index = Math.floor(
        Math.random() * available.length
    );

    const q = available[index];

    used[type].push(pool.indexOf(q));

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

    const sorted = [...teams]
        .sort((a, b) => b.pop - a.pop);

    sorted[0].pop += 2;

    sorted[sorted.length - 1].pop -= 1;
}



// ======================================================
// CANVI DE TORN
// ======================================================



/**
 * Passa el torn al següent equip.
 */
function nextTurn() {

    active = (active + 1) % teams.length;

    document.getElementById("dice").innerText = "🎲";

    render();

    resetDice();

    saveGame();
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
function moveStepByStep(team, steps) {

    let count = 0;

    const move = setInterval(() => {

        // Final moviment
        if (
            count >= steps
            || team.pos >= caselles - 1
        ) {

            clearInterval(move);

            render();

            // Petit delay abans del modal
            setTimeout(() => event(), 500);

            return;
        }

        // Avançar una casella
        team.pos++;

        render();

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
    teams = names.map((n, i) => ({
        name: n,
        color: colors[i],
        pos: 0,
        pop: 0,
        crit: 0,
        members: []
    }));


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
        dam.length < teams.length
        || smx.length < teams.length
    ) {

        alert(
            "No hi ha prou alumnes de cada grup per garantir barreja!"
        );
    }


    // Assignar 1 DAM
    teams.forEach((t, i) => {

        if (dam[i]) {
            t.members.push(dam[i]);
        }
    });


    // Assignar 1 SMX
    teams.forEach((t, i) => {

        if (smx[i]) {
            t.members.push(smx[i]);
        }
    });


    // Resta alumnes
    const remaining = [
        ...dam.slice(teams.length),
        ...smx.slice(teams.length)
    ];

    shuffle(remaining);

    remaining.forEach((s, i) => {

        teams[i % teams.length]
            .members.push(s);
    });


    renderTeamsPreview();

    saveTeams();
}



/**
 * Mostra els equips generats
 * a la pantalla inicial.
 */
function renderTeamsPreview() {

    const el = document.getElementById("teamsPreview");

    el.innerHTML = teams.map(t => `
        <div style="margin-bottom:10px">
            <strong style="color:${t.color}">
                ${t.name}
            </strong><br>

            ${t.members
                .map(m => `${m.firstname} ${m.lastname}`)
                .join(", ")}
        </div>
    `).join("");
}



/**
 * Inicia una nova partida.
 */
function startGame() {

    document.getElementById("setup")
        .style.display = "none";

    active = 0;

    turns = 0;


    teams.forEach(t => {

        t.pos = 0;
        t.pop = 0;
        t.crit = 0;
    });

    render();

    saveGame();
}



// ======================================================
// INIT
// ======================================================



/**
 * Inicialització principal del sistema.
 */
async function init() {

    await loadQuestions();

    await loadAlumnes();


    // ==================================================
    // 1. PARTIDA EN CURS
    // ==================================================

    const loadedGame = loadGame();

    if (loadedGame) {

        teams = loadedGame.teams;

        active = loadedGame.active;

        turns = loadedGame.turns;

        document.getElementById("setup")
            .style.display = "none";

        render();

        return;
    }


    // ==================================================
    // 2. EQUIPS GUARDATS
    // ==================================================

    const loadedTeams = loadTeams();

    if (loadedTeams) {

        teams = loadedTeams;

        renderTeamsPreview();

        return;
    }


    // ==================================================
    // 3. PRIMERA EXECUCIÓ
    // ==================================================

    buildRandomTeams();

    render();
}



// Inicialitzar aplicació
init();