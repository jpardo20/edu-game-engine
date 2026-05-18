import { rollDice } from "./dice.js";
import { calculateNextPosition } from "./movement.js";

export function createGameEngine(state) {

    return {

        roll(sides = 6) {
            return rollDice(sides);
        },

        nextTurn() {
            if (!state.equips.length) return;

            state.equipActiu =
                (state.equipActiu + 1)
                % state.equips.length;
        },

        getCurrentPlayer() {
            return state.equips[state.equipActiu] || null;
        },

        movePlayer(player, steps, maxPosition) {
            if (!player) return null;

            player.posicioTaulell = calculateNextPosition(
                player.posicioTaulell,
                steps,
                maxPosition
            );

            return player.posicioTaulell;
        },

        resetTeams() {
            state.equipActiu = 0;
            state.quantitatDeTorns = 0;

            state.equips.forEach(equip => {
                equip.posicioTaulell = 0;
                equip.barra1 = 0;
                equip.barra2 = 0;
            });
        },

        applyUnfairSystem() {
            const unfairSystem = state.config?.unfairSystem;

            if (
                !unfairSystem?.enabled
                || !state.equips.length
                || state.quantitatDeTorns % unfairSystem.frequency !== 0
            ) {
                return;
            }

            const sorted = [...state.equips]
                .sort((a, b) => b.barra1 - a.barra1);

            sorted[0].barra1 += unfairSystem.leaderBonus;
            sorted[sorted.length - 1].barra1 -= unfairSystem.lastPenalty;
        }
    };
}

export function shuffle(arr) {
    const copy = [...arr];

    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(
            Math.random() * (i + 1)
        );

        [copy[i], copy[j]] = [copy[j], copy[i]];
    }

    return copy;
}