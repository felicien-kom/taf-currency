// Recuperation des elements du HTML à manipuler
const amount = document.getElementById("amount");
const result = document.getElementById("result");
const depart = document.getElementById("from");
const arrivee = document.getElementById("to");
const symbolAmount = document.getElementById("symbol-amount");
const symbolResult = document.getElementById("symbol-result");
const codeFrom = document.getElementById("code-from");
const codeTo = document.getElementById("code-to");
const convertBase = document.getElementById("convert-base");
const dateChecked = document.getElementById("date-checked");
const timeChecked = document.getElementById("time-checked");

// Taux de change
let taux = 0;

// Fonction permettant d'obtenir le taux de change souhaite
async function obtenirTauxDeChange(from, to) {
    // Clé du taux de change pour le cache
    const CACHE_KEY = 'taux_change_' + from + '_' + to;
    const VALIDITY_PERIOD = 5 * 60 * 1000; // en millisecondes

    // Verification du cache
    const cache = localStorage.getItem(CACHE_KEY);
    if (cache) {// Si le taux cherche se trouve dans le cache
        const { timestamp, taux } = JSON.parse(cache);
        const maintenant = Date.now();
        // et que de plus il est encore valide, ...
        if (maintenant - timestamp < VALIDITY_PERIOD) {
            console.log('Taux chargé depuis le cache');
            // ... alors on recupere le taux depuis ce cache
            return [taux, timestamp];
        }
    }

    // Sinon on convoque l'API
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/' + from);
        if (!response.ok) {
            throw new Error(`Erreur HTTP lors de l'obtention du taux : ${response.status}`);
        }

        const data = await response.json();

        let rate = data.rates[to];
        // console.log("Obtenir Taux");
        if (rate === undefined || rate === null) {
            // throw new Error('Le taux pour '+ from + ' --> ' + to +' n’a pas été trouvé.');
            rate = -1;
            return [rate, null];
        }

        // Stocker en cache avec timestamp vu que le rate est valide
        let newTimestamp = Date.now();
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: newTimestamp,
            taux : rate
        }));

        console.log('Taux mis en cache après appel API');
        return [rate, newTimestamp];
    } catch (error) {
        console.error('Erreur lors de la récupération du taux de change:', error);
        return [null, null];
    }
}

// Fonction utile pour actualiser les symboles en fonction des devises
function getSymbol(curr){
    if(curr == 'EUR'){return "€";}
    else if(curr == 'USD'){return "$";}
    else if(curr == 'XAF'){return "X";}
    else if(curr == 'JPY'){return "¥";}
    else {return "X";}
}

// Fonction utile pour formater les Dates
function presentDateChecked(date){
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    let d = date.getDate();
    return y + '-' + ((m < 10) ? '0' : '') + m + '-' + ((d < 10) ? '0' : '') + d;
}
// Fonction utile pour formater les Heures
function presentTimeChecked(date){
    let th = date.getHours();
    let tm = date.getMinutes();
    return '' + ((th < 10) ? '0' : '') + th + '-' + ((tm < 10) ? '0' : '') + tm;
}

// Fonction pour actualiser le taux et le resultat affiché à chaque modification du montant
async function actualiser(){
    let f = document.getElementById("from").value;
    let t = document.getElementById("to").value;
    console.log(f + '-' + t);
    let tabTaux = await obtenirTauxDeChange(f, t);
    taux = tabTaux[0];
    let taxRateDate = new Date(tabTaux[1]);
    // console.log(taxRateDate);
    /*
    obtenirTauxDeChange(f, t).then(rate => {
        if (rate !== null) {
            taux = rate;
            console.log("Taux normal : " + taux);
        }
    });
    */
    // console.log("Suite !");
    if(taux === null){
        result.value = 'Error !';
        convertBase.innerHTML = '???';
        dateChecked.innerHTML = 'YYYY-MM-DD';
        timeChecked.innerHTML = 'HH-MM';
    }
    else if(taux != -1){// Si le taux est valide
        convertBase.innerHTML = '' + taux;
        if(amount.value == ''){// Si on a rien saisi,
            result.value = '';// on ne fait rien
            // console.log("Vide ????" + amount.value);
        }
        else{
            console.log(" ***Taux*** " + taux);
            result.value = '' + (taux * parseFloat(amount.value)).toFixed(3);
            // console.log("Finish !");
        }
        dateChecked.innerHTML = presentDateChecked(taxRateDate);
        timeChecked.innerHTML = presentTimeChecked(taxRateDate);
    }
    else{
        convertBase.innerHTML = '' + taux;
        result.value = 'Enter a positive number';
        dateChecked.innerHTML = 'YYYY-MM-DD';
        timeChecked.innerHTML = 'HH-MM';
    }
}

// Dès le départ, on actualise pour commencer
actualiser();

// Modification du montant initial
amount.addEventListener('input', ()=>{
    actualiser();
});

// Modification de la devise initiale
depart.addEventListener('change', ()=>{
    // console.log(document.getElementById("from").value);
    //alert("Hey !");
    actualiser();
    codeFrom.innerHTML = depart.value;
    symbolAmount.innerHTML = getSymbol(depart.value);
});

// Modification de la devise finale
arrivee.addEventListener('change', ()=>{
    //alert("Hey !");
    actualiser();
    codeTo.innerHTML = arrivee.value;
    symbolResult.innerHTML = getSymbol(arrivee.value);
});