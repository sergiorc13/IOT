import { initializeApp } from 'firebase/app'
import { getFirestore, doc, collection, query, where, onSnapshot, addDoc, deleteDoc, updateDoc } from 'firebase/firestore'



export const firebaseApp = initializeApp({
    apiKey: "AIzaSyAFpihSfji648IMt2BqVNuvyTc6o63vgBg",
    authDomain: "cliente-fdd75.firebaseapp.com",
    projectId: "cliente-fdd75",
    storageBucket: "cliente-fdd75.appspot.com",
    messagingSenderId: "315245708735",
    appId: "1:315245708735:web:6499df40f7c346ce34cd0a",
    measurementId: "G-9K2JF5RC52"
})

const db = getFirestore(firebaseApp)

export const getUser = (username, callback) => onSnapshot(query(collection(db, 'users'), where("username", "==", username)), callback)
export const addUser = (user) => addDoc(collection(db, 'users'), user)
export const getSpaces = (user, callback) => onSnapshot(query(collection(db, 'spaces'), where("user", "==", user)), callback)
export const addSpace = (space) => addDoc(collection(db, 'spaces'), space)
export const deleteSpace = (id) => {
    onSnapshot(query(collection(db, 'devices'), where("space", "==", id)), (docs) => {
        docs.forEach(deviceDoc => deleteDoc(doc(db, 'devices', deviceDoc.id))) 
    })
    deleteDoc(doc(db, 'spaces', id))
}
export const getDevices = (user, callback) => onSnapshot(query(collection(db, 'devices'), where("user", "==", user)), callback)
export const addDevice = (device) => addDoc(collection(db, 'devices'), device)
export const deleteDevice = (id) => deleteDoc(doc(db, 'devices', id))
export const updateDevice = (id, device) => updateDoc(doc(db, "devices", id), device)
export const getUnits = (callback) => onSnapshot(collection(db, 'units'), callback)