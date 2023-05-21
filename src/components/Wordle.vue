<script setup lang="ts">
import dayjs from "dayjs";
import { ref, Ref } from "vue";
import { getAuth } from "firebase/auth";
import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore, setDoc, doc } from "firebase/firestore";
import swal from "sweetalert";
import randomWords from "random-words";
import wordExists from "word-exists";

import firebaseConfig from "../../firebaseConfig";

const app: FirebaseApp = initializeApp(firebaseConfig);
const db: Firestore = getFirestore(app)

let answer = ref("");
let startTime: string = "";
let endTime: string = "";

// https://www.npmjs.com/package/random-words
do {
    answer.value = randomWords({ exactly: 1, maxLength: 5 })[0].toUpperCase();
} while (answer.value.length != 5)

const userGuesses: Ref<string[]> = ref([]);
let guessText = ref("");
let guessCount: number = 0;
let checkBtn = true;
let showWord = ref(false);

const inputClickedHandler = () => {
    if (startTime == "") {
        startTime = dayjs().toISOString();
    }
}

const newGameHandler = () => {
    checkBtn = true;
    guessCount = 0;
    do {
        answer.value = randomWords({ exactly: 1, maxLength: 5 })[0].toUpperCase();
    } while (answer.value.length != 5)
    for (let i = 0; i < 6; i++) {
        userGuesses.value.pop();
    }
    startTime = dayjs().toISOString();
    endTime = "";
}

const gameOverHandler = (startTime: string, endTime: string, result: number, secretWord: string, guesses: number) => {
    endTime = dayjs().toISOString();
    const gameTime = dayjs(endTime).diff(dayjs(startTime), "second")
    checkBtn = false;
    const auth = getAuth(app);
    if (auth.currentUser?.uid != null) {
        const uid: string = auth.currentUser.uid;
        const entryDoc = doc(db, "users", uid, "gameHistory", startTime);
        setDoc(entryDoc, { startTime: startTime, result: result, secretWord: answer.value, guesses: guessCount, durationSec: gameTime });
    }
}

const getClass = (index: number, guesses: string[]): string => {
    /* Returns empty class string (default style) if index 
        is to a position in the guess list that has not been
        added yet */
    if (index >= guessCount * 5) {
        return "empty"
    } else {
        let guessChar = guesses[Math.floor(index / 5)].charAt(index % 5)
        // If character is in correct place
        if (answer.value.split('').some((c) => { return guessChar === c })) {
            if (guessChar == answer.value.charAt(index % 5)) {
                return "correct"
            } else {
                let filteredAnswer = ""
                let filteredGuess = ""
                // Creates copy of each string, replacing matched chars with '*'
                for (let i = 0; i < 5; i++) {
                    if (answer.value.split('')[i] != guesses[Math.floor(index / 5)].charAt(i)) {
                        filteredAnswer = filteredAnswer + answer.value.split('')[i]
                        filteredGuess = filteredGuess + guesses[Math.floor(index / 5)].charAt(i)
                    }
                    else {
                        filteredAnswer = filteredAnswer + "*"
                        filteredGuess = filteredGuess + "*"
                    }
                }

                /* If the number of occurrences of the guessCharacter in the filtered answer 
                    is less than or equal to its number of occurrences in substring of the 
                    guess up to the current index, return the 'misplaced' class */
                if (filteredGuess.substring(0, (index % 5) + 1)
                    .split('').filter(c => c == guessChar).length <=
                    filteredAnswer.split('').filter(c => c == guessChar).length) {
                    return "misplaced"
                }
            }
        }
        return "incorrect";
    }
}

const showWordHandler = () => { showWord.value = !showWord.value }

const enterInputHandler = () => {
    let guess: string = guessText.value.value;
    if (guess.length === 5 && guessCount < 6 && wordExists(guess)) {
        ++guessCount;
        userGuesses.value.push(guess.toUpperCase());
        if (guess.toUpperCase() === answer.value.toUpperCase()) {
            swal("You Win!\nYou guessed " + answer.value + " in " + guessCount + (guessCount == 1 ? " guess." : " guesses."))
            gameOverHandler(startTime, endTime, 1, answer.value, guessCount);
        }
        else if (guessCount > 5) {
            swal("You lost. The secret word was " + answer.value)
            gameOverHandler(startTime, endTime, 0, answer.value, guessCount)
        }
        guessText.value.value = "";
        return;
    }
    else if (!wordExists(guess)) {
        swal("Please enter a valid word.")
    }
    else if (guess.length != 5) {
        swal("Please enter a 5 character word.")
    }
}
</script>

<template>
    <button id="newGameBtn" @click="newGameHandler">New Game</button>
    <button v-show="!showWord" id="showWordBtn" @click="showWordHandler">Show Answer</button>
    <button v-show="showWord" id="showWordBtn" @click="showWordHandler">Hide Answer</button>
    <label id="answerLabel" v-show="showWord">{{ answer }}</label>
    <br />
    <div id="boxes">
        <span id="box" v-for="i in 30" :class="getClass(i - 1, userGuesses)">{{
            Math.floor((i - 1) / 5) < userGuesses.length ? userGuesses[Math.floor((i - 1) / 5)].charAt((i - 1) % 5) : " "
        }}</span>
    </div>
    <br />
    <input type="text" @click="inputClickedHandler" ref="guessText" />
    <!-- conditionally disable source: https://www.w3docs.com/snippets/vue-js/how-to-disable-input-conditionally-in-vue-js.html -->
    <button id="enterGuessBtn" :disabled="checkBtn === false" @click="enterInputHandler">Check</button>
    <br />
</template>

<style scoped>
#boxes {
    /* derived from class timer example */
    display: inline-grid;
    grid-template-columns: repeat(5, 1fr);
    grid-gap: 8px;
    height: 10px;
    height: 100%;
    margin-top: 1em;
    margin-bottom: 1em;
}

#box {
    border: solid .1em rgb(170, 175, 179);
    border-radius: 4px;
    min-width: 3.5em;
    min-height: 3.5em;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

#enterGuessBtn {
    margin-left: 1em;
}

#showWordBtn {
    margin-left: 1em;
    margin-right: 1em;
}

/* Wordle color palette source: https://www.color-hex.com/color-palette/1012607  */

.correct {
    color: white;
    background-color: rgb(108, 169, 101);
}

.incorrect {
    color: white;
    background-color: rgb(120, 124, 127)
}

.misplaced {
    color: white;
    background-color: rgb(200, 182, 83);
}

.empty {
    background-color: white;
}

#answerLabel {
    border-bottom: solid 1px black;
}
</style>
