import { createApp } from 'vue';
import { createRouter, createWebHashHistory } from 'vue-router';
import './style.css';
import App from './App.vue';
import Wordle from './components/Wordle.vue';
import Login from './components/Login.vue';
import SignUp from './components/SignUp.vue';
import Stats from "./components/Stats.vue";
import GameStats from './components/GameStats.vue';

const wordleRoutes = [
    { path: "/", component:Wordle },
    { path: "/login", component: Login },
    {  path: "/signup", component: SignUp },
    {  path: "/stats", component: GameStats },
    { path: "/gamestats", component: GameStats}
]

const wordleRouter = createRouter({routes: wordleRoutes, history: createWebHashHistory(),});

createApp(App).use(wordleRouter).mount('#app')
