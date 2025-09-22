import {type Writable, writable, get} from "svelte/store";

export interface TimerAPI {
    time: Writable<number>;
    start: () => void;
    stop: () => void;
    reset: (newDuration?: number, autoStart?: boolean) => void;
    onFinish: (fn: (api: TimerAPI) => void) => () => void;
}

export function createTimer(duration: number, step = 1000): TimerAPI {
    const time = writable(duration);
    let interval: ReturnType<typeof setInterval> | null = null;
    const finishListeners: ((api: TimerAPI) => void)[] = [];

    function start() {
        stop();
        interval = setInterval(() => {
            const current = get(time);
            const next = current - step;

            if (next <= 0) {
                stop();
                time.set(0);

                setTimeout(() => {
                    finishListeners.forEach(fn =>
                        fn({time, start, stop, reset, onFinish})
                    );
                }, step);

                return;
            }

            time.set(next);
        }, step);
    }

    function stop() {
        if (interval !== null) {
            clearInterval(interval);
            interval = null;
        }
    }

    function reset(newDuration = duration, autoStart = false) {
        stop();
        time.set(newDuration);
        if (autoStart) {
            setTimeout(() => start(), 0);
        }
    }

    function onFinish(fn: (api: TimerAPI) => void): () => void {
        finishListeners.push(fn);
        return () => {
            const idx = finishListeners.indexOf(fn);
            if (idx !== -1) finishListeners.splice(idx, 1);
        };
    }

    return {time, start, stop, reset, onFinish};
}
