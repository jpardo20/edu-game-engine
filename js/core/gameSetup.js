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
export async function carregaAlumnesDesDeFitxer(file) {

    try {

        const text = await file.text();

        const data = JSON.parse(text);

        if (!data.alumnes || !Array.isArray(data.alumnes)) {

            throw new Error("El JSON no conté un array 'alumnes'");
        }

        return data.alumnes;

    } catch (err) {

        console.error("Error carregant fitxer d'alumnes:", err);

        alert("Error carregant el fitxer JSON d'alumnes.");

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