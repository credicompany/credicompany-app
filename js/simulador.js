function obtenerTarifario(producto,monto,tipo){

let config = null;

// =========================
// DIARIO
// =========================

if(producto === "diario"){

if(tipo === "nuevo"){

if(monto >= 300 && monto <= 600){
config = {tem:35, plazo:25};
}

if(monto >= 601 && monto <= 2000){
config = {tem:33, plazo:45};
}

}

if(tipo === "recurrente"){

if(monto >= 300 && monto <= 600){
config = {tem:34, plazo:25};
}

if(monto >= 601 && monto <= 2000){
config = {tem:32, plazo:45};
}

if(monto >= 2001 && monto <= 3000){
config = {tem:30, plazo:60};
}

}

if(tipo === "a1"){

if(monto >= 300 && monto <= 600){
config = {tem:32, plazo:10};
}

if(monto >= 601 && monto <= 3000){
config = {tem:30, plazo:12};
}

if(monto >= 3001 && monto <= 5000){
config = {tem:28, plazo:16};
}

if(monto >= 5001 && monto <= 10000){
config = {tem:26, plazo:20};
}

}

if(tipo === "gerencia"){

if(monto >= 1001 && monto <= 5000){
config = {tem:28, plazo:5};
}

if(monto >= 5001 && monto <= 10000){
config = {tem:23, plazo:6};
}

if(monto >= 10100 && monto <= 15000){
config = {tem:20, plazo:8};
}

}

}

// =========================
// SEMANAL
// =========================

if(producto === "semanal"){

if(tipo === "nuevo"){

if(monto >= 500 && monto <= 1500){
config = {tem:21, plazo:8};
}

if(monto >= 1501 && monto <= 3000){
config = {tem:21, plazo:10};
}

}

if(tipo === "recurrente"){

if(monto >= 500 && monto <= 1000){
config = {tem:14, plazo:4};
}

if(monto >= 1001 && monto <= 3000){
config = {tem:18, plazo:10};
}

if(monto >= 3001 && monto <= 5000){
config = {tem:17, plazo:12};
}

}

if(tipo === "a1"){

if(monto >= 500 && monto <= 1000){
config = {tem:17, plazo:10};
}

if(monto >= 1001 && monto <= 5000){
config = {tem:16, plazo:12};
}

if(monto >= 5001 && monto <= 10000){
config = {tem:15, plazo:16};
}

if(monto >= 10001 && monto <= 15000){
config = {tem:14, plazo:20};
}

}

if(tipo === "gerencia"){

if(monto >= 1001 && monto <= 5000){
config = {tem:11, plazo:5};
}

if(monto >= 5001 && monto <= 10000){
config = {tem:10, plazo:6};
}

if(monto >= 10100 && monto <= 15000){
config = {tem:9, plazo:8};
}

}

}

// =========================
// QUINCENAL
// =========================

if(producto === "quincenal"){

if(tipo === "nuevo"){

if(monto >= 500 && monto <= 1000){
config = {tem:15, plazo:3};
}

if(monto >= 1001 && monto <= 2000){
config = {tem:15, plazo:4};
}

}

if(tipo === "recurrente"){

if(monto >= 500 && monto <= 1000){
config = {tem:14, plazo:4};
}

if(monto >= 1001 && monto <= 3000){
config = {tem:13, plazo:6};
}

if(monto >= 3001 && monto <= 5000){
config = {tem:12, plazo:8};
}

}

if(tipo === "a1"){

if(monto >= 500 && monto <= 1000){
config = {tem:13, plazo:5};
}

if(monto >= 1001 && monto <= 5000){
config = {tem:12, plazo:6};
}

if(monto >= 5001 && monto <= 10000){
config = {tem:11, plazo:7};
}

if(monto >= 10001 && monto <= 15000){
config = {tem:10, plazo:8};
}

}

if(tipo === "gerencia"){

if(monto >= 1001 && monto <= 5000){
config = {tem:11, plazo:5};
}

if(monto >= 5001 && monto <= 10000){
config = {tem:10, plazo:6};
}

if(monto >= 10100 && monto <= 15000){
config = {tem:9, plazo:8};
}

}

}

// =========================
// MENSUAL
// =========================

if(producto === "mensual"){

if(tipo === "nuevo"){

if(monto >= 500 && monto <= 1000){
config = {tem:12, plazo:3};
}

if(monto >= 1001 && monto <= 2000){
config = {tem:12, plazo:4};
}

}

if(tipo === "recurrente"){

if(monto >= 500 && monto <= 1000){
config = {tem:11, plazo:4};
}

if(monto >= 1001 && monto <= 3000){
config = {tem:11, plazo:5};
}

if(monto >= 3001 && monto <= 5000){
config = {tem:11, plazo:6};
}

}

if(tipo === "a1"){

if(monto >= 500 && monto <= 1000){
config = {tem:11, plazo:5};
}

if(monto >= 1001 && monto <= 5000){
config = {tem:10, plazo:6};
}

if(monto >= 5001 && monto <= 10000){
config = {tem:9, plazo:7};
}

if(monto >= 10001 && monto <= 15000){
config = {tem:8, plazo:8};
}

}

if(tipo === "gerencia"){

if(monto >= 1001 && monto <= 5000){
config = {tem:9, plazo:5};
}

if(monto >= 5001 && monto <= 10000){
config = {tem:8, plazo:6};
}

if(monto >= 10100 && monto <= 15000){
config = {tem:7, plazo:8};
}

}

}

return config;
}  
// SIMULADOR
function calcular(){
if(!tipoCliente.value){

alert("Seleccione tipo cliente");
return;

}

if(!producto.value){

alert("Seleccione producto");
return;

}  
let P = parseFloat(monto.value);

let tipo = document.getElementById("tipoCliente").value;

let tarifa = obtenerTarifario(producto.value, P, tipo);
if(!tarifa){
alert("❌ Monto fuera de tarifario");
return;
}  
let tasaIngresada = parseFloat(
document.getElementById("tasa").value
);

if(
tasaIngresada &&
tasaIngresada < tarifa.tem
){

alert(
"❌ La TEM no puede ser menor al tarifario"
);

document.getElementById("tasa").value = tarifa.tem;

return;

}  

if(!document.getElementById("tasa").value){

document.getElementById("tasa").value = tarifa.tem;


document.getElementById("plazo").value = tarifa.plazo;

}

let t = parseFloat(
document.getElementById("tasa").value
) / 100;

let n = parseInt(
document.getElementById("plazo").value
);

if(!P || !t || !n){
alert("Completa datos");
return;
}

// 🔥 definir tipo
let i = 0;
let dias = 0;

if(producto.value==="diario"){ 

// 🔥 conversión financiera real
i = Math.pow(1 + t, 1/30) - 1;

dias = 1;

}

if(producto.value==="semanal"){

// 🔥 fórmula real usada por sistema financiero
i = t / 4.3;

dias = 7;

}

if(producto.value==="quincenal"){

// 🔥 tasa efectiva quincenal real
i = Math.pow(1 + t, 15/30) - 1;

dias = 15;

}
if(producto.value==="mensual"){ i=t; dias=30; }

// 🔥 fórmula financiera
// 🔥 comisión
let comision = 0;

if(P >= 300 && P <= 2000){
    comision = 5;
}
else if(P >= 2001 && P <= 5000){
    comision = 10;
}
else if(P >= 5001){
    comision = 15;
}

// 🔥 capital financiado
let capitalFinanciado = P + comision;

// 🔥 total entregado
let totalEntrega = P;

// 🔥 fórmula financiera
let cuota = (
capitalFinanciado * i
) / (
1 - Math.pow(1+i,-n)
);

let total = cuota * n;

let interes = total - capitalFinanciado;  
// 🔥 resumen completo
resultado.innerHTML = `

<b>💰 Monto solicitado:</b>
S/ ${P.toFixed(2)}<br>

<b>💸 Comisión:</b>
S/ ${comision.toFixed(2)}<br>

<b>🏦 Capital financiado:</b>
S/ ${capitalFinanciado.toFixed(2)}<br>

<b>✅ Total entregado:</b>
S/ ${totalEntrega.toFixed(2)}<br>

<b>💳 Cuota:</b>
S/ ${cuota.toFixed(2)}<br>

<b>📈 Total a pagar:</b>
S/ ${total.toFixed(2)}<br>

<b>🏛️ Interés:</b>
S/ ${interes.toFixed(2)}

`;

// 🔥 cronograma REAL
let saldo = capitalFinanciado;
let fecha = new Date();
let html = "<h4>Cronograma:</h4>";

for(let c=1;c<=n;c++){

// 🔥 ahora sí correcto
let interesCuota = saldo * i;
let capital = cuota - interesCuota;

saldo -= capital;

fecha.setDate(fecha.getDate()+dias);

html += `
<div class="item">
Cuota ${c}<br>
Fecha: ${fecha.toLocaleDateString()}<br>
Cuota: S/ ${cuota.toFixed(2)}<br>
Saldo: S/ ${saldo.toFixed(2)}
</div>`;
}

cronograma.innerHTML = html;

// guardar para WhatsApp
window.simData = {
monto:P,
cuota:cuota.toFixed(2),
total:total.toFixed(2),
producto:producto.value
};

}

// LIMPIAR
function limpiar(){
document.querySelectorAll("input").forEach(i=>i.value="");
resultado.innerHTML="";
cronograma.innerHTML="";
}
