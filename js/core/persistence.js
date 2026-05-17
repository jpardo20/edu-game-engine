export function saveGame(data) {

    localStorage.setItem(
        "bassaGame",
        JSON.stringify(data)
    );
}


export function loadGame() {

    const data = localStorage.getItem("bassaGame");

    if (!data) return null;

    try {

        return JSON.parse(data);

    } catch {

        return null;
    }
}


export function saveTeams(teams) {

    localStorage.setItem(
        "bassaTeams",
        JSON.stringify(teams)
    );
}


export function loadTeams() {

    const data = localStorage.getItem("bassaTeams");

    if (!data) return null;

    try {

        return JSON.parse(data);

    } catch {

        return null;
    }
}