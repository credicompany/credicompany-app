const firebaseConfig = {
 apiKey: "AIzaSyB5G2MyTkYZT0b7RMfLoBegcfAY4-ewdkc",
 authDomain: "credicompany-88693.firebaseapp.com",
 databaseURL: "https://credicompany-88693-default-rtdb.firebaseio.com",
 projectId: "credicompany-88693",
 storageBucket: "credicompany-88693.firebasestorage.app",
 messagingSenderId: "890359636696",
 appId: "1:890359636696:web:1e9f4ca349606817212dad"
};

firebase.initializeApp(firebaseConfig);

// ========================================
// FIREBASE
// Credicompany V2
// ========================================

console.log("🔥 firebase.js cargado");

// Base de datos global
window.db = firebase.database();

// Funciones reutilizables

function guardarFirebase(ruta, datos){

    return db.ref(ruta).set(datos);

}

function leerFirebase(ruta){

    return db.ref(ruta);

}

function pushFirebase(ruta, datos){

    return db.ref(ruta).push(datos);

}


// =====================================
// ACTUALIZAR LOCALSTORAGE
// =====================================

function actualizarLocalStorage(cartera){

    localStorage.setItem(
        "cartera",
        JSON.stringify(cartera)
    );

}

// =====================================
// ACTUALIZAR INTERFAZ
// =====================================

function actualizarInterfaz(){

    setTimeout(()=>{

        if(typeof actualizarResumen === "function"){
            actualizarResumen();
        }

        if(typeof filtrarMora === "function"){
            filtrarMora(0,1000);
        }

    },500);

}
// =====================================
// SINCRONIZAR CARTERA
// =====================================

function sincronizarCartera(){

    db.ref("cartera").on("value",(snapshot)=>{

        let datos = snapshot.val();

        if(!datos) return;

        let cartera = Object.values(datos);

actualizarLocalStorage(cartera);

console.log("✅ Cartera sincronizada Firebase");

actualizarInterfaz();

    });

}
