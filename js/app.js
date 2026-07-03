console.log("✅ app.js cargado correctamente");
// QR
function abrirQR(el){
imgQR.src=el.querySelector("img").src;
modalQR.style.display="flex";
}
function cerrarQR(){modalQR.style.display="none";}
function abrirTarifario(){

document.getElementById("modalTarifario").style.display = "block";

}

function cerrarTarifario(){

document.getElementById("modalTarifario").style.display = "none";

}
