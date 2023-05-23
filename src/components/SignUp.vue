<script setup lang="ts">
import { ref } from 'vue';
import {
    createUserWithEmailAndPassword,
    getAuth,
    sendEmailVerification,
    UserCredential,
    GoogleAuthProvider
} from "firebase/auth";
import { initializeApp } from 'firebase/app';
import { useRouter } from 'vue-router';
import firebaseConfig from "../../firebaseConfig";
import swal from "sweetalert"

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const username = ref("");
const password = ref("");
const confirm = ref("")

const router = useRouter();

const loginHandler = () => {
    if (password.value != confirm.value) {
        swal("Passwords do not match.")
    }
    else if (username.value.length > 1
        && password.value.length >= 8) {
        createUserWithEmailAndPassword(auth, username.value, password.value)
            .then((cred: UserCredential) => {
                sendEmailVerification(cred.user);
                username.value = "";
                password.value = "";
                swal("Please verify your email address and return to log in.")
                auth.signOut();
                router.replace({ path: "/" });
            })
            .catch((err: any) => {
                // console.log("Error", err);
            })
    }
    else if (password.value.length < 8) {
        swal("Password must be at least 8 characters.");
    }
}


</script>

<template>
    <div>
        <RouterLink to="/">Home</RouterLink>
        <p>Create an account with your email. Password must be at least 8 characters.</p>
        <input type="text" v-model="username" placeholder="Email" />
        <br />
        <input type="password" v-model="password" placeholder="Password" />
        <br />
        <input type="password" v-model="confirm" placeholder="Confirm Password" />
        <br />
        <button class="primaryBtn" @click="loginHandler">Sign Up</button>
    </div>
</template>

<style scoped>
button {
    margin-top: 1em;
}

input {
    margin-top: .5em;
    margin-bottom: .5em;
}
</style>