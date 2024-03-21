import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useStore = defineStore('user', () => {
  // Recupera el ID del localStorage al cargar la página
  const id = ref(localStorage.getItem('id') || '')

  const username = ref('')
  const getID = () => id.value
  
  const setID = (newID) => {
    id.value = newID
    // Guarda el nuevo ID en localStorage
    localStorage.setItem('id', newID)
  }

  const getUsername = () => username.value
  const setUsername = (newUsername) => (username.value = newUsername)
  const logout = () => {
    id.value = ''
    username.value = ''
    // Elimina el ID almacenado en localStorage al cerrar sesión
    localStorage.removeItem('id')
  }

  return { getID, setID, getUsername, setUsername, logout }
})
