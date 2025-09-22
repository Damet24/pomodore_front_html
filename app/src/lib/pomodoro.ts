import type {createTimer} from "../store/timerStore.ts"
import {writable, get} from "svelte/store";

export enum APP_STATES {
    IDLE = "IDLE",
    POMODORO = "POMODORO",
    SHORT_BREAK = "SHORT_BREAK",
    LONG_BREAK = "LONG_BREAK",
    PAUSED = "PAUSED",
}

export interface AppConfig {
    longBreak: number
    shortBreak: number
    pomodoroTime: number
    pomodoroTimes: number
}

interface FSM {
    state: APP_STATES
    prevState?: APP_STATES
    transition: (next: APP_STATES) => void
}

export interface Button {
    name: string
    action: (fsm: ReturnType<typeof createPomodoroFSM>) => void
}

export function createPomodoroFSM(
    appConfig: AppConfig,
    pomodoro: ReturnType<typeof createTimer>,
    buttons: Button[]
) {
    let appState: APP_STATES = APP_STATES.IDLE
    let prevState: APP_STATES | undefined
    let cycles = writable(0)


    const transitionMap: Record<
        APP_STATES,
        Partial<Record<APP_STATES, () => void>>
    > = {
        [APP_STATES.IDLE]: {
            [APP_STATES.POMODORO]: () => {
                pomodoro.start()
                buttons[0].name = "Pausar"
                appState = APP_STATES.POMODORO
            },
        },
        [APP_STATES.POMODORO]: {
            [APP_STATES.PAUSED]: () => {
                pomodoro.stop()
                buttons[0].name = "Continuar"
                appState = APP_STATES.PAUSED
            },
            [APP_STATES.SHORT_BREAK]: () => {
                pomodoro.reset(appConfig.shortBreak)
                buttons[0].name = "Iniciar"
                appState = APP_STATES.SHORT_BREAK
            },
            [APP_STATES.LONG_BREAK]: () => {
                pomodoro.reset(appConfig.longBreak)
                buttons[0].name = "Iniciar"
                appState = APP_STATES.LONG_BREAK
            },
        },
        [APP_STATES.SHORT_BREAK]: {
            [APP_STATES.PAUSED]: () => {
                pomodoro.stop()
                buttons[0].name = "Continuar"
                appState = APP_STATES.PAUSED
                prevState = APP_STATES.SHORT_BREAK
            },
            [APP_STATES.SHORT_BREAK]: () => {
                pomodoro.start()
                buttons[0].name = "Pausar"
                appState = APP_STATES.SHORT_BREAK
            },
            [APP_STATES.IDLE]: () => {
                pomodoro.reset(appConfig.pomodoroTime)
                buttons[0].name = "Iniciar"
                appState = APP_STATES.IDLE
                prevState = undefined
            },
        },
        [APP_STATES.LONG_BREAK]: {
            [APP_STATES.PAUSED]: () => {
                pomodoro.stop()
                buttons[0].name = "Continuar"
                appState = APP_STATES.PAUSED
            },
            [APP_STATES.LONG_BREAK]: () => {
                pomodoro.start()
                 buttons[0].name = "Pausar"
                appState = APP_STATES.LONG_BREAK
            },
            [APP_STATES.IDLE]: () => {
                pomodoro.reset(appConfig.pomodoroTime)
                buttons[0].name = "Iniciar"
                appState = APP_STATES.IDLE
                prevState = undefined
            },
        },
        [APP_STATES.PAUSED]: {
            [APP_STATES.POMODORO]: () => {
                pomodoro.start()
                buttons[0].name = "Pausar"
                appState = APP_STATES.POMODORO
            },
            [APP_STATES.SHORT_BREAK]: () => {
                pomodoro.start()
                buttons[0].name = "Pausar"
                appState = APP_STATES.SHORT_BREAK
            },
            [APP_STATES.LONG_BREAK]: () => {
                pomodoro.start()
                buttons[0].name = "Pausar"
                appState = APP_STATES.LONG_BREAK
            },
        },
    }

    function transition(next: APP_STATES) {
        const fn = transitionMap[appState][next]
        if (!fn) throw new Error(`Invalid transition: ${appState} → ${next}`)
        prevState = appState
        fn()
    }


    pomodoro.onFinish(() => {
        console.log(appState, prevState)
        if (appState === APP_STATES.POMODORO) {
            prevState = APP_STATES.POMODORO
            let isLongBreak = false
            cycles.update(c => {
                const next = c + 1
                isLongBreak = next % appConfig.pomodoroTimes === 0
                return next
            })

            transition(isLongBreak ? APP_STATES.LONG_BREAK : APP_STATES.SHORT_BREAK)

        } else if (appState === APP_STATES.LONG_BREAK || appState === APP_STATES.SHORT_BREAK) {
            transition(APP_STATES.IDLE)
        }
    })

    const fsm = {
        get appState() {
            return appState
        },
        get prevState() {
            return prevState
        },
        get cycles() {
            return cycles
        },
        transition
    }

    for (const btn of buttons) {
        const originalAction = btn.action
        btn.action = () => originalAction(fsm)
    }


    return fsm
}