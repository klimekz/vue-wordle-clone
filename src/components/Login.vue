<script setup lang="ts">
import { ref } from 'vue';
import {
    getAuth,
    signInWithEmailAndPassword,
    UserCredential,
} from "firebase/auth";
import { initializeApp } from 'firebase/app';
import { useRouter } from "vue-router";
import swal from "sweetalert";
import firebaseConfig from "../../firebaseConfig";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const router = useRouter();
const username = ref("");
const password = ref("");

const loginHandler = () => {
    if (username.value.length > 0
        && password.value.length > 0) {
        signInWithEmailAndPassword(auth, username.value, password.value)
            .then((cred: UserCredential) => {
                if (cred.user?.emailVerified) {
                    username.value = "";
                    password.value = "";
                    router.push({ path: "/" });
                }
                else {
                    swal("Please verify your email address.");
                    console.log(cred);
                }
            })
            .catch((err: any) => {
                console.error("Error", err)
            })
    }
}


</script>

<template>
    <div>
        <RouterLink to="/">Home</RouterLink>
        <p>Welcome back! Log in to continue tracking your progress. </p>
        <input type="text" v-model="username" placeholder="Email" />
        <br />
        <input type="password" v-model="password" placeholder="Password" />
        <br />
        <button class="primaryBtn" @click="loginHandler">Log In</button>
    </div>
</template>

<style scoped>
button {
    margin-top: 1em;
}
</style>