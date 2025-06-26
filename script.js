async function obtenirTauxDeChange(from, to) {
    const CACHE_KEY = 'taux_change_' + from + '_' + to;
    const UNE_HEURE = 30 * 1000; // en millisecondes

    // Verification du cache
    const cache = localStorage.getItem(CACHE_KEY);
    if (cache) {
        const { timestamp, taux } = JSON.parse(cache);
        const maintenant = Date.now();

        if (maintenant - timestamp < UNE_HEURE) {
            console.log('Taux chargé depuis le cache');
            return taux;
        }
    }

    // Sinon on convoque l'API
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/' + from);
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const data = await response.json();

        var rate = data.rates[to];
        // console.log("Obtenir Taux");
        if (rate === undefined) {
            // throw new Error('Le taux pour '+ from + ' --> ' + to +' n’a pas été trouvé.');
            rate = -1;
            return rate;
        }

        // Stocker en cache avec timestamp vu que le rate est valide
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: Date.now(),
            taux : rate
        }));

        console.log('Taux mis en cache après appel API');
        return rate;
    } catch (error) {
        console.error('Erreur lors de la récupération du taux de change:', error);
        return null;
    }
}

var taux = 0;

amount = document.getElementById("amount");
result = document.getElementById("result");
depart = document.getElementById("from");
arrivee = document.getElementById("to");
symbolAmount = document.getElementById("symbol-amount");
symbolResult = document.getElementById("symbol-result");

function getSymbol(curr){
    if(curr == 'EUR'){return "€";}
    else if(curr == 'USD'){return "$";}
    else if(curr == 'XAF'){return "XAF";}
    else if(curr == 'JPY'){return "¥";}
    else {return "X";}
}

async function actualiser(){
    f = document.getElementById("from").value;
    t = document.getElementById("to").value;
    console.log(f + '-' + t);
    taux = await obtenirTauxDeChange(f, t);
    /*
    obtenirTauxDeChange(f, t).then(rate => {
        if (rate !== null) {
            taux = rate;
            console.log("Taux normal : " + taux);
        }
    });
    */
    // console.log("Suite !");
    if(taux != -1){
        if(amount.value == ''){
            result.innerHTML = '';
            // console.log("Vide ????" + amount.value);
        }
        else{
            console.log(" ***Taux*** " + taux);
            result.innerHTML = '' + (taux * parseFloat(amount.value)).toFixed(3);
            // console.log("Finish !");
        }
    }
}

amount.addEventListener('input', ()=>{
    actualiser();
});

depart.addEventListener('change', ()=>{
    console.log(document.getElementById("from").value);
    //alert("Hey !");
    actualiser();
    symbolAmount.innerHTML = getSymbol(depart.value);
});

arrivee.addEventListener('change', ()=>{
    //alert("Hey !");
    actualiser();
    symbolResult.innerHTML = getSymbol(arrivee.value);
});

/*
*/