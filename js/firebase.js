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
