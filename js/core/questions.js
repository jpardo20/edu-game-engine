export function createQuestionManager() {

    const preguntesFetes = {};

    function getRandomQuestion(type, preguntes) {

        if (!preguntesFetes[type]) {
            preguntesFetes[type] = [];
        }

        const pool = preguntes[type];

        const available = pool.filter(
            (_, index) => !preguntesFetes[type].includes(index)
        );

        if (available.length === 0) {
            preguntesFetes[type] = [];
            return getRandomQuestion(type, preguntes);
        }

        const index = Math.floor(
            Math.random() * available.length
        );

        const question = available[index];

        preguntesFetes[type].push(
            pool.indexOf(question)
        );

        return question;
    }

    return {
        getRandomQuestion
    };
}