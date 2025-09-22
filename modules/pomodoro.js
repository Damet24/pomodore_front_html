import i18next from 'https://deno.land/x/i18next/index.js'
// or import i18next from 'https://raw.githubusercontent.com/i18next/i18next/master/src/index.js'
// or import i18next from 'https://cdn.jsdelivr.net/gh/i18next/i18next/src/index.js'



i18next.init({
    lng: navigator.language.split('-')[0],
    resources: {
        en: {
            translation: {
                start: "Start",
                pomodoro: "Pomodoro",
                setting: "Setting",
                pause: "Pause",
                resume: "Resume",
                stop: "Stop",
                long_break: "Long Break",
                short_break: "Short Break",
                long_break_interval: "Long Break interval",
                save_changes: "Save Changes",
                cancel: "Cancel",
                save_setting_error_message: "To change the application settings, the timer must be stopped.",

            }
        },
        es: {
            translation: {
                start: "Empezar",
                pomodoro: "Pomodoro",
                setting: "Configuración",
                pause: "Pausar",
                resume: "Continuar",
                stop: "Detener",
                long_break: "Descanso largo",
                short_break: "Descanso Corto",
                long_break_interval: "Intervalo de descanso largo",
                save_changes: "Guardar cambios",
                cancel: "Cancelar",
                save_setting_error_message: "Para cambiar la configurción de la aplicación, el temporizador tine que estar detenido.",

            }
        }
    }
});

const POMODORO_LOGO_NAME = "logo.png"
const MS_PER_MINUTE = 60_000
const MS_VALUE = 1_000
const MIN_VALUE = 60

const board = document.querySelector("#board")
const main_button = document.querySelector("#main_button")
const second_button = document.querySelector("#second_button")
const state = document.querySelector("#state_")
const settingForm = document.querySelector("#setting_form")

main_button.addEventListener("click", handleButton)
settingForm.addEventListener("submit", handleSettingForm)

const APP_STATES = {
    STOPPED: 0,
    PAUSED: 1,
    POMODORO: 2,
};

const CHANGE_TO = {
    POMODORO: 0,
    LONG_BREAK: 1,
    SHORT_BREAK: 2
}

let appConfig = {
    longBreak: 15 * MS_PER_MINUTE,
    pomodoroTime: 25 * MS_PER_MINUTE,
    shortBreak: 5 * MS_PER_MINUTE,
    pomodoroTimes: 4,
}
let changeTo = CHANGE_TO.SHORT_BREAK
let appState = APP_STATES.STOPPED
const pomodoreTimes = 0
let timer = null
let pomodoroTime = appConfig.pomodoroTime
let pomodoroCount = 0
let restartPomodoro = false
const audio = new Audio("sound_sfx.wav")
let accumulated_time = 0
const history = []

function initApp() {
    state.innerText = i18next.t("pomodoro")
    main_button.innerText = i18next.t("start")
    second_button.innerText = i18next.t("stop")
    second_button.style.display = "none"
    document.querySelector("#setting_toggle").innerText = i18next.t("setting")
    document.querySelector("#form_submit").innerText = i18next.t("save_changes")
    document.querySelector("#cancel_button_modal").innerText = i18next.t("cancel")
    document.querySelector("#modal_title").innerText = i18next.t("setting")
    document.querySelector("#short_break_modal_label").innerText = i18next.t("short_break")
    document.querySelector("#long_break_modal_label").innerText = i18next.t("long_break")
    document.querySelector("#long_break_interval_modal_label").innerText = i18next.t("long_break_interval")

    document.querySelector("#quit_button_modal").addEventListener("click", hideSettingModal)
    document.querySelector("#cancel_button_modal").addEventListener("click", hideSettingModal)
    document.querySelector("#modal_background").addEventListener("click", hideSettingModal)
    document.querySelector("#setting_toggle").addEventListener("click", showSettingModal)
    updateBoard(appConfig.pomodoroTime)
}

function formatMillisecondsToTime(ms) {
    let totalSeconds = Math.floor(ms / MS_VALUE)
    let minutes = Math.floor(totalSeconds / MIN_VALUE)
    let seconds = totalSeconds % MIN_VALUE
    const pad = (num) => String(num).padStart(2, '0')
    return `${pad(minutes)}:${pad(seconds)}`
}

function parseToInteger(value) {
    return parseInt(value)
}

function updateBoard(time) {
    board.innerText = formatMillisecondsToTime(time)
}

function validateEndPomodore(time) {
    if (time === 0) {
        clearInterval(timer)
        main_button.innerText = i18next.t("start")
        const what = audio.play()

        switch (changeTo) {
            case CHANGE_TO.SHORT_BREAK:
                state.innerText = i18next.t("short_break")
                pomodoroTime = appConfig.shortBreak
                updateBoard(appConfig.shortBreak)
                changeTo = CHANGE_TO.POMODORO
                pomodoroCount += 1
                break

            case CHANGE_TO.LONG_BREAK:
                state.innerText = i18next.t("long_break")
                pomodoroTime = appConfig.longBreak
                updateBoard(appConfig.longBreak)
                changeTo = CHANGE_TO.POMODORO
                restartPomodoro = true
                break

            case CHANGE_TO.POMODORO:
                state.innerText = i18next.t("pomodoro")
                pomodoroTime = appConfig.pomodoroTime
                updateBoard(appConfig.pomodoroTime)
                accumulated_time += appConfig.pomodoroTime
                saveHistory({
                    type: "pomodoro",
                    duration: appConfig.pomodoroTime,
                    completedAt: Date.now()
                })
                if (pomodoroCount >= appConfig.pomodoroTimes - 1) {
                    changeTo = CHANGE_TO.LONG_BREAK
                } else {
                    changeTo = CHANGE_TO.SHORT_BREAK
                }
                break
        }
        appState = APP_STATES.STOPPED
    }
}

function saveHistory(session) {
    const history = JSON.parse(localStorage.getItem("history") || "[]")
    history.push(session)
    localStorage.setItem("history", JSON.stringify(history))
}

function getStats() {
    const history = JSON.parse(localStorage.getItem("history") || "[]")
    const now = new Date()

    const today = history.filter(h => {
        const d = new Date(h.completedAt)
        return d.toDateString() === now.toDateString()
    })

    const week = history.filter(h => {
        const d = new Date(h.completedAt);
        const firstDay = new Date(now.setDate(now.getDate() - now.getDay()))
        return d >= firstDay
    })

    const month = history.filter(h => {
        const d = new Date(h.completedAt)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })

    return {
        today: today.length,
        week: week.length,
        month: month.length
    }
}

function getInterval() {
    return setInterval(() => {
        updateBoard(pomodoroTime)
        validateEndPomodore(pomodoroTime)
        if (pomodoroTime > 0) {
            pomodoroTime -= MS_VALUE
        }
    }, MS_VALUE)
}

function startPomodore() {
    if (restartPomodoro) {
        pomodoroCount = 0
        restartPomodoro = false
    }
    appState = APP_STATES.POMODORO
    main_button.innerText = i18next.t("pause")
    timer = getInterval()
}

function pausePomodore() {
    clearInterval(timer)
    main_button.innerText = i18next.t("resume")
    appState = APP_STATES.PAUSED
}

function resumePomodore() {
    timer = getInterval()
    main_button.innerText = i18next.t("pause")
    appState = APP_STATES.POMODORO
}

function handleButton(_even) {
    switch (appState) {
        case APP_STATES.STOPPED:
            startPomodore()
            break;

        case APP_STATES.PAUSED:
            resumePomodore()
            break;

        case APP_STATES.POMODORO:
            pausePomodore()
            break;
    }

}

function updateSetting() {
    if (appState === APP_STATES.STOPPED) {
        pomodoroTime = appConfig.pomodoroTime
        updateBoard(pomodoroTime)
    }
}

function notifyMe() {
    if (!("Notification" in window)) {
        alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
        const notification = new Notification(i18next.t("pomodoro"), {icon: POMODORO_LOGO_NAME, body: "Hi there!"});
        notification.onclick = (event) => {

            // event.target.close()
        }
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
                const notification = new Notification("Hi there!");
            }
        });
    }
}

function handleSettingForm(event) {
    event.preventDefault()
    if (appState !== APP_STATES.STOPPED) {
        alert(i18next.t("save_setting_error_message"))
    } else {
        const formData = new FormData(event.target)
        const setting = Object.fromEntries(formData.entries())
        appConfig.longBreak = setting.long_break * MS_PER_MINUTE
        appConfig.shortBreak = setting.short_break * MS_PER_MINUTE
        appConfig.pomodoroTime = setting.pomodoro_time * MS_PER_MINUTE
        appConfig.pomodoroTimes = parseToInteger(setting.long_break_interval)
        updateSetting()
        hideSettingModal()
    }
}

function showSettingModal() {
    document.querySelector("#setting_modal").classList.add("is-active")
}

function hideSettingModal() {
    document.querySelector("#setting_modal").classList.remove("is-active")
}

initApp()