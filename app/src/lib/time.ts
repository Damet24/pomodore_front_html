import {MIN_VALUE, MS_VALUE} from "./constants.ts";

export function formatMillisecondsToTime(ms: number): string {
    let totalSeconds = Math.floor(ms / MS_VALUE)
    let minutes = Math.floor(totalSeconds / MIN_VALUE)
    let seconds = totalSeconds % MIN_VALUE
    const pad = (num: number) => String(num).padStart(2, '0')
    return `${pad(minutes)}:${pad(seconds)}`
}
