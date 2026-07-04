// =====================================
// DASHBOARD CREDICOMPANY
// =====================================

console.log("✅ dashboard.js cargado");
<div id="dashboard" style="display:none">
<div class="grid">
<div class="box" onclick="mostrar('simulador')">
<div style="font-size:28px;">💰</div>
<div>Simulación y Promocion</div>
</div>
<div class="box" onclick="mostrar('clientes')">
<div style="font-size:28px;">👥</div>
<div>Cobranza</div>
</div>
<div class="box" onclick="mostrar('pagos')">
<div style="font-size:28px;">💳</div>
<div>Medios pagos</div>
</div>
<div id="boxAdmin"
class="box"
style="display:none"
onclick="mostrar('admin')">

<div style="font-size:28px;">⚙️</div>
<div>Usuarios</div>

</div>
 <div class="box" onclick="verHistorialGestiones()">
    <div style="font-size:28px;">📝</div>
    <div>Gestiones</div>
</div>
  <div class="box" onclick="mostrar('kpi')">
    <div style="font-size:28px;">📊</div>
    <div>KPI Gerencial</div>
</div>
<div
id="boxKpiFinanciero"
class="box"
style="display:none"
onclick="mostrar('kpiFinanciero')">

<div style="font-size:28px;">🏦</div>

<div>KPI Financiero</div>
</div>
  <div
id="boxResultadoMensual"
class="box"
style="display:none"
onclick="mostrar('resultadoMensual')">

<div style="font-size:28px;">💼</div>

<div>Resultado Mensual</div>

</div>
  <div
id="boxInteligencia"
class="box"
style="display:none"
onclick="mostrar('inteligencia')">

<div style="font-size:28px;">🧠</div>

<div>Inteligencia Gerencial</div>

</div>
</div>
</div>
