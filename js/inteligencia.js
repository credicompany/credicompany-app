// =========================================
// CENTRO DE INTELIGENCIA
// =========================================

function cargarCentroInteligencia(){

    firebase.database()
    .ref("resultadoMensual/actual")
    .once("value")
    .then((snapshot)=>{

        if(!snapshot.exists()) return;

        let datos = snapshot.val();

        document.getElementById("intelIngreso").innerHTML =
        "S/ " +
        Number(datos.ingresos || 0)
        .toLocaleString("es-PE",{
            minimumFractionDigits:2
        });

    });

}
