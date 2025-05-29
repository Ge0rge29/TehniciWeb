const express= require("express"); //obiectul executat de biblioteca express
const path= require("path");
const fs= require("fs"); 
const sharp= require("sharp"); //biblioteca pentru manipularea imaginilor
const sass= require("sass"); 



app= express(); // ruleaza serverul

console.log("Folderul proiectului: ", __dirname) 
console.log("Calea fisierului idex.js: ", __filename) 
console.log("Folderul curent de lucru: ", process.cwd()) 

app.set("view engine", "ejs") //limbajul de template default 

obGlobal={
    obErori: null,
    obImagini: null,
    folderScss: path.join(__dirname,"resurse/scss"),
    folderCss: path.join(__dirname,"resurse/css"),
    folderBackup: path.join(__dirname,"backup")
}

vect_foldere=["temp", "backup", "temp1"]
for (let folder of vect_foldere){
    let caleFolder=path.join(__dirname,folder)
    if(!fs.existsSync(caleFolder)){
        fs.mkdirSync(caleFolder); 
    }
}

function compileazaScss(caleScss, caleCss){
    console.log("cale:",caleCss);
    if(!caleCss){

        let numeFisExt=path.basename(caleScss);
        let numeFis=numeFisExt.split(".")[0]   /// "a.scss"  -> ["a","scss"]
        caleCss=numeFis+".css";
    }
    
    if (!path.isAbsolute(caleScss))
        caleScss=path.join(obGlobal.folderScss,caleScss )
    if (!path.isAbsolute(caleCss))
        caleCss=path.join(obGlobal.folderCss,caleCss )
    

    let caleBackup=path.join(obGlobal.folderBackup, "resurse/css");
    if (!fs.existsSync(caleBackup)) {
        fs.mkdirSync(caleBackup,{recursive:true})
    }
    
    // la acest punct avem cai absolute in caleScss si  caleCss

    let numeFisCss=path.basename(caleCss);
    let numeFisBackup = `${path.parse(numeFisCss).name}_${Date.now()}${path.parse(numeFisCss).ext}`; //etapa5 bonus 2
    
    if (fs.existsSync(caleCss)){
        fs.copyFileSync(caleCss, path.join(obGlobal.folderBackup, "resurse/css", numeFisBackup)); //etapa5 bonus 2 
    }
    rez=sass.compile(caleScss, {"sourceMap":true});
    fs.writeFileSync(caleCss,rez.css)
    //console.log("Compilare SCSS",rez);
}
//compileazaScss("a.scss");
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


// proprietatea cu vectorul de erori
function initErori(){
    let continut = fs.readFileSync(path.join(__dirname,"resurse/json/erori.json")).toString("utf-8");
    
    obGlobal.obErori=JSON.parse(continut)
    
    obGlobal.obErori.eroare_default.imagine=path.join(obGlobal.obErori.cale_baza, obGlobal.obErori.eroare_default.imagine)
    for (let eroare of obGlobal.obErori.info_erori){
        eroare.imagine=path.join(obGlobal.obErori.cale_baza, eroare.imagine)
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





function afisareEroare(res, identificator, titlu, text, imagine){
    let eroare= obGlobal.obErori.info_erori.find(function(elem){ 
                        return elem.identificator==identificator
                    });
    if(eroare){
        if(eroare.status)
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
app.use("/resurse", express.static(path.join(__dirname,"resurse")))      
app.use("/rnode_modules", express.static(path.join(__dirname,"node_modules"))) 

app.get("/favicon.ico", function(req, res){
    res.sendFile(path.join(__dirname, "/resurse/imagini/favicon/favicon.ico"))
})


app.get("/cerere", function(req, res) {
    try {
        const numarImagini = 4; // Fixed number of images
        
        // Get all available images and ensure we have enough by duplicating if necessary
        let imaginiDisponibile = [...obGlobal.obImagini.imagini];
        while(imaginiDisponibile.length < numarImagini) {
            imaginiDisponibile = [...imaginiDisponibile, ...imaginiDisponibile];
        }
        
        // Select exactly 4 random images
        let imaginiGalerie = [];
        while(imaginiGalerie.length < numarImagini) {
            const index = Math.floor(Math.random() * imaginiDisponibile.length);
            imaginiGalerie.push(imaginiDisponibile[index]);
            imaginiDisponibile.splice(index, 1);
        }

        res.render("pagini/cerere", {
            imaginiGalerie: imaginiGalerie,
            numarImagini: 4 // Always 4
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

app.get(/^\/([a-zA-Z0-9\/_-]*)$/, function(req, res, next){
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


