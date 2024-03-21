<script setup>
// Imports necesarios para el código 
import { ref,  onMounted } from 'vue'

import { useRouter } from 'vue-router'

import { useStore } from '@/stores/user.js'

import { getSpaces, getDevices, addSpace, deleteSpace, addDevice, deleteDevice, updateDevice, getUnits } from '@/firebase.js'

const router = useRouter()                          //Router para cambiar de página
const user = useStore()                             //Usuario actual
const spaces = ref([])                              //Espacios de un usuario
const devices = ref([])                             //Dispositivos de un usuario
const spaceModal = ref(false)                       //Control del modal de creacion de espacios
const sensorModal = ref(false)                      //Control del modal de creacion de sensores
const executorModal = ref(false)                    //Control del modal de creacion de ejecutores
const switchModal = ref(false)                      //Control del modal de cambio de espacio de un dispositivo

const newSpaceName = ref('')                        //V-model del input del nuevo nombre que tiene un espacio creado
const newDeviceName = ref('')                       //V-model del input del nuevo nombre que tiene un dispositivo creado
const updatedDeviceName = ref('')                   //V-model del input del nuevo nombre que tiene un dispositivo editado
const updateDeviceValue = ref('')                   //V-model del input del nuevo valor que tiene un sensor editado 



const newSensorUnit = ref('unidad')                 //V-model del input del nuevo parámetro que mide un dispositivo creado
const newSensorValue = ref('')                      //V-model del input del nuevo valor que tiene un sensor creado
const selectedSpace = ref({})                       //Espacio utilizado a la hora de crear un nuevo dispositivo
const deviceSelected = ref({})                      //Dispositivo a trasladar durante un cambio de espacio

const message = ref('')                            //Mensaje de error en la creacion de un nuevo espacio o dispositivo            


//Crear un nuevo espacio
const newSpace = () => {
    if(newSpaceName.value != ''){
        addSpace({
            name: newSpaceName.value,
            user: user.getID()
        })
        closeModal()
    }
    else message.value = 'Ponle un nombre al espacio'
}


//Crear un nuevo sensor
const newSensor = () => {
    if(newDeviceName.value == '')
        message.value = 'Dale un nombre al sensor'
    else if(newSensorUnit.value == 'unidad')
        message.value = 'Selecciona lo que quieras medir'
    else if(newSensorValue.value === '')
        message.value = 'Ingresa un valor numérico para el sensor'; // Verifica si se ha ingresado un valor numérico
    else {
        addDevice({
            type: 'sensor',
            name: newDeviceName.value,
            space: selectedSpace.value.id,
            value: newSensorValue.value, // Asigna el valor numérico ingresado a device.data.value
            unit: newSensorUnit.value,
            user: user.getID()
        });
        closeModal();
    }
}


//Crear un nuevo ejecutor
const newExecutor = () => {
    if(newDeviceName.value == '')
        message.value = 'Dale un nombre al ejecutor'
    else {
        addDevice({
            type: 'ejecutor',
            name: newDeviceName.value,
            space: selectedSpace.value.id,
            on: false, 
            user: user.getID(),
            date: '-'
        })
        closeModal()
    }
}


//Cerrar los modales
const closeModal = () => {
    newSpaceName.value = ''
    newDeviceName.value = ''
    selectedSpace.value = {}
    deviceSelected.value = ''
    newSensorUnit.value = 'unidad'
    spaces.value.map(el => el.selected = false)
    
    message.value = ''
    
    spaceModal.value = false
    sensorModal.value = false
    executorModal.value = false
    switchModal.value = false
}


//Editar el nombre de un dispositivo
const modifyDeviceSensor = (device) => {
  if (updatedDeviceName.value === '') {
    alert('Ponle un nombre a tu dispositivo');
  } else if (updateDeviceValue.value === '') {
    alert('Introduce una medida');
  } else {
    updateDevice(device.id, { 
      name: updatedDeviceName.value,
      value: updateDeviceValue.value
    });
    device.updating = false;
    updatedDeviceName.value = '';
    updateDeviceValue.value = '';
  }
}


const modifyDeviceEjecutor = (device) => {
  if (updatedDeviceName.value === '') {
    alert('Vuelve a ponerle un nombre a tu dispositivo o cambia a uno nuevo'); 
  } else {
    updateDevice(device.id, { 
      name: updatedDeviceName.value,
      on: device.data.on  
    });
    device.updating = false;
    updatedDeviceName.value = '';
    updateDeviceValue.value = '';
  }
}


//Editar el espacio de un dispositivo
const modifyDeviceSpace = () => {
    updateDevice(deviceSelected.value, { space: spaces.value.reduce((ac, el) => ac.selected ? ac : el ).id })
    closeModal()
}


//Abrir el modal de cambio de espacio
const openSpaceSwitch = (device) => {
    switchModal.value = true
    selectedSpace.value = device.data.space
    deviceSelected.value = device.id
}


//Seleccionar un espacio
const selectSpace = (space) => {
    spaces.value.map(el => el.selected = false)
    space.selected = true
}


//Borrar un dispositivo
const confirmDeleteDevice = (id) => {
    if(confirm('¿Está seguro que quiere borrar el dispositivo?'))
        deleteDevice(id)
}


//Borrar un espacio
const confirmDeleteSpace = (id) => {
    if(confirm('¿Está seguro que quiere borrar el espacio?'))
        deleteSpace(id)
}


//Obtener los espacios del usuario
const loadSpaces = () => {
    getSpaces(user.getID(), (spaceDocs) => {
        spaces.value = []
        spaceDocs.forEach(spaceDoc => {
            spaces.value.push({id: spaceDoc.id, name: spaceDoc.data().name, control : false, selected: false})
        })
    })
}


//Obtener los dispositivos del usuario
const loadDevices = () => {
  getDevices(user.getID(), (deviceDocs) => {
    devices.value = [];
    deviceDocs.forEach((deviceDoc) =>
      devices.value.push({
        id: deviceDoc.id,
        data: deviceDoc.data(),
        updating: false,
      })
    );
  });
};


//Cargar los espacios y dispositivos del usuario
onMounted(() => {
    loadSpaces()
    loadDevices()
})


//Cierre de sesión 
const logout = () => {  
    if(confirm('¿Desea cerrar la sesión?')){
        user.logout()
        router.push({ name: 'login' })
    }
}
</script>



<template>
    <div class="page">
        <div class="principal">

            <!--Cabecera de la aplicación -->
            <div class="header">
                <div class="title">
                <h1>Espacios de <span class="font-bold">{{ user.getUsername() }}</span></h1>
                </div>
                <div class="logout" @click="logout()" title="cerrar sesión" >
                  <h2>Cerrar sesión</h2>
                </div>
            </div>

            <!-- Espacios -->
            <div class="spaces">
                <div v-for="space in spaces" class="space">
                    <div class="space-header" :class="space.control ? 'rounded-t-2xl' : 'rounded-2xl'">
                        <div class="space-info">
                            <h1 class="space-name">{{ space.name }}</h1>
                        </div>

                        <!-- Control para desplegar el espacio -->

                        <div class="toggle" @click="space.control ? space.control = false : space.control = true">
                            <img src="@/assets/img/menu.png" class="w-8">
                        </div>
                    </div>
                    
                    
                    <!-- Desplegable para mostrar los dispositivos de cada espacio -->
                    <div v-if="space.control == true" class="devices">
                        <div v-for="device in devices.filter(el => el.data.space == space.id)">

                            <!-- Dispositivos -->
                            <div v-if="!device.updating" class="device">
                              <div class="device-info">
                                <h2 class="name" @click="{devices.map(el => el.updating = false); device.updating = true}">
                                  {{ device.data.name }}
                                </h2>
                              </div>

                              <div class="device-data">
                                <div v-if="device.data.type == 'sensor'">
                                  {{ device.data.value }} {{ device.data.unit }}
                                </div>

                                <div v-if="device.data.type == 'ejecutor'">
                                  <div class="estado">
                                    <!-- <input type="checkbox" v-model="device.data.on"> -->
                                    <h2 :class="{ 'activo': device.data.on, 'inactivo': !device.data.on }">
                                       {{ device.data.on ? 'Activo' : 'Inactivo' }}
                                    </h2> 
                                  </div>
                                </div>
                              </div>
                            </div>

                            <!-- Desplegable para editar un dispositivo -->
                            <!-- Deplegable para el ejecutor -->
                            <div v-else class="device justify-between">
                              <div v-if="device.data.type == 'ejecutor'">
                                <input type="text" :placeholder="device.data.name" v-model="updatedDeviceName" class="device-input">
                                <div class="estado">
                                  <label>Activar/Desactivar</label>
                                  <input type="checkbox" v-model="device.data.on">
                                </div>                      
                                <div class="flex">
                                  <div @click="modifyDeviceEjecutor(device)" class="settings">                                        
                                    <h1>Hecho</h1>
                                  </div>
                                  <div @click="openSpaceSwitch(device)" class="settings">
                                    <h1>Mover</h1>
                                  </div>
                                  <div @click="confirmDeleteDevice(device.id)" class="settings">
                                    <h1>Borrar</h1>
                                  </div>
                                  <div @click="{device.updating = false; updatedDeviceName = ''; updateDeviceValue = ''}" class="settings">
                                    <h1>Cancelar</h1>
                                  </div>
                                </div>
                              </div>


                              <!-- Desplegable para el sensor -->
                              <div v-if="device.data.type == 'sensor'">
                                <input type="text" :placeholder="device.data.name" v-model="updatedDeviceName" class="device-input">
                                <input type="number" :placeholder="device.data.value" v-model="updateDeviceValue" class="device-input">
                                <div class="flex">
                                  <div @click="modifyDeviceSensor(device)" class="settings">                                        
                                    <h1>Hecho</h1>
                                  </div>
                                  <div @click="openSpaceSwitch(device)" class="settings">
                                    <h1>Mover</h1>
                                  </div>
                                  <div @click="confirmDeleteDevice(device.id)" class="settings">
                                    <h1>Borrar</h1>
                                  </div>
                                  <div @click="{device.updating = false; updatedDeviceName = ''; updateDeviceValue = ''}" class="settings">
                                    <h1>Cancelar</h1>
                                  </div>
                                </div>
                              </div>
                             
                            </div>
                        </div>

                        <!-- Botones de borrar espacio y de añadir dispotivos -->
                        <div class="flex justify-between">
                            <button class="space-button-delete" @click="confirmDeleteSpace(space.id)">Borrar espacio</button>
                            <div class="flex gap-4">
                                <button class="space-button" @click="{sensorModal = true; selectedSpace = {id: space.id, name: space.name}}">+ Añadir sensor</button>
                                <button class="space-button" @click="{executorModal = true; selectedSpace = {id: space.id, name: space.name}}">+ Añadir ejecutor</button>
                            </div>
                        </div>
                    </div>
                </div>


                <!-- Botón para crear un nuevo espacio -->
                <button class="new-space" @click="spaceModal = true">Crear un Espacio</button>
            </div>
        </div>
    </div>


    <!-- Creación de un nuevo espacio -->
    <Teleport to="#spaceModal">
        <div class="modal-bg" v-if="spaceModal">
            <div class="modal">
                <form>
                    <label>Nuevo espacio</label>
                    <input placeholder="Nombre" type="text" v-model="newSpaceName">
                </form>
                <p class="message">{{ message }}</p>
                <div class="button-container">
                    <button @click="closeModal()" class="cancel">Cancelar</button>
                    <button @click="newSpace()" class="create">Añadir</button>
                </div>
            </div>
        </div>
    </Teleport>


    <!-- Creación de un nuevo sensor -->
    <Teleport to="#sensorModal">
        <div class="modal-bg" v-if="sensorModal">
            <div class="modal">
                <form>
                  <label>Creando nuevo sensor en "{{ selectedSpace.name }}"</label>
                  <input placeholder="nombre" v-model="newDeviceName" type="text">
                  <label>¿Qué va a medir este sensor?</label>
                  <select v-model="newSensorUnit" class="seleccion">
                    <option value="unidad" selected disabled>Seleccionar</option> 
                    <option value="Lx de luz">Luz</option>
                    <option value="º de temperatura">Temperatura</option>
                    <option value="% de humedad">Humedad</option>
                  </select>
                  <label>Valor de la medida:</label>  
                  <input type="number" v-model="newSensorValue" placeholder="Valor">
                </form>
                <p class="message">{{ message }}</p>
                <div class="button-container">
                    <button @click="closeModal()" class="cancel">Cancelar</button>
                    <button @click="newSensor()" class="create">Añadir</button>
                </div>
            </div>
        </div>
    </Teleport>

    <!-- Creación de un nuevo ejecutor del espacio -->
    <Teleport to="#executorModal">
        <div class="modal-bg" v-if="executorModal">
          <div class="modal">
            <form>
              <label>Creando nuevo ejecutor en "{{ selectedSpace.name }}"</label>
              <input placeholder="Nombre" v-model="newDeviceName" type="text">
            </form>
            <p class="message">{{ message }}</p>
            <div class="button-container">
              <button @click="closeModal()" class="cancel">Cancelar</button>
              <button @click="newExecutor()" class="create">Añadir</button>
            </div>
          </div>
        </div>
    </Teleport>


    <!-- Cambiar de espacio el dispositivo que queramos -->
    <Teleport to="#switchModal">
        <div class="modal-bg" v-if="switchModal">
            <div class="modal">
                <label>¿A qué espacio deseas mover este dispositivo?</label>
                <div class="space-switch">
                    <div v-for="space in spaces.filter(el => el.id != selectedSpace)" @click="selectSpace(space)" :class="space.selected ? 'space-selected' : 'space-not-selected'">
                        <h1>{{ space.name }}</h1>
                    </div>
                </div>
                <div class="button-container">
                    <button @click="closeModal()" class="cancel">Cancelar</button>
                    <button @click="modifyDeviceSpace()" class="create" v-if="spaces.filter(el => el.selected).length > 0">Confirmar</button>
                    <button v-else class="fake">Confirmar</button>
                </div>
            </div>
        </div>
    </Teleport> 
</template>



<style scoped>
/* Estilos */
.page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200vh; 
  background: linear-gradient(to right, #000074, #000000); 
}

.principal {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 1200px;
  margin: 50px 10px 650px; 
}


.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  flex-grow: 1;
}

.title h1 {
  font-size: 24px;
  color: #333; 
}

.title span {
  font-weight: bold;
}


.spaces {
  margin-top: 20px;
}

.space {
  margin-bottom: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.space-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #000d87; 
  color: #fff;
}

.space-info {
  flex-grow: 1;
}

.space-name,
.id {
  margin: 0;
}

.toggle {
  cursor: pointer;
}

.toggle img {
  width: 20px;
}

.devices {
  padding: 10px;
  background-color: #ffffff; 
  border: 1px solid #858585;
  border-radius: 6px;
}

.device {
  margin-bottom: 10px;
  border: 1px solid #858585;
  border-radius: 8px;
  padding: 10px;
}

.device-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.device-data {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.device-data label {
  margin: 0;
}

.device-button {
  cursor: pointer;
}

.device-button img {
  width: 20px;
}

.device-input {
  width: 80%;
  padding: 5px;
  margin-right: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}


.new-space {
  background-color: #2739ae; 
  color: #fff;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}



.new-space:hover {
  background-color: #0a8fc8; 
}

.modal-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.modal label {
  font-size: 18px;
  margin-bottom: 10px;
  color: #1a105e;
}

.modal input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  box-sizing: border-box;
  border: 1px solid #7e7e7e;
  border-radius: 4px;
}

.message {
  color: #e74c3c; 
  margin-top: 10px;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.cancel,
.create {
  background-color: #2739ae;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-right: 20px;
}

.cancel:hover, .create:hover {
  background-color: #0a8fc8;
}

.space-switch {
  display: flex;
  justify-content: space-around;
  margin-top: 20px;
  
}

.space-not-selected,
.space-selected {
  cursor: pointer;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #2739ae;
  color: #fff;
}

.space-selected {
  background-color: #002434; 
  color: #fff;
}

.space-not-selected:hover,
.space-selected:hover {
  background-color: #002434; 
}

.space-button {
  background-color: #3498db; 
  color: #fff;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-right: 10px;
}

.space-button:hover {
  background-color: #2980b9; 
}

.space-button-delete {
  background-color: #940000; 
  color: #fff;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  margin-right: 10px;
}

.space-button-delete:hover {
  background-color: #ff3333; 
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  font-size: 16px;
}

input {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  box-sizing: border-box;
  border: 1px solid #6e6e6e;
  border-radius: 4px;
}

.logout {
  cursor: pointer;
  background-color: #940000;
  padding: 10px 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center; 
  text-align: center;
}

.logout:hover {
  background-color: #ff3333;
}

.logout h2 {
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 0; 
  font-size: 18px;
}

.settings {
  margin-top: 10px;
  color: #ffffff;
  border-radius: 20px;
  background-color: #360559;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center; 
  text-align: center;
  padding: 7px 14px;
  margin-right: 10px;
}

.settings:hover {
  background-color: #7b25b8;
}

.device input{
  border: 1px solid #b0b0b0;
  border-radius: 4px;
}

.seleccion{
  border: 1px solid #858585;
  border-radius: 5px;
  padding: 8px;
}

.name {
  color: blue;
  font-style: italic;
  transition: transform 0.3s ease; /* Agrega una transición para suavizar el efecto al cambiar de tamaño */
}

.name:hover {
  cursor: pointer;
  transform: scale(1.1); /* Ajusta el valor según tu preferencia para el tamaño al pasar el ratón */
}

.activo {
  color: green;
  font-weight: bold;
}

.inactivo {
  color: red;
  font-weight: bold;
}

.estado {
  display: block;
  padding: 20px 10px;
  background-color: #ffffff;
  text-align: center;
}

.estado label{
  font-weight: bold;
}


</style>
