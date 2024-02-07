<template>
    <div class="page bg-darkgreen">
        <div class="signup">
            <form @submit.prevent="signup()">
            <h1>IOT de casa</h1>
                <input v-model="username" id="username" type="text" placeholder="Usuario">
                <input v-model="password" id="password" type="password" placeholder="Contraseña">
                <button>REGISTRARSE</button>
                <p class="message">{{ message }}</p>
                <p class="login" @click="router.push({ name: 'login' })">Si ya tienes cuenta, inicia sesión</p>
            </form>
        </div>
    </div>
</template>


<script setup>

/* imports */
import { ref } from 'vue'

import { useRouter } from 'vue-router'

import { addUser, getUser } from '@/firebase.js'

//

const router = useRouter()

//

const message = ref("")

const username = ref("")
const password = ref("")

const signup = () => {
    if(username.value == "")
        message.value = 'Rellena el campo usuario'
    else if(password.value == "")
        message.value = 'Rellena el campo contraseña'
    else {
        getUser(username.value, async(docs) => {
            if(docs.size < 1){
                await addUser({
                    username : username.value,
                    password : password.value
                })
                router.push({ name: 'login' })
            } else message.value = 'El usuario ya existe'
        })
    }
}

</script>


<style scoped>

/* Estilos personalizados */
.page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(to right, #000074, #000000);  
}

.signup {
    background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  font-size: 16px;
}

h1 {
  font-weight: bold;
  color: #0000ff; /* Color de texto azul */
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
  background-color: #3498db; 
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:hover {
  background-color: #2980b9; 
}

.message {
  color: #e74c3c; /* Cambia esto al color del mensaje que desees */
  margin-top: 10px;
}

.login {
  display: inline-block;
  padding: 8px;
  font-weight: lighter;
  cursor: pointer;
  color: #0000ff; /* Color de texto azul */
  margin-top: 15px;
  text-decoration: none;
  transition: text-decoration 0.3s ease;
}
  .login:hover {
    text-decoration: underline;
  }




</style>