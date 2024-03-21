<template>
    <div class="page">
        <div class="login">
            <form @submit.prevent="login()">
            <h1> VUE IOT </h1>
                <input v-model="username" id="username" type="text" placeholder="Usuario">
                <input v-model="password" id="password" type="password" placeholder="Contraseña">
                <button>INICIAR SESIÓN</button>
                <p class="message">{{ message }}</p>
                <p class="signup" @click="router.push({ name: 'signup' })">o regístrate aquí</p>
            </form>
        </div>
    </div>
</template>


<script setup>

/* imports */
import { ref } from 'vue'

import { useRouter } from 'vue-router'

import { useStore } from '@/stores/user.js'

import { getUser } from '@/firebase.js'

//

const router = useRouter()

const user = useStore()

//

const message = ref("")

const username = ref("")
const password = ref("")

const login = () => {
    if(username.value != ''){
        getUser(username.value, (userDocs) => {
            if(userDocs.size == 1){
                userDocs.forEach(userDoc => {
                    if(password.value === userDoc.data().password){
                        user.setID(userDoc.id)
                        user.setUsername(userDoc.data().username)
                        router.push({ name: 'principal' })
                    } else message.value = 'Contraseña incorrecta'
                })
            } else message.value = 'El usuario no existe'
        })
    } else message.value = 'Rellena el campo de usuario'
}

</script>

<style scoped>
.page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(to right, #000074, #000000); 
}

.login {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login h1 {
    font-weight: bold;
    color: #0000ff;
    margin-bottom: 20px;
    font-size: 32px;
}

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  box-sizing: border-box;
  border: 1px solid #6e6e6e;
  border-radius: 4px;
}

button {
  background-color: #3498db; /* Cambia esto al color del botón que desees */
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: rgb(1, 68, 112);; /* Cambia esto al color del botón al pasar el ratón que desees */
}

.message {
  color: #e74c3c; /* Cambia esto al color del mensaje que desees */
  margin-top: 10px;
}

.signup {
    display: inline-block;
  padding: 8px;
  font-weight: lighter;
  cursor: pointer;
  color: #0000ff; /* Color de texto azul */
  margin-top: 15px;
  text-decoration: none;
  transition: text-decoration 0.3s ease;;
}

.signup:hover {
  text-decoration: underline;
}
</style>
