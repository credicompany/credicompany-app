// =====================================
// OCULTAR TODAS LAS PANTALLAS
// =====================================

function ocultarPantallas(){

[
"simulador",
"clientes",
"pagos",
"admin",
"kpi",
"kpiFinanciero",
"resultadoMensual",
"historialDiv",
"historialGestionesDiv",
"historialClienteDiv"
].forEach(id=>{

const el = document.getElementById(id);

if(el) el.style.display = "none";

});
  
}
  
// =====================================
// PREPARAR INTERFAZ
// =====================================

function prepararInterfaz(){

    dashboard.style.display = "none";

    document.querySelector(".headerNuevo").style.display = "none";

    document.getElementById("rankingContainer").style.display = "none";

    document.querySelector(".resumen").style.display = "none";

    app.style.display = "block";

}


// =====================================
// MOSTRAR INICIO
// =====================================

function mostrarInicio(){

    dashboard.style.display = "block";

    document.querySelector(".headerNuevo").style.display = "block";

    document.querySelector(".resumen").style.display = "none";

    document.getElementById("rankingContainer").style.display = "flex";

}

// =====================================
// CONFIGURAR PANEL KPI
// =====================================

function configurarPanelKPI(){

    if(
        asesor !== "admin" &&
        asesor !== "operaciones"
    ){

        document.getElementById("panelCargaKPI").style.display = "none";

    }else{

        document.getElementById("panelCargaKPI").style.display = "block";

    }

}
function mostrar(p){

    // =====================================
    // RESTRICCIONES POR PERFIL
    // =====================================

    // USUARIOS → SOLO ADMIN
    if(
        p === "admin" &&
        asesor !== "admin"
    ){
        alert("Acceso restringido");
        return;
    }

    // KPI FINANCIERO → SOLO ADMIN
    if(
        p === "kpiFinanciero" &&
        asesor !== "admin"
    ){
        alert("Acceso restringido");
        return;
    }

    // RESULTADO MENSUAL → SOLO ADMIN
    if(
        p === "resultadoMensual" &&
        asesor !== "admin"
    ){
        alert("Acceso restringido");
        return;
    }

    prepararInterfaz();
    ocultarPantallas();

    document.getElementById(p).style.display="block";

    if(p==="kpi"){
        configurarPanelKPI();
    }

    if(p==="clientes"){

        document.getElementById("rankingContainer").style.display="none";

        setTimeout(function(){

            actualizarResumen();
            filtrarMora(0,1000);

        },50);

    }

    if(p==="kpiFinanciero"){
        mostrarResumenFinanciero();
    }

    if(p==="admin"){
        renderUsuarios();
    }

}

function volver(){

app.style.display="none";

ocultarPantallas();

document.querySelector(".resumen").style.display = "none";

document.getElementById("historialDiv").style.display="none";

mostrarInicio();
if(asesor === "slopez"){
document.getElementById("panelAsesores").style.display="grid";
}

}
// QR
async function abrirQR(el){

    const imagen = el.querySelector("img");

    imgQR.src = imagen.src;

    modalQR.style.display = "flex";

    // Guardar imagen seleccionada
    window.imagenPagoSeleccionada = imagen.src;

}

async function compartirMedioPagoWhatsApp(){

    const urlImagen = window.imagenPagoSeleccionada;

    if(!urlImagen){
        alert("No se ha seleccionado una imagen.");
        return;
    }

    try{

        const respuesta = await fetch(urlImagen);
        const blob = await respuesta.blob();

        const archivo = new File(
            [blob],
            "Cuenta-Credicompany.jpg",
            {
                type: blob.type || "image/jpeg"
            }
        );

        const mensaje =
`💳 *MEDIOS DE PAGO CREDICOMPANY*

Estimado(a) cliente, puede realizar su pago mediante nuestras cuentas.

🏦 *CREDICOMPANY*
_Crecemos Juntos_`;

        if(
            navigator.share &&
            navigator.canShare &&
            navigator.canShare({
                files:[archivo]
            })
        ){

            await navigator.share({
                files:[archivo],
                text:mensaje
            });

        }else{

            alert(
                "Su dispositivo no permite compartir la imagen directamente."
            );

        }

    }catch(error){

        console.error(
            "Error compartiendo medio de pago:",
            error
        );

        alert("❌ No se pudo compartir la imagen.");

    }

}
function cerrarQR(){modalQR.style.display="none";}
function abrirTarifario(){

document.getElementById("modalTarifario").style.display = "block";

}

function cerrarTarifario(){

document.getElementById("modalTarifario").style.display = "none";

}
