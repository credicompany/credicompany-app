// ====================================
// RESULTADO MENSUAL CREDICOMPANY
// ====================================

function cargarResultadoMensual(){

document.getElementById("resumenResultadoMensual").innerHTML = `

<div style="
display:grid;
grid-template-columns:repeat(2,1fr);
gap:12px;
">

<div style="
background:#16a34a;
color:white;
padding:18px;
border-radius:15px;
text-align:center;
">

<h3>💰 Ingresos</h3>

<h2 id="rmIngresos">
S/ 0
</h2>

</div>

<div style="
background:#dc2626;
color:white;
padding:18px;
border-radius:15px;
text-align:center;
">

<h3>💸 Egresos</h3>

<h2 id="rmEgresos">
S/ 0
</h2>

</div>

<div style="
background:#2563eb;
color:white;
padding:18px;
border-radius:15px;
text-align:center;
">

<h3>📈 Utilidad Operativa</h3>

<h2 id="rmOperativa">
S/ 0
</h2>

</div>

<div style="
background:#7c3aed;
color:white;
padding:18px;
border-radius:15px;
text-align:center;
">

<h3>🏆 Utilidad Neta</h3>

<h2 id="rmNeta">
S/ 0
</h2>

</div>

</div>

<br>

<div style="
background:white;
padding:20px;
border-radius:15px;
box-shadow:0 2px 8px rgba(0,0,0,.08);
">

<h3>Detalle de Ingresos</h3>

<table style="width:100%;">

<tr>

<td>Interés Devengado</td>

<td align="right">
<b id="rmInteres">
S/0
</b>
</td>

</tr>

<tr>

<td>Mora Real</td>

<td align="right">
<b id="rmMora">
S/0
</b>
</td>

</tr>

<tr>

<td>Costo por Desembolso</td>

<td align="right">
<b id="rmCosto">
S/0
</b>
</td>

</tr>

</table>

</div>

`;
}
