export function calculateNextPosition(currentPosition, steps, maxPosition) {
    return Math.min(
        currentPosition + steps,
        maxPosition
    );
}