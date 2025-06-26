/* alert(1)

a=10
alert(a)
alert(window.a) */

window.onload = function() { //cand s a incarcat ferestrea si s a citit tot atunci selecteaza butonul dupa id.
    // Funcție pentru validarea textareas
    function validateTextarea(textarea, value) {
        let isValid = true;
        value = value.trim();

        // Validări specifice pentru fiecare textarea
        if (textarea.id === 'inp-nume') {
            if (value !== "" && /\d/.test(value)) {
                textarea.classList.add('is-invalid');
                textarea.parentElement.classList.add('is-invalid');
                isValid = false;
            }
        } else if (textarea.id === 'inp-observatii') {
            if (value.length > 200) {
                textarea.classList.add('is-invalid');
                textarea.parentElement.classList.add('is-invalid');
                isValid = false;
            }
        }

        // Dacă este valid, eliminăm clasele de eroare
        if (isValid) {
            textarea.classList.remove('is-invalid');
            textarea.parentElement.classList.remove('is-invalid');
        }

        return isValid;
    }

    // Adăugăm event listeners pentru validare în timp real
    ['inp-nume', 'inp-observatii'].forEach(id => {
        let textarea = document.getElementById(id);
        if (textarea) {
            textarea.addEventListener('input', function() {
                validateTextarea(this, this.value);
            });
        }
    });

    let btn = document.getElementById("filtrare"); //pot sa selectez butonul dupa id
    if(btn) {
        btn.onclick = function(e) { //adaugam parametrul e pentru event
            e.preventDefault(); //prevenim comportamentul implicit al formularului
              // VALIDARE: numele să nu conțină cifre (pentru că este folosit în filtrare)
            let inpNumeElem = document.getElementById("inp-nume");
            let inpNume = inpNumeElem.value.trim().toLowerCase();
            inpNumeElem.style.border = ""; // resetare

            if (inpNume !== "" && /\d/.test(inpNume)) {
                alert("Numele nu trebuie să conțină cifre!");
                inpNumeElem.style.border = "2px solid red";
                return;
            }            let inpCuloare = document.getElementById("inp-culoare").value.trim().toLowerCase();
            let inpEtichete = document.getElementById("inp-etichete").value.trim().toLowerCase();
            let inpSubcategorie = document.getElementById("inp-subcategorie").value.trim().toLowerCase();
            let inpObservatii = document.getElementById("inp-observatii").value.trim().toLowerCase();
            let inpNoutati = document.getElementById("inp-noutati").checked;
            
            // Preluăm durabilitatea (codul existent)
            let vectRadio = document.getElementsByName('gr_rad');
            let inpDurabilitate = null;
            let minDurabilitate = null;
            let maxDurabilitate = null;
            for (let rad of vectRadio) {
                if (rad.checked) {
                    inpDurabilitate = rad.value;
                    if (inpDurabilitate != "toate") {
                        [minDurabilitate, maxDurabilitate] = inpDurabilitate.split(":");
                        minDurabilitate = parseInt(minDurabilitate);
                        maxDurabilitate = parseInt(maxDurabilitate);
                    }
                    break;
                }
            }

            // VALIDARE să fie ales un radio button
            if (!inpDurabilitate) {
                alert("Selectați o opțiune pentru durabilitate!");
                return;
            }            let inpPret = parseFloat(document.getElementById("inp-pret").value);
            let inpCategorie = document.getElementById("inp-categorie").value.trim().toLowerCase();
            
            // Bonus1 Adăugăm filtrarea după greutate maximă
            let inpGreutateMax = parseFloat(document.getElementById("inp-greutate-max").value);
            
            let produse = document.getElementsByClassName('produs');
            for (let prod of produse) {
                prod.style.display = 'none';
                
                // Verificăm toateconditiile
                let nume = prod.getElementsByClassName('val-nume')[0].innerText.trim().toLowerCase();
                let culoare = prod.getElementsByClassName('val-culoare')[0].innerText.trim().toLowerCase();
                let etichete = prod.getElementsByClassName('val-etichete')[0].innerText.trim().toLowerCase();
                let durabilitate = parseInt(prod.getElementsByClassName('val-durabilitate')[0].innerText);
                let pret = parseFloat(prod.getElementsByClassName('val-pret')[0].innerText);
                let categorie = prod.getElementsByClassName('val-categorie')[0].innerText.trim().toLowerCase();
                let dataAdaugare = new Date(prod.getElementsByTagName('time')[0].getAttribute('datetime'));
                
                // Bonus1 Extragem greutatea produsului
                let greutate = parseFloat(prod.getElementsByClassName('val-greutate')[0].innerText);
                
                // Verifica toate conditiile de filtrare
                let cond1 = nume.startsWith(inpNume);
                let cond2 = inpDurabilitate === "toate" ? true : (durabilitate >= minDurabilitate && durabilitate <= maxDurabilitate);
                let cond3 = pret >= inpPret; 
                let cond4 = (inpCategorie === "toate" || inpCategorie === categorie);               
                let cond5 = (inpCuloare === "" || culoare.includes(inpCuloare));
                let cond6 = (inpEtichete === "" || inpEtichete.split(",").every(eticheta => 
                    etichete.includes(eticheta.trim())));                
                let cond7 = (inpSubcategorie === "toate" || inpSubcategorie === "");
                
                let cond8 = !inpNoutati || (new Date() - dataAdaugare) / (1000 * 60 * 60 * 24) <= 30;
                
                let cond9 = greutate <= inpGreutateMax;
                
                let cond10 = (inpObservatii === "" || 
                    nume.includes(inpObservatii) || 
                    etichete.includes(inpObservatii));
                  if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8 && cond9 && cond10) {
                    prod.style.display = 'block';
                }
            }
            
            // Bonu3 verifica daca sunt produse vizibile
            let anyVisible = false;
            for (let prod of produse) {
                if (prod.style.display === 'block') {
                    anyVisible = true;
                    break;
                }
            }
            
            let noProductsMessage = document.getElementById("no-products-message");
            if (!noProductsMessage) {
                // Daca nu e il cree
                noProductsMessage = document.createElement("div");
                noProductsMessage.id = "no-products-message";
                noProductsMessage.className = "no-products-message";
                noProductsMessage.innerHTML = "Nu există produse conform filtrării curente.";
                
                // aduagare
                let gridProduse = document.querySelector(".grid-produse");
                gridProduse.parentNode.insertBefore(noProductsMessage, gridProduse.nextSibling);
            }
            
            noProductsMessage.style.display = anyVisible ? "none" : "block";
        }}

    document.getElementById("inp-pret").oninput = function() { //folosim oninput pentru actualizare in timp real
        document.getElementById("infoRange").innerHTML = `(${this.value})` //actualizeaza valoarea in timp real in timp ce glisam
    }

    document.getElementById("resetare").onclick = function(e) {
    e.preventDefault(); // prevenim comportamentul implicit

        if (confirm("Ești sigur că vrei să resetezi toate filtrele?")) {
            // Resetăm toate câmpurile la valorile lor implicite
            document.getElementById("inp-nume").value = "";
            document.getElementById("inp-culoare").value = "";
            document.getElementById("inp-etichete").value = "";
            document.getElementById("inp-observatii").value = "";
            document.getElementById("inp-noutati").checked = false;

            // Bonus 1: Resetăm și input-ul pentru greutate la valoarea maximă
            let inputGreutate = document.getElementById("inp-greutate-max");
            if (inputGreutate) {
                inputGreutate.value = inputGreutate.max; // resetează la valoarea maximă
            }            document.getElementById("inp-categorie").value = "toate";
            document.getElementById("inp-subcategorie").value = "toate";

            let inputRange = document.getElementById("inp-pret");
            inputRange.value = 0;
            document.getElementById("infoRange").innerHTML = `(${inputRange.value})`;

            document.getElementById("i_rad4").checked = true;            // Afișăm toate produsele
            let produse = document.getElementsByClassName('produs');
            for (let prod of produse) {
                prod.style.display = 'block';
            }
            
            // Ascundem mesajul "nu există produse" dacă există
            let noProductsMessage = document.getElementById("no-products-message");
            if (noProductsMessage) {
                noProductsMessage.style.display = "none";
            }

            // Resetăm și ordinea inițială (anulăm sortarea)
            let container = document.querySelector(".grid-produse");
            let produseArray = Array.from(produse);
            produseArray.sort(function(a, b) {
                // sortăm după ID-ul produsului (presupunem că sunt în ordine la început)
                let idA = parseInt(a.querySelector("input[type=checkbox]").value);
                let idB = parseInt(b.querySelector("input[type=checkbox]").value);
                return idA - idB;
            });

            for (let prod of produseArray) {
                container.appendChild(prod);
            }
        }
    }


    document.getElementById("sortCrescNume").onclick = function() {
        sorteaza (1); //apelam functia sorteaza cu semnul 1 pentru sortare crescatoare
        
    }
    document.getElementById("sortDescrescNume").onclick = function() {
        sorteaza (-1); 
        
    }
  

    function sorteaza(semn) {
        let produse = document.getElementsByClassName('produs')
        let vProduse = Array.from(produse); //transform produsele intr-un vector, vproduse e vectorul
        vProduse.sort(function(a, b) { //sortare crescatoare dupa nume, a si b sunt articole pentru ca vin din vector
            let pretA = parseFloat(a.getElementsByClassName('val-pret')[0].innerText.trim().toLowerCase()); 
            let pretB = parseFloat(b.getElementsByClassName('val-pret')[0].innerText.trim().toLowerCase()); // ma uit la nume doar cand preturie sunt egale 
            if(pretA != pretB) //daca preturile sunt diferite, sortez dupa pret
                return semn*(pretA - pretB)
            //preturile sunt egale aici atunci sortez dupa nume
            let numeA = a.getElementsByClassName('val-nume')[0].innerText.trim().toLowerCase(); //selectez numele produsului si il transform in litere mici
            let numeB = b.getElementsByClassName('val-nume')[0].innerText.trim().toLowerCase(); //a si b sunt elemente cu clasa prtodus care preia numele 
            return semn*numeA.localeCompare(numeB); //localeCompare compara doua siruri de caractere si returneaza -1, 0 sau 1
        })//acum daor am copiat referintele articolelor in vector si am sortat referintele, nu am sortat articolele in sine, deci nu am modificat in pagina

        for (let prod of vProduse) { //pentru fiecare produs din vectorul sortat
            prod.parentNode.appendChild(prod); //prod.parentnode toate articolele selecteaza acelasi element, appendchild adauga produsul la finalul elementului parinte, deci le pune in ordinea crescutaore
        }
    }

    window.onkeydown = function(e){
        console.log(e); 
        if(e.key == "c" && e.altKey) {
            let produse = document.getElementsByClassName('produs'); 
            let sumaPreturi = 0
            for (let prod of produse) { 
                if(prod.style.display != 'none') {
                    let pret = parseFloat(prod.getElementsByClassName('val-pret')[0].innerText.trim().toLowerCase()); 
                    sumaPreturi += pret;
                }
            }

            if (!document.getElementById("suma_preturi")) { 
                let pRezultat = document.createElement("p")
                pRezultat.innerHTML = sumaPreturi
                pRezultat.id = "suma_preturi"
                let p = document.getElementById("p-suma")
                p.parentElement.insertBefore(pRezultat, p.nextElementSibling)
                setTimeout(function() { //setTimeout pentru a sterge dupa 3 secunde
                    let p1 = document.getElementById("suma_preturi")
                    if (p1) {
                        p1.remove(); //daca exista elementul cu id suma_preturi, il sterg
                    }
                }, 2000);
            }
            
        }
    }



}

// console.log(btn.id)