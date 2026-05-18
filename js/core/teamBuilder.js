import Equip from "./Equip.js";
import { shuffle } from "./gameEngine.js";

export function buildRandomTeams(students) {

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

    const equips = names.map((name, index) => {

        const equip = new Equip(name);

        equip.color = colors[index];
        equip.posicioTaulell = 0;

        return equip;
    });

    const dam = students.filter(
        student => student.grup === "DAM"
    );

    const smx = students.filter(
        student => student.grup === "SMX"
    );

    const damShuffled = shuffle(dam);
    const smxShuffled = shuffle(smx);

    if (
        damShuffled.length < equips.length
        || smxShuffled.length < equips.length
    ) {
        alert(
            "No hi ha prou alumnes de cada grup per garantir barreja!"
        );
    }

    equips.forEach((equip, index) => {
        if (damShuffled[index]) {
            equip.membresEq.push(damShuffled[index]);
        }
    });

    equips.forEach((equip, index) => {
        if (smxShuffled[index]) {
            equip.membresEq.push(smxShuffled[index]);
        }
    });

    const remaining = [
        ...damShuffled.slice(equips.length),
        ...smxShuffled.slice(equips.length)
    ];

    shuffle(remaining).forEach((student, index) => {
        equips[index % equips.length]
            .membresEq.push(student);
    });

    return equips;
}