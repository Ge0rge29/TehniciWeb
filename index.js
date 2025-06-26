const express= require("express"); 
const path= require("path");
const fs= require("fs"); 
const sharp= require("sharp"); 
const sass= require("sass"); 
const pg= require("pg"); 

//express e un obiect dat de biblioteca tot express 
//require imi returneaza un obiect cu proprietati si metode

const Client=pg.Client; //clasa definita in pachet 

client=new Client({  //constructorul care are un obiect
    database:"proiect",
    user:"george",
    password:"parola",
    host:"localhost",
    port:5432
})

client.connect()
client.query("select * from produse_sportive", function(err, rezultat ){ //functie call back cand se termina executia cu erori sau cu rezultat si functia ia raspunsul
    console.log(err)    
    console.log("Rezultat queri:", rezultat) //etapa 6 ex4
})
client.query("select * from unnest(enum_range(null::categ_produs))", function(err, rezultat ){ //ofera toate elementele care intra in enum e un vector de stringuri, selecteaza toate valorile din enum
    console.log(err)    
    console.log(rezultat) //unnest le transforma din string in vector de obiecte
})

// client.query("select * from unnest(enum_range(null::tipuri_produse))", function(err, rezultat ){
//     console.log("Tipuri produse:", rezultat.rows);
// });


app= express(); // ruleaza serverul

console.log("Folderul proiectului: ", __dirname) 
console.log("Calea fisierului idex.js: ", __filename) 
console.log("Folderul curent de lucru: ", process.cwd()) 

app.set("view engine", "ejs") //limbajul de template default 

obGlobal={ //cream obiectul global cu proprietati ale aecestuia
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname,"resurse/scss"),
    folderCss: path.join(__dirname,"resurse/css"),
    folderBackup: path.join(__dirname,"backup"),
    optiuniMeniu: null
}

client.query("select * from unnest(enum_range(null::tipuri_produse))", function(err, rezultat ){ // clinet query e o metoda pentru a transmite interogari sql catre o baza de date
    console.log(err)    
    console.log("Tipuri produse:", rezultat) 
    obGlobal.optiuniMeniu=rezultat.rows; //transmit in obiectul global optiunile de meniu. rezultat e ob nu vector care are ca proprietare rows care e vectorul cu inregistrari
})

vect_foldere=["temp", "backup", "temp1"]
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname,folder) //crea cai complete 
    if(!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder); 
    }
}

function compileazaScss(caleScss, caleCss){
    console.log("cale:",caleCss);
    if(!caleCss){ //daca calea nu e oferita se creaza fiseerul.css

        let numeFisExt=path.basename(caleScss);
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css";
    }
    
    if (!path.isAbsolute(caleScss)) //se transforma in cai absolute
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    

    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true}) //creare backup
    }
    
    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss=path.basename(caleCss);
    let numeFisBackup = `${path.parse(numeFisCss).name}_${Date.now()}${path.parse(numeFisCss).ext}`; 
    
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css", numeFisBackup));  
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    //console.log("Compilare SCSS",rez);
}

vFisiere=fs.readdirSync(obGlobal.folderScss);
for( let numeFis of vFisiere ){
    if (path.extname(numeFis)==".scss"){
        compileazaScss(numeFis);
    }
}


fs.watch(obGlobal.folderScss, function(eveniment, numeFis){
    console.log(eveniment, numeFis);
    if (eveniment=="change" || eveniment=="rename"){
        let caleCompleta=path.join(obGlobal.folderScss, numeFis);
        if (fs.existsSync(caleCompleta)){
            compileazaScss(caleCompleta);
        }
    }
})


//ia toate erorile din fisier le proceseaza si afiseaza 
function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    
    obGlobal.obErori=JSON.parse(continut) //jsone parse transforma un string in obiect
    
    obGlobal.obErori.eroare_default.imagine=path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine) //concatenez din eraore default imaginea
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine=path.join(obGlobal.obErori.cale_baza, eroare.imagine)// concatenez calea de baza la fiecare eroare
    }
    console.log(obGlobal.obErori)

}
initErori()




function initImagini(){
    var continut= fs.readFileSync(path.join(__dirname,"resurse/json/galerie.json")).toString("utf-8");

    obGlobal.obImagini=JSON.parse(continut);
    let vImagini=obGlobal.obImagini.imagini;

    let caleAbs=path.join(__dirname,obGlobal.obImagini.cale_galerie);
    let caleAbsMediu=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mediu");
    let caleAbsMic=path.join(__dirname,obGlobal.obImagini.cale_galerie, "mic");
    
    if (!fs.existsSync(caleAbsMediu))
        fs.mkdirSync(caleAbsMediu);
    if (!fs.existsSync(caleAbsMic))
        fs.mkdirSync(caleAbsMic);

    for (let imag of vImagini){
        [numeFis, ext]=imag.fisier.split(".");
        let caleFisAbs=path.join(caleAbs,imag.fisier);
        let caleFisMediuAbs=path.join(caleAbsMediu, numeFis+".webp");
        let caleFisMicAbs=path.join(caleAbsMic, numeFis+".webp");
        
        sharp(caleFisAbs)
            .resize(300)
            .toFile(caleFisMediuAbs);
        sharp(caleFisAbs)
            .resize(150)
            .toFile(caleFisMicAbs);
            
        imag.fisier_mediu=path.join("/", obGlobal.obImagini.cale_galerie, "mediu", numeFis+".webp");
        imag.fisier_mic=path.join("/", obGlobal.obImagini.cale_galerie, "mic", numeFis+".webp");
        imag.fisier=path.join("/", obGlobal.obImagini.cale_galerie, imag.fisier);
    }
    console.log(obGlobal.obImagini);
}
initImagini();




function afisareEroare(res, identificator, titlu, text, imagine){ //trimite identificato pentru a compara cu erorile din json. funtia booleana
    let eroare= obGlobal.obErori.info_erori.find(function(elem){ 
                        return elem.identificator==identificator
                    });
    if(eroare){
        if(eroare.status) //erorile de protocol http verific daca e eroare predefinita, status pt pagina incarcata corect e 200
            res.status(identificator)
        var titluCustom=titlu || eroare.titlu;
        var textCustom=text || eroare.text;
        var imagineCustom=imagine || eroare.imagine;


    }
    else{
        var err=obGlobal.obErori.eroare_default
        var titluCustom=titlu || err.titlu;
        var textCustom=text || err.text;
        var imagineCustom=imagine || err.imagine;


    }
    res.render("pagini/eroare", { //transmit obiectul locals
        titlu: titluCustom,
        text: textCustom,
        imagine: imagineCustom
})

}




app.use("/", function(req, res, next){ //* daca nu ii dau calea aplica pe toate paginile, e un fel de implicit
    res.locals.optiuniMeniu=obGlobal.optiuniMeniu; //in localsul raspunsului setez setez proprietatea suplimentara optinuiMeniu cu valorile din obGlobal.optiuniMeniu

    next(); //next() trece mai departe , fara el ramnea blocat
})

app.use("/resurse", express.static(path.join(__dirname,"resurse")))      
app.use("/rnode_modules", express.static(path.join(__dirname,"node_modules"))) 

app.get("/favicon.ico", function(req, res){ //calea url
    res.sendFile(path.join(__dirname, "/resurse/imagini/favicon/favicon.ico"))
})


app.get("/cerere", function(req, res) {
    try {
        const numarImagini = 4; 
        
        let imaginiDisponibile = [...obGlobal.obImagini.imagini];
        while(imaginiDisponibile.length < numarImagini) { 
            imaginiDisponibile = [...imaginiDisponibile, ...imaginiDisponibile];
        }
        
        let imaginiGalerie = [];
        while(imaginiGalerie.length < numarImagini) {
            const index = Math.floor(Math.random() * imaginiDisponibile.length); // de ce am inmultit cu imaigniDisponibile.length 
            imaginiGalerie.push(imaginiDisponibile[index]);
            imaginiDisponibile.splice(index, 1);
        }

        res.render("pagini/cerere", {
            imaginiGalerie: imaginiGalerie,
            numarImagini: 4 
        });
    } catch(error) {
        console.error('Error in /cerere:', error);
        res.status(500).send('Error loading gallery');
    }
});

app.get(["/","/index","/home"], function(req, res){
    res.render("pagini/index", {ip: req.ip, imagini: obGlobal.obImagini.imagini});
})

// app.get("/despre", function(req, res){
//     res.render("pagini/despre");
// })

app.get("/fisier", function(req, res, next){
    res.sendFile(path.join(__dirname, "package.json"));
})

app.get("/abc", function(req, res, next){
    res.write("Data curenta: ") 
    next()
})
//aici trimite si nu mai apare res, se incarca incontinuu


app.get("/abc", function(req, res, next){
    res.write((new Date()) + "") 
    res.end() 
    next()
})
//res.end() opreste doar conversatia, nu si conexiunea


app.get("/abc", function(req, res, next){
    console.log("------------------")
})




app.get("/produse", function(req, res){ //etapa 6 cerinta 1
    console.log(req.query)
    var conditieQuery="";
    if (req.query.tip){
        conditieQuery=` where tip_produs='${req.query.tip}'` //etapa 6 ex4
    }

    // if (req.query.tip) {
    //     //aici am avut eroare pentru ca mi verifica altceva si am adaugat sa verificam daca filtrez dupa cateforie sau tip produs
    //     if (['greutati', 'fishing', 'echipament', 'accesorii', 'diverse'].includes(req.query.tip)) {
    //         conditieQuery = ` where categorie='${req.query.tip}'`;
    //     } else if (['gantere', 'undite', 'rachete', 'mingi', 'altele'].includes(req.query.tip)) {
    //         conditieQuery = ` where tip_produs='${req.query.tip}'`;
    //     }
    // }

    // Bonus 1: Query pentru opțiuni categorii
    queryOptiuni = "select * from unnest(enum_range(null::categ_produs))" // Functie care extrage toate valorile din tip ENUM unnest() transformă un array în rânduri separate:
    
    queryPretMinMax = "select min(pret) as min_pret, max(pret) as max_pret from produse_sportive";
    
    querySubcategorii = "select distinct subcategorie from produse_sportive where subcategorie is not null order by subcategorie"; //Exclude produsele care nu au subcategorie setată
    queryCulori = "select distinct culoare from produse_sportive where culoare is not null order by culoare";
    queryDurabilitate = "select min(durabilitate) as min_durabilitate, max(durabilitate) as max_durabilitate from produse_sportive";
    queryEtichete = "select distinct unnest(string_to_array(etichete, ',')) as eticheta from produse_sportive where etichete is not null and etichete != '' order by eticheta";
    queryTextStats = "select avg(length(nume || ' ' || coalesce(etichete, ''))) as avg_length from produse_sportive";
    queryNoutati = "select count(*) as produse_noi from produse_sportive where data_adaugare >= current_date - interval '30 days'";
    
    queryGreutateStats = "select min(greutate) as min_greutate, max(greutate) as max_greutate, avg(greutate) as avg_greutate from produse_sportive where greutate is not null";

    client.query(queryOptiuni, function(err, rezOptiuni){ //cu client.query executa queryul si transmitem functia care sa se execute cand priumeste raspuns
        console.log(rezOptiuni)

        // Bonus 1: Executăm query pentru min/max preț
        client.query(queryPretMinMax, function(err, rezPretMinMax){
            if (err){
                console.log("Eroare la query preț min/max:", err);
                afisareEroare(res, 2);
                return;
            }

            client.query(querySubcategorii, function(err, rezSubcategorii){
                if (err){
                    console.log("Eroare la query subcategorii:", err);
                    afisareEroare(res, 2);
                    return;
                }                
                client.query(queryCulori, function(err, rezCulori){
                    if (err){
                        console.log("Eroare la query culori:", err);
                        afisareEroare(res, 2);
                        return;
                    }

                    client.query(queryDurabilitate, function(err, rezDurabilitate){
                        if (err){
                            console.log("Eroare la query durabilitate:", err);
                            afisareEroare(res, 2);
                            return;
                        }                        
                        client.query(queryEtichete, function(err, rezEtichete){
                            if (err){
                                console.log("Eroare la query etichete:", err);
                                afisareEroare(res, 2);
                                return;
                            }                            
                            client.query(queryTextStats, function(err, rezTextStats){
                                if (err){
                                    console.log("Eroare la query statistici text:", err);
                                    afisareEroare(res, 2);
                                    return;
                                }                               
                                client.query(queryNoutati, function(err, rezNoutati){
                                    if (err){
                                        console.log("Eroare la query noutăți:", err);
                                        afisareEroare(res, 2);
                                        return;
                                    }                                   
                                    client.query(queryGreutateStats, function(err, rezGreutateStats){
                                        if (err){
                                            console.log("Eroare la query statistici greutate:", err);
                                            afisareEroare(res, 2);
                                            return;
                                        }

                                        queryProduse="select * from produse_sportive" + conditieQuery //fiind in functie cauta in taote produselse
                                        client.query(queryProduse, function(err, rez){
                                            if (err){
                                                console.log(err);
                                                afisareEroare(res, 2); //poate da eroare dar daca nu se transmita pe produse.ejs 
                                            }
                                            else{                            // Bonus 1: Transmitem toate datele dinamice la template
                                                res.render("pagini/produse", {
                                                    produse: rez.rows, //array de obiecte
                                                    optiuni: rezOptiuni.rows,
                                                    pretMinMax: rezPretMinMax.rows[0], // {min_pret, max_pret}
                                                    suboptiuni: rezSubcategorii.rows,
                                                    culoriOptiuni: rezCulori.rows,
                                                    durabilitate: rezDurabilitate.rows[0], //Obiect cu 2 prop
                                                    eticheteOptiuni: rezEtichete.rows, 
                                                    textStats: rezTextStats.rows[0], 
                                                    noutati: rezNoutati.rows[0], 
                                                    greutateStats: rezGreutateStats.rows[0] //Ob cu 3 prop
                                                })
                                            }
                                        })
                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
})


app.get("/produs/:id", function(req, res){ //folosim un paramentru :id e un fel de variabila etapa 6 cerinta 2
    console.log(req.params) //afiseaza in consola obiectul cu parametrii
    client.query(`select * from produse_sportive where id=${req.params.id}`, function(err, rez){ //in loc sa concatenez cu id ul din req.params il scriu intre ${ } si face interpolare
        if (err){ // acest query e trimis de clint.query catre baza de date  poate raspunde cu eroare sau rezultat, 
            console.log(err);
            afisareEroare(res, 2);
        }
        else{ // daca n am primit eroare selectam dupa id sa verificam daca e 1 sau 0 cu rowCount si daca sunt 0 produsul nu exista deci eroare 404
            if (rez.rowCount==0){
                afisareEroare(res, 404);
            }
            else{
                res.render("pagini/produs", {prod: rez.rows[0]}) // daca existam afisam pagina 
            }
        }
    })
})



app.get(/^\/resurse\/[a-zA-Z0-9_\/]*$/, function(req, res, next){
    afisareEroare(res,403);
})

app.get(/^.*\.ejs$/, function(req, res, next){
    afisareEroare(res, 400);
});

// app.get("/*.ejs", function(req, res, next){
//     afisareEroare(res,400);
// })

app.get("/video", function(req, res) {
    res.render("pagini/video");
});

app.get(/^\/([a-zA-Z0-9\/_-]*)$/, function(req, res, next){ //functie callbock care trimite ca argument
    try {
        res.render("pagini" + req.url, function (err, rezultatRandare) {
            if (err) {
                if (err.message.startsWith("Failed to lookup view")) {
                    afisareEroare(res, 404);
                } else {
                    afisareEroare(res);
                }
            } else {
                console.log(rezultatRandare);
                res.send(rezultatRandare);
            }
        });
    } catch (errRandare) {
        if (errRandare.message.startsWith("Cannot find module")) {
            afisareEroare(res, 404);
        } else {
            afisareEroare(res);
        }
    }
});

//am incercat dupa sa fac asa dar nu era optim din cauza /:pagina si nu lua tot
// app.get("/:pagina", function(req, res, next) {
//     try {
//         let pagina = req.params.pagina;
//         // Only try to render views for paths that don't include dots (to avoid trying to render resources)
//         if (!pagina.includes(".")) {
//             res.render("pagini/" + pagina, function(err, rezultatRandare) {
//                 if (err) {
//                     if (err.message.startsWith("Failed to lookup view")) {
//                         afisareEroare(res, 404);
//                     } else {
//                         afisareEroare(res);
//                     }
//                 } else {
//                     console.log(rezultatRandare);
//                     res.send(rezultatRandare);
//                 }
//             });
//         } else {
//             next(); // Pass to next handler for files with extensions
//         }
//     } catch (errRandare) {
//         if (errRandare.message.startsWith("Cannot find module")) {
//             afisareEroare(res, 404);
//         } else {
//             afisareEroare(res);
//         }
//     }
// });

//asta e la laborator si nu a mers, primeam eroare pe el
// app.get("/*", function (req, res, next){
//     try{
//         res.render("pagini"+req.url,function (err, rezultatRandare){
//             if (err){
//                 if(err.message.startsWith("Failed to lookup view")){
//                     afisareEroare(res,404);
//                 }
//                 else{
//                     afisareEroare(res);
//                 }
//             }
//             else{
//                 console.log(rezultatRandare);
//                 res.send(rezultatRandare)
//             }
//         });
//     }
//     catch(errRandare){
//         if(errRandare.message.startsWith("Cannot find module")){
//             afisareEroare(res,404);
//         }
//         else{
//             afisareEroare(res);
//         }
//     }
// })


app.listen(8080); //portul pe care ruleaza serverul
console.log("Serverul a pornit") //afiseaza mesajul in consola


