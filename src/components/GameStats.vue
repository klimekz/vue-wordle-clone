<script setup lang="ts">
import { onMounted, ref, Ref } from "vue";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
    getFirestore,
    getDocs,
    collection,
    QuerySnapshot,
    QueryDocumentSnapshot,
    query,
    orderBy,
    limit,
    where
}
    from "firebase/firestore";
import { initializeApp } from 'firebase/app';
import dayjs from "dayjs";
import { useRouter, RouterLink } from "vue-router";
const routes = useRouter();


const firebaseConfig = {
    apiKey: "AIzaSyAef5hV5hecw7BqemESwzh1SukCrhC0Df4",
    authDomain: "klimek-371-wordle.firebaseapp.com",
    projectId: "klimek-371-wordle",
    storageBucket: "klimek-371-wordle.appspot.com",
    messagingSenderId: "1049001023243",
    appId: "1:1049001023243:web:fbdb58c105a3fc045fb40e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const history: Ref<any> = ref([]);
const topTimes: Ref<any> = ref([]);
const wLData = ref([0, 0])

const sortDuration = () => {
    history.value.sort((a: any, b: any) => {
        return a.durationSec - b.durationSec;
    })
}

const sortGuesses = () => {
    history.value.sort((a: any, b: any) => {
        return a.guesses - b.guesses;
    })
}

const sortDate = () => {
    history.value.sort((a: any, b: any) => {
        return dayjs(b.startTime).diff(dayjs(a.startTime))
    })
}

const getTop10 = () => {
    let i = 1;
    const uuid: string = <string>auth.currentUser?.uid;
    const coll = collection(db, "users", uuid, "gameHistory");
    const q = query(coll, orderBy("durationSec"), where("result", "==", 1), limit(10));
    getDocs(q).then((snap: QuerySnapshot) => {
        snap.forEach((doc: QueryDocumentSnapshot) => {
            const docData = doc.data();
            const data = {
                "rank": i,
                "startTime": dayjs(docData.startTime).format("MM/DD/YY"),
                "secretWord": docData.secretWord,
                "durationSec": docData.durationSec + " sec",
                "guesses": docData.guesses,
            };
            i++;
            topTimes.value.push(data);
        })
    })
}

// Verifies auth state prior to requesting documents
if (auth != null) {
    const uuid: string = <string>auth.currentUser?.uid;
    const coll = collection(db, "users", uuid, "gameHistory");
    getDocs(coll).then((snap: QuerySnapshot) => {
        snap.forEach((doc: QueryDocumentSnapshot) => {
            const docData = doc.data();

            if (docData.result == 0) {
                wLData.value[1]++;
            }
            else if (docData.result == 1) {
                wLData.value[0]++;
            }

            const data = {
                "startTime": dayjs(docData.startTime).format("MM/DD/YY"),
                "result": docData.result == 0 ? "Loss" : "Win",
                "secretWord": docData.secretWord,
                "durationSec": docData.durationSec + " sec",
                "guesses": docData.guesses,
            };

            history.value.push(data);
        })
    })
}
sortDate();
getTop10();

onMounted(() => {
    if (!auth.currentUser)
        routes.push({ path: "/" });

})
</script>

<template>
    <h3>Statistics</h3>
    <RouterLink to="/">Home</RouterLink>
    <p v-show="wLData[0] + wLData[1] == 0">
        Play a game to begin tracking your stats!
    </p>
    <div>
        <h4 align="left">Record</h4>
        <p>Win Percentage: <b>{{ Math.floor(100 * wLData[0] / (wLData[0] + wLData[1])) }}%</b></p>
        <h4 align="left">Game Stats</h4>
        <table class="media">
            <tr>
                <th>Date</th>
                <th>Result</th>
                <th>Secret Word</th>
                <th>Duration</th>
                <th>Guesses</th>
            </tr>
            <tr v-for="val in history">
                <td v-for="attr of val">{{ attr }}</td>
            </tr>
        </table>
        <p>You've completed <b>{{ wLData[0] + wLData[1] }}</b> games of Wordle.</p>
        <h4 align="left">Top Times</h4>
        <table class="media">
            <tr>
                <th></th>
                <th>Date</th>
                <th>Secret Word</th>
                <th>Duration</th>
                <th>Guesses</th>
            </tr>
            <tr v-for="val in topTimes">
                <td v-for="attr of val">{{ attr }}</td>
            </tr>
        </table>
    </div>
</template>

<style scoped>
table {
    border: 1px solid black;
    border-radius: 0.5em;
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 3em;
}

td,
th {
    border: .5px solid black;
    width: 20%;
    padding-left: .75em;
    padding-right: .75em;
}

.header {
    color: white;
    background-color: grey;
}

.media {
    margin-top: 1.5em;
}

button {
    margin: 1em;
}

h4 {
    padding-top: 1em;
}

input {
    margin-left: 1em;
}
</style>