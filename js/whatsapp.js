// WHATSAPP
function enviarSimulacion(){

if(!window.simData){
alert("Primero realiza la simulación");
return;
}

let msg = `📊 SIMULACIÓN CREDICOMPANY

💼 Producto: ${simData.producto.toUpperCase()}
💰 Monto aprobado: S/ ${simData.monto}
💳 Cuota ${simData.producto === "diario" ? "diaria" : simData.producto === "semanal" ? "semanal" : simData.producto === "quincenal" ? "quincenal" : "mensual"}: S/ ${simData.cuota}

✅ SIN TRÁMITES COMPLICADOS
✅ DESEMBOLSO ÍNTEGRO Y RÁPIDO
✅ *SIN RETENCIÓN DEL 10%*

¿Deseas que activemos tu crédito hoy mismo? 🚀

Gracias por confiar en Credicompany 🤝`;

window.open("https://wa.me/?text=" + encodeURIComponent(msg));

}
// 📩 COBRANZA WHATSAPP
function enviarRecordatorios(min,max){

let data = JSON.parse(localStorage.getItem("cartera")) || [];

let filtrados = data.filter(c=>{

if(c.pagado_hoy) return false;

let r = parseFloat(c.retraso) || 0;

return r >= min && r <= max;

});

if(filtrados.length === 0){

alert("✅ No hay clientes pendientes");

return;

}

let index = 0;

function abrirWhatsApp(){

if(index >= filtrados.length){

alert("✅ Recordatorios completados");

return;

}

let c = filtrados[index];

enviarCobranzaDesdeLista(
encodeURIComponent(c.nombre),
c.celular,
c.retraso,
c.monto
);

index++;

setTimeout(abrirWhatsApp,2500);

}

abrirWhatsApp();

}
function enviarCobranzaDesdeLista(nombre, celular, dias, monto){

nombre = decodeURIComponent(nombre);
celular = (celular || "").replace(/\D/g,""); // limpia espacios

dias = parseFloat(dias) || 0;

let msg = "";
let firma = "";

// ADMIN
if(asesor === "admin"){

firma = `
*Atte.*
*Área de Cobranzas*
🏦 *Credicompany*
_Crecemos juntos_
*2026*`;

}

// EDGAR
else if(asesor === "ebenites"){

firma = `
*Atte.*
EDGAR BENITES
🏦 *Credicompany*
_Crecemos juntos_
*2026*`;

}

// SEGUNDO
else if(asesor === "slopez"){

firma = `
*Atte.*
SEGUNDO LOPEZ
🏦 *Credicompany*
_Crecemos juntos_
*2026*`;

}
// ALESSANDRA
else if(asesor === "tleon"){

firma = `
*Atte.*
ALESSANDRA LEON
🏦 *Credicompany*
_Crecemos juntos_
*2026*`;

}

// 🟢 VENCE HOY
if(dias === 0){
msg = `📌 *RECORDATORIO - CREDICOMPANY*
Estimado(a)
*${nombre}*,
💼 Hoy corresponde el pago de su cuota.
💰 *Monto a pagar:*
S/ ${monto}

⏰ *Evite intereses moratorios realizando su pago antes de las 6:00 p.m.*
Pasada esa hora, se aplicará el interés moratorio correspondiente.
Agradecemos su puntualidad. Quedamos atentos a su confirmación.

${firma}`;

}
// 🟡 1–8 días
else if(dias <= 8){

msg = `🟡 *AVISO DE COBRANZA*
🏦 *CREDICOMPANY*

━━━━━━━━━━━━━━

Estimado(a):
*${nombre}*

📌 Su crédito registra:
*${dias} días de atraso*

💰 *Deuda pendiente:*
S/ ${monto}

Le solicitamos regularizar su pago a la brevedad para evitar mayores cargos e inconvenientes en su evaluación crediticia.

Agradecemos su pronta atención y quedamos atentos a su confirmación.

${firma}`;

}
// 🟠 9–30 días
else if(dias <= 30){

msg = `🟠 *SEGUIMIENTO DE COBRANZA*
🏦 *CREDICOMPANY*

━━━━━━━━━━━━━━

Estimado(a):
*${nombre}*

📌 Su crédito registra:
*${dias} días de atraso*

💰 *Deuda pendiente:*
S/ ${monto}

Es importante regularizar su pago lo antes posible para evitar restricciones y mayores cargos administrativos.

Agradecemos su pronta atención y quedamos atentos a su confirmación.

${firma}`;

}

// 🔴 +30 días
else{

msg = `🔴 *URGENTE — COBRANZA PRIORITARIA*
🏦 *CREDICOMPANY*

━━━━━━━━━━━━━━

Estimado(a):
*${nombre}*

📌 Su crédito registra:
*${dias} días de atraso*

💰 *Deuda pendiente:*
S/ ${monto}

Solicitamos regularizar su pago de manera inmediata para evitar acciones adicionales y afectaciones en su evaluación crediticia.

Le pedimos comunicarse a la brevedad con nuestra área de cobranzas.

${firma}`;

}

window.open(
`https://wa.me/51${celular}?text=${encodeURIComponent(msg)}`
);

}
function enviarCobranzaAval(
nombreAval,
telefonoAval,
cliente,
dias,
monto
){

nombreAval =
decodeURIComponent(nombreAval);

cliente =
decodeURIComponent(cliente);

telefonoAval =
(telefonoAval || "")
.replace(/\D/g,"");

let mensaje =
`👥 *COMUNICADO AL AVAL*

Estimado(a):
*${nombreAval}*

Usted figura como aval del cliente:

👤 *${cliente}*

⏰ Días de atraso: ${dias}

💰 Deuda pendiente:
S/ ${monto}

Solicitamos su apoyo para comunicarse con el titular y regularizar la obligación pendiente.

🏦 *CREDICOMPANY*
*Área de Cobranzas*
_Crecemos Juntos_`;

window.open(
`https://wa.me/51${telefonoAval}?text=${encodeURIComponent(mensaje)}`
);

}
function enviarFiltro(){

  let nombre = cliente.value || "";
  let apellidosVal = apellidos.value || "";
  let dniVal = dni.value || "";

  let msg = "🔎 FILTRO DE CLIENTE - CREDICOMPANY\n\n";

  if(nombre) msg += `👤 Nombre: ${nombre}\n`;
  if(apellidosVal) msg += `👥 Apellidos: ${apellidosVal}\n`;
  if(dniVal) msg += `🆔 DNI: ${dniVal}\n`;

  msg += `\n👨‍💼 Asesor: ${asesor}\n`;
  msg += "\nApoyo filtro de cliente gracias.";

  window.open("https://wa.me/?text=" + encodeURIComponent(msg));
}
