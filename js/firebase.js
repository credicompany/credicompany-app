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
// SINCRONIZAR CARTERA
// =====================================

function sincronizarCartera(){

    db.ref("cartera").on("value",(snapshot)=>{

        let datos = snapshot.val();

        if(!datos) return;

        let cartera = Object.values(datos);

        localStorage.setItem(
            "cartera",
            JSON.stringify(cartera)
        );

       console.log("✅ Cartera sincronizada Firebase");

setTimeout(()=>{

    if(typeof actualizarResumen==="function"){
        actualizarResumen();
    }

    if(typeof filtrarMora==="function"){
        filtrarMora(0,1000);
    }

},500);

    });

}
