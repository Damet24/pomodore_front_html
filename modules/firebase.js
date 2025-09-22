// Import the functions you need from the SDKs you need
import {initializeApp} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js"
import {getAnalytics} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-analytics.js"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDijuFFmOCnaASBi8fz2x76HD5CHu6bEsY",
    authDomain: "pomodoro-cc0be.firebaseapp.com",
    projectId: "pomodoro-cc0be",
    storageBucket: "pomodoro-cc0be.firebasestorage.app",
    messagingSenderId: "786182270238",
    appId: "1:786182270238:web:f7817ecba8c281d5b46d0f",
    measurementId: "G-HN9DRYQ8PQ"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)

export {app, analytics}