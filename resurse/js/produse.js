/* alert(1)

a=10
alert(a)
alert(window.a) */

window.onload = function() { //cand s a incarcat ferestrea si s a citit tot atunci selecteaza butonul dupa id.
    let btn = document.getElementById("filtrare"); //pot sa selectez butonul dupa id
    if(btn) {
        btn.onclick = function(e) { //adaugam parametrul e pentru event
            e.preventDefault(); //prevenim comportamentul implicit al formularului
            
            // Preluăm valorile din toate câmpurile de filtrare
            let inpNume = document.getElementById("inp-nume").value.trim().toLowerCase();
            let inpCuloare = document.getElementById("inp-culoare").value.trim().toLowerCase();
            let inpEtichete = document.getElementById("inp-etichete").value.trim().toLowerCase();
            let inpSubcategorie = document.getElementById("inp-subcategorie").value.trim().toLowerCase();
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

            let inpPret = parseFloat(document.getElementById("inp-pret").value);
            let inpCategorie = document.getElementById("inp-categorie").value.trim().toLowerCase();
            
            let produse = document.getElementsByClassName('produs');
            for (let prod of produse) {
                prod.style.display = 'none';
                
                // Verificăm toate condițiile
                let nume = prod.getElementsByClassName('val-nume')[0].innerText.trim().toLowerCase();
                let culoare = prod.getElementsByClassName('val-culoare')[0].innerText.trim().toLowerCase();
                let etichete = prod.getElementsByClassName('val-etichete')[0].innerText.trim().toLowerCase();
                let durabilitate = parseInt(prod.getElementsByClassName('val-durabilitate')[0].innerText);
                let pret = parseFloat(prod.getElementsByClassName('val-pret')[0].innerText);
                let categorie = prod.getElementsByClassName('val-categorie')[0].innerText.trim().toLowerCase();
                let dataAdaugare = new Date(prod.getElementsByTagName('time')[0].getAttribute('datetime'));
                
                // Verificăm toate condițiile de filtrare
                let cond1 = nume.startsWith(inpNume);
                let cond2 = inpDurabilitate === "toate" ? true : (durabilitate >= minDurabilitate && durabilitate <= maxDurabilitate);
                let cond3 = pret >= inpPret; // Change condition to filter products with price greater than or equal to inpPret
                let cond4 = (inpCategorie === "toate" || inpCategorie === categorie);
                let cond5 = (inpCuloare === "" || culoare.includes(inpCuloare));
                let cond6 = (inpEtichete === "" || inpEtichete.split(",").every(eticheta => 
                    etichete.includes(eticheta.trim())));
                let cond7 = (inpSubcategorie === "toate" || inpSubcategorie === "");
                
                // Verificăm dacă e produs nou (maxim 7 zile)
                let cond8 = !inpNoutati || (new Date() - dataAdaugare) / (1000 * 60 * 60 * 24) <= 7;
                
                if (cond1 && cond2 && cond3 && cond4 && cond5 && cond6 && cond7 && cond8) {
                    prod.style.display = 'block';
                }
            }
        }
    }

    document.getElementById("inp-pret").onchange = function() { //am selectat range ul si am zis ce se intampla cand se modifica valoarea
        document.getElementById("infoRange").innerHTML = `(${this.value})` //asta e functioa care se executa cand se modifica val, infoRange e (0) din site, inner html e html ul spanului, continutul, apostroful oblic nu mai face concatenari , cu ghilimele nu putem insera val cu ${}, mai simplu
    }

    document.getElementById("resetare").onclick = function(e) { 
        e.preventDefault(); //prevenim comportamentul implicit al formularului
        
        // Resetăm toate câmpurile la valorile lor implicite
        document.getElementById("inp-nume").value = "";
        document.getElementById("inp-culoare").value = "";
        document.getElementById("inp-etichete").value = "";
        document.getElementById("inp-observatii").value = "";
        document.getElementById("inp-noutati").checked = false;
        
        // Resetăm selecturile
        document.getElementById("inp-categorie").value = "toate";
        document.getElementById("inp-subcategorie").value = "toate";
        
        // Resetăm prețul la 0
        let inputRange = document.getElementById("inp-pret");
        inputRange.value = 0; // Reset to 0 instead of max

        // Update infoRange to reflect the reset value
        document.getElementById("infoRange").innerHTML = `(${inputRange.value})`;
        
        // Resetăm radio button-ul la "toate"
        document.getElementById("i_rad4").checked = true;
        
        // Afișăm toate produsele
        let produse = document.getElementsByClassName('produs');
        for (let prod of produse) { 
            prod.style.display = 'block';
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