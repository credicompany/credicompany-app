// ======================================
// RESUMEN GENERAL
// ======================================
function actualizarResumen(){

    let data =
        JSON.parse(localStorage.getItem("cartera")) || [];

    let total = 0;
    let mora = 0;
    let saldoCapitalVencido = 0;
    let hoy = 0;
    let vencenHoy = 0;
    let criticos = 0;
    let moraVencida30 = 0;
    let moraRecuperada = 0;
    let miMora = 0;
    let misMorosos = 0;

    let ranking = {};
    let operaciones = {};
    let temPromedio = {};
    let clientes = {};
    let control = {};
    let bonos = {};

    let hoyFecha =
        new Date().toLocaleDateString();

    // ======================================
    // CONTADORES DE CLIENTES
    // ======================================

    let hoyCount = 0;
    let moraCount = 0;
    let criticoCount = 0;

    // ======================================
    // REPAGO DIARIO POR TRAMO
    // ======================================

    let repagoHoy = 0;
    let repagoMora = 0;
    let repagoCritico = 0;


    // ======================================
    // RECORRER CARTERA
    // ======================================

    data.forEach(c => {

        let retraso =
            parseFloat(c.retraso) || 0;

        let monto =
            parseFloat(c.monto) || 0;


        // ======================================
        // TOTAL CARTERA
        // ======================================

        total += monto;


        // ======================================
        // CUOTA MORA
        // ======================================
        // IMPORTANTE:
        // En la carga del Excel, CUOTA_MORA
        // se guarda en c.monto.
        //
        // Por eso NO usamos c.cuota_mora.
        // ======================================

        let cuotaMora = monto;


        // ======================================
        // TRAMOS + REPAGO DIARIO
        // ======================================

        // 🟢 0 DÍAS
        if(
            retraso === 0 &&
            !c.pagado_hoy
        ){

            hoyCount++;

            repagoHoy += cuotaMora;

        }


        // 🟡 1 - 8 DÍAS
        if(
            retraso >= 1 &&
            retraso <= 8 &&
            !c.pagado_hoy
        ){

            moraCount++;

            repagoMora += cuotaMora;

        }


        // 🔴 9+ DÍAS
        if(
            retraso >= 9 &&
            !c.pagado_hoy
        ){

            criticoCount++;

            repagoCritico += cuotaMora;

        }


        // ======================================
        // PAGOS
        // ======================================

        let pagado =
            parseFloat(c.pagado_monto) || 0;

        let cuota =
            parseFloat(c.monto) || 0;


        // ======================================
        // MORA RECUPERADA
        // ======================================

        if(
            retraso > 0 &&
            pagado > 0
        ){

            moraRecuperada += pagado;

        }


        // ======================================
        // RANKING POR ASESOR
        // ======================================

        let asesorNombre =
            c.asesor || "Sin asesor";


        if(!ranking[asesorNombre]){

            ranking[asesorNombre] = 0;

        }

        ranking[asesorNombre] += pagado;


        // ======================================
        // CONTROL GERENCIAL
        // ======================================

        if(!control[asesorNombre]){

            control[asesorNombre] = {

                total: 0,
                pagados: 0

            };

        }


        // ======================================
        // META DEL DÍA
        // ======================================

        if(
            retraso === 0 ||
            c.eraHoy
        ){

            control[asesorNombre].total++;

        }


        // ======================================
        // PAGOS REALIZADOS
        // ======================================

        if(c.pagado_hoy){

            control[asesorNombre].pagados++;

        }


        // ======================================
        // MORA
        // ======================================

        if(retraso >= 1){

            mora++;

            saldoCapitalVencido +=
                parseFloat(c.saldoCapital) || 0;


            let asesorCliente =
                (c.asesor || "")
                .toLowerCase()
                .trim();


            let asesorActual =
                (asesor || "")
                .toLowerCase()
                .trim();


            if(
                asesorActual &&
                asesorCliente === asesorActual
            ){

                miMora +=
                    parseFloat(c.saldoCapital) || 0;

                misMorosos++;

            }

        }


        // ======================================
        // MORA MAYOR A 30 DÍAS
        // ======================================

        if(retraso > 30){

            criticos++;

            moraVencida30 +=
                parseFloat(c.saldoCapital) || 0;

        }


        // ======================================
        // CLIENTES AL DÍA
        // ======================================

        let saldo =
            parseFloat(
                c.saldo || c.monto
            ) || 0;


        if(
            retraso === 0 &&
            !c.pagado_hoy
        ){

            hoy += saldo;

            vencenHoy++;

        }

    });


    // ======================================
    // TOTAL CLIENTES
    // ======================================

    let totalClientes =
        data.filter(
            c => !c.pagado_hoy
        ).length;


    // ======================================
    // MORA TOTAL
    // ======================================

    let porcentajeMora =
        saldoCapitalVencido.toFixed(2);


    // ======================================
    // ACTUALIZAR INDICADORES
    // ======================================

    document.getElementById(
        "totalCartera"
    ).innerText =
        "S/ " +
        total.toLocaleString(
            "es-PE",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );


    document.getElementById(
        "porcentajeMora"
    ).innerText =
        "S/ " +
        porcentajeMora;


    document.getElementById(
        "cobradoHoy"
    ).innerText =
        "S/ " +
        hoy.toLocaleString(
            "es-PE",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );


    document.getElementById(
        "vencenHoy"
    ).innerText =
        vencenHoy;


    document.getElementById(
        "criticos"
    ).innerText =
        criticos;


    document.getElementById(
        "totalClientes"
    ).innerText =
        totalClientes;


    // ======================================
    // MORA RECUPERADA
    // ======================================

    document.getElementById(
        "moraRecuperada"
    ).innerText =
        "S/ " +
        moraRecuperada.toLocaleString(
            "es-PE",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );


    // ======================================
    // MI MORA
    // ======================================

    document.getElementById(
        "miMora"
    ).innerText =
        "S/ " +
        miMora.toLocaleString(
            "es-PE",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );


    document.getElementById(
        "misMorosos"
    ).innerText =
        misMorosos;


    // ======================================
    // MORA VENCIDA > 30
    // ======================================

    let divMora =
        document.getElementById(
            "moraVencidaTotal"
        );


    if(divMora){

        divMora.innerText =
            "S/ " +
            moraVencida30.toLocaleString(
                "es-PE",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );

    }


    // ======================================
    // BONOS
    // ======================================

    Object.keys(control).forEach(a => {

        let t =
            control[a].total;

        let p =
            control[a].pagados;


        // BONO SOLO SI CUMPLE
        // META COMPLETA

        if(
            t > 0 &&
            p === t
        ){

            bonos[a] = 15;

        }else{

            bonos[a] = 0;

        }

    });


    // ======================================
    // BONOS ACUMULADOS
    // ======================================

    let bonosHoy =
        JSON.parse(
            localStorage.getItem(
                "bonosHoy"
            )
        ) || {};


    Object.keys(bonos).forEach(a => {

        if(!bonosHoy[a]){

            bonosHoy[a] = 0;

        }


        if(bonos[a] > 0){

            bonosHoy[a] =
                bonos[a];

        }

    });


    localStorage.setItem(
        "bonosHoy",
        JSON.stringify(bonosHoy)
    );


    // ======================================
    // RANKING ASESORES
    // ======================================

    console.log(ranking);


    let rankingHTML = "";


    Object.entries(ranking)

    .filter(
        ([asesor]) =>
            asesor !== "admin"
    )

    .sort(
        (a,b) =>
            b[1] - a[1]
    )

    .forEach((item,index) => {

        let medalla = "🥉";


        if(index === 0){

            medalla = "🥇";

        }


        if(index === 1){

            medalla = "🥈";

        }


        let bono =
            bonos[item[0]] || 0;


        let bonosHoyActual =
            JSON.parse(
                localStorage.getItem(
                    "bonosHoy"
                )
            ) || {};


        let bonoAcumulado =
            bonosHoyActual[item[0]] || 0;


        let prog =
            control[item[0]]
            ?
            `${control[item[0]].pagados}/${control[item[0]].total}`
            :
            "0/0";


        rankingHTML += `

        <div style="
            font-size:12px;
            margin-top:4px;
        ">

            ${medalla}
            ${item[0]}
            →
            S/
            ${item[1].toLocaleString(
                "es-PE",
                {
                    minimumFractionDigits:2,
                    maximumFractionDigits:2
                }
            )}

            <br>

            🎯 ${prog}
            |
            💰 Bono: S/${bono}

        </div>

        `;

    });


    let rankingElement =
        document.getElementById(
            "rankingAsesores"
        );


    if(rankingElement){

        rankingElement.innerHTML =
            rankingHTML;

    }


    // ======================================
    // BOTONES RESUMEN
    // ======================================

    let btnHoy =
        document.getElementById(
            "btnHoy"
        );


    let btnMora =
        document.getElementById(
            "btnMora"
        );


    let btnCriticos =
        document.getElementById(
            "btnCriticos"
        );


    // ======================================
    // 🟢 CLIENTES AL DÍA
    // ======================================

    if(btnHoy){

        btnHoy.innerHTML = `

            🟢 Clientes al día
            (${hoyCount})

            <br>

            <small>

                💰 Repago diario:
                S/
                ${repagoHoy.toLocaleString(
                    "es-PE",
                    {
                        minimumFractionDigits:2,
                        maximumFractionDigits:2
                    }
                )}

            </small>

        `;

    }


    // ======================================
    // 🟡 MORA LEVE
    // ======================================

    if(btnMora){

        btnMora.innerHTML = `

            🟡 Mora leve
            (${moraCount})

            <br>

            <small>

                💰 Repago diario:
                S/
                ${repagoMora.toLocaleString(
                    "es-PE",
                    {
                        minimumFractionDigits:2,
                        maximumFractionDigits:2
                    }
                )}

            </small>

        `;

    }


    // ======================================
    // 🔴 MORA CRÍTICA
    // ======================================

    if(btnCriticos){

        btnCriticos.innerHTML = `

            🔴 Mora crítica
            (${criticoCount})

            <br>

            <small>

                💰 Repago diario:
                S/
                ${repagoCritico.toLocaleString(
                    "es-PE",
                    {
                        minimumFractionDigits:2,
                        maximumFractionDigits:2
                    }
                )}

            </small>

        `;

    }

}
