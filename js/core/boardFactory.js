export function creaTaulell(casellesTotals, tipusCaselles) {

    return [...Array(casellesTotals)].map((_, index) => {

        if (index === 0) {
            return { type: "start" };
        }

        if (index === casellesTotals - 1) {
            return { type: "final" };
        }

        return {
            type: tipusCaselles[
                index % tipusCaselles.length
            ]
        };
    });
}

export function getCategoryLabel(id, config) {

    const found = config?.tipusCaselles
        ?.find(t => t.id === id);

    return found
        ? found.label
        : id;
}