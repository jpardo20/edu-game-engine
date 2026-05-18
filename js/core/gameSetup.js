export async function carregaConfiguracio() {

    const res = await fetch("./data/config.json");

    const config = await res.json();

    return {
        config,
        tempsPerTorn: config.tempsPerTorn,
        columnesTaulell: config.columnesTaulell,
        tipusCaselles: config.tipusCaselles.map(t => t.id),
        casellesTotals: config.casellesTotals
    };
}

export async function carregaPreguntes() {

    const res = await fetch("./data/preguntes.json");

    return await res.json();
}

export async function carregaAlumnes() {

    try {

        const res = await fetch("data/alumnes.json");
        const data = await res.json();

        return data.alumnes;

    } catch (err) {

        console.error("Error carregant alumnes:", err);

        return [];
    }
}

export function ompleTextarea(alumnesData) {

    const textarea = document.getElementById("studentsInput");

    if (!textarea) return;

    textarea.value = alumnesData
        .map(a => `${a.firstname} ${a.lastname}`)
        .join("\n");
}