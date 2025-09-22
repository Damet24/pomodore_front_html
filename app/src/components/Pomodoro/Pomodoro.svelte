<script lang="ts">
    import Timer from './Timer.svelte'
    import ButtonGroup from "./ButtonGroup.svelte"
    import {MS_PER_MINUTE, MS_VALUE} from "../../lib/constants.ts"
    import {createTimer} from "../../store/timerStore.ts"
    import {APP_STATES, type AppConfig, type Button, createPomodoroFSM} from "../../lib/pomodoro.ts"

    let appConfig: AppConfig = {
        longBreak: 3000,
        shortBreak: 2000,
        pomodoroTime: 4000,
        pomodoroTimes: 4,
    }

    let pomodoro = createTimer(appConfig.pomodoroTime, MS_VALUE)
    const pomodoroTime = pomodoro.time

    const buttons = $state<Button[]>([
        {
            name: "Iniciar",
            action: ({ appState, prevState, transition, cycles }) => {
                if (appState === APP_STATES.IDLE) {
                    transition(APP_STATES.POMODORO)
                } else if (appState === APP_STATES.POMODORO) {
                    transition(APP_STATES.PAUSED)
                } else if (appState === APP_STATES.PAUSED) {
                    if (prevState) transition(prevState)
                    else transition(APP_STATES.POMODORO)
                } else if (appState === APP_STATES.SHORT_BREAK || appState === APP_STATES.LONG_BREAK) {
                    if (prevState === APP_STATES.POMODORO) {
                        transition($cycles % appConfig.pomodoroTimes === 0 ? APP_STATES.LONG_BREAK : APP_STATES.SHORT_BREAK)
                    }
                    else transition(APP_STATES.PAUSED)
                }
            }
        },
        {
            name: "Reiniciar",
            action: ({transition}) => {
                pomodoro.reset(appConfig.pomodoroTime)
                transition(APP_STATES.IDLE)
            }
        }
    ])

    const {cycles}: ReturnType<typeof createPomodoroFSM> = $state(createPomodoroFSM(appConfig, pomodoro, buttons))

</script>

<main class="flex flex-col">
    <div class="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-stone-800 dark:border-stone-700 flex justify-center items-center flex-col gap-2">
        <header>
            <div class="flex items-center justify-center flex-col pb-2">
                <h1 class="text-2xl font-bold">Tiempo de Trabajo</h1>
                <p>Sesión #{$cycles + 1}</p>
            </div>


            <Timer time={$pomodoroTime} max_time={appConfig.pomodoroTime}/>
        </header>
        <div class="w-full h-2 bg-black rounded"></div>
        <footer>

            <ButtonGroup {buttons}/>


            <!--            <div class="inline-flex rounded-md shadow-xs" role="group">-->
            <!--                <button type="button"-->
            <!--                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-900 rounded-s-lg hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">-->
            <!--                    <svg class="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"-->
            <!--                         fill="currentColor"-->
            <!--                         viewBox="0 0 20 20">-->
            <!--                        <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z"/>-->
            <!--                    </svg>-->
            <!--                    Profile-->
            <!--                </button>-->
            <!--                <button type="button"-->
            <!--                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border-t border-b border-gray-900 hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">-->
            <!--                    <svg class="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none"-->
            <!--                         viewBox="0 0 20 20">-->
            <!--                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"-->
            <!--                              stroke-width="2"-->
            <!--                              d="M4 12.25V1m0 11.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M4 19v-2.25m6-13.5V1m0 2.25a2.25 2.25 0 0 0 0 4.5m0-4.5a2.25 2.25 0 0 1 0 4.5M10 19V7.75m6 4.5V1m0 11.25a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM16 19v-2"/>-->
            <!--                    </svg>-->
            <!--                    Settings-->
            <!--                </button>-->
            <!--                <button type="button"-->
            <!--                        onclick={() => {-->
            <!--                            pomodoro.reset(20000)-->
            <!--                        }}-->
            <!--                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-900 bg-transparent border border-gray-900 rounded-e-lg hover:bg-gray-900 hover:text-white focus:z-10 focus:ring-2 focus:ring-gray-500 focus:bg-gray-900 focus:text-white dark:border-white dark:text-white dark:hover:text-white dark:hover:bg-gray-700 dark:focus:bg-gray-700">-->
            <!--                    <svg class="w-3 h-3 me-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"-->
            <!--                         fill="currentColor"-->
            <!--                         viewBox="0 0 20 20">-->
            <!--                        <path d="M14.707 7.793a1 1 0 0 0-1.414 0L11 10.086V1.5a1 1 0 0 0-2 0v8.586L6.707 7.793a1 1 0 1 0-1.414 1.414l4 4a1 1 0 0 0 1.416 0l4-4a1 1 0 0 0-.002-1.414Z"/>-->
            <!--                        <path d="M18 12h-2.55l-2.975 2.975a3.5 3.5 0 0 1-4.95 0L4.55 12H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2Zm-3 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z"/>-->
            <!--                    </svg>-->
            <!--                    Downloads-->
            <!--                </button>-->
            <!--            </div>-->

        </footer>
    </div>
</main>