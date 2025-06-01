window.addEventListener("load", function(){ //avem  nevoie de addefventlisener pentru ca onload este deja si suprascrie
    this.document.getElementById("schimba_tema").onclick = function() { 
        if (document.body.classList.toggle("dark")){ //daca e true a daugat clasa dark, daca e false o sterge
            localStorage.setItem("tema", "dark"); //seteaza in local storage tema dark
        }    
        else{
            localStorage.removeItem("tema"); //daca nu e dark, sterge tema din local storage
        }
    }
}) 