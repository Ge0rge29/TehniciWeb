if (localStorage.getItem("tema")){ //daca acest item exista in local storage
    document.body.classList.add("dark"); //daca in local storage exista tema, adauga clasa dark, trebuie sa fie egal cu dark
}
else{
    document.body.classList.remove("dark"); //daca nu exista tema, sterge clasa dark
}