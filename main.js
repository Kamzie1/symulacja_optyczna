/// Canvas

let canvas = document.getElementById('canvas');
canvas.style.display='block';
canvas.style.width='100%';
canvas.style.height='100%';
let WYSOKOSC = canvas.height=canvas.offsetHeight;
let SZEROKOSC = canvas.width=canvas.offsetWidth;
let j = 50;
const ctx = canvas.getContext("2d");

canvas.addEventListener("click", (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    sprawdzWspolrzedne(x, y);
});


/// zmienne globalne

const soczewkaSkupiajaca = {nazwa: "SoczS", typ: "SoczS", wspx: SZEROKOSC/2, h: WYSOKOSC/4, F: 100, id: 0, P:0};
const promienSwietlny = {nazwa: "PromS", typ: "PromS", wspx: SZEROKOSC/4, wspy: WYSOKOSC/3, alfa: 0, id: 0};

let os_Optyczna;
let wstazka;
let id_Obiektu=-1;
let pokazOgniskowe = 0;
let pokazGrid = 0;
const margines = 10;
let N1 = 1;

const kontener = document.getElementById("trescWstazki");

let Tworzenie = `<div class='soczewki'>
                    <div class="kontener-przyciskow">
                        <button class='skupiajaca' id='skupiajaca'><img height=100% width=100% src="img/skupiajaca.png"><span>Skupiająca</span></button>
                    </div>
                    <span>Soczewki</span>
                </div>
                <div class='zrodla-swiatla'>
                    <div class="kontener-przyciskow">
                        <button class='promien-swietlny' id='promien-swietlny'><img height=100% width=100% src="img/promien-swietlny.png"><span>Promień</span></button>
                    </div>
                    <span>Żródła światła</span>
                </div>`;

/// Główna pętla

rysuj();

function rysuj(){
    usunLocalStorage();
    ctx.clearRect(0, 0, SZEROKOSC, WYSOKOSC);
    rysuj_os();
    rysuj_obiekty();
    rysujObiektyPomocnicze();
    zaladujAktualneId();
    if(id_Obiektu!=-1){
        //rysujElementyKontrolne(id_Obiektu);
    }
}

/// Funkcje odświeżania

window.onload = function(){
    usunLocalStorage();
    zaladujWstazke();
    zaladujOs();
    dodawanieEventListener();
    wyswietlWstazke(wstazka);
    zaladujGrid();
}

function usunLocalStorage(){
    if (!sessionStorage.getItem("sessionVisit")) {
        localStorage.removeItem('wstazka');
        localStorage.removeItem('os_Optyczna');
        localStorage.removeItem('id_Obiektu');
        localStorage.removeItem('pokazOgniskowe');
        localStorage.removeItem('pokazGrid');
        localStorage.removeItem('N1');
        sessionStorage.setItem("sessionVisit", "true");
        location.reload();
    } 
}

function odswiez_os_optyczna(){
    zaladujOs();
    for(let i=0;i<os_Optyczna.length;i++)
    {
        os_Optyczna[i].id = i;
    }
    localStorage.setItem('os_Optyczna', JSON.stringify(os_Optyczna));
}

function zaladujAktualneId(){
    if(localStorage.getItem('id_Obiektu'))
        {
            id_Obiektu = localStorage.getItem('id_Obiektu');
        }
    else
        {
            id_Obiektu=-1;
        }
}

function zaladujOs(){
    if(localStorage.getItem('os_Optyczna'))
        {
            os_Optyczna = JSON.parse(localStorage.getItem('os_Optyczna'));
        }
        else
        {
            os_Optyczna =[];
            localStorage.setItem('os_Optyczna', JSON.stringify(os_Optyczna));
        }
}

function zaladujWstazke()
{
    if(localStorage.getItem('wstazka'))
    {
        wstazka = localStorage.getItem('wstazka');
    }
    else
    {
        wstazka = "SYMULACJA";
        localStorage.setItem('wstazka', wstazka);
    }
}

function zaladujOgniskowe(){
    if(localStorage.getItem('pokazOgniskowe'))
    {
        pokazOgniskowe = localStorage.getItem('pokazOgniskowe');
    }
}

function zaladujGrid(){
    if(localStorage.getItem('pokazGrid'))
    {
        pokazGrid = localStorage.getItem('pokazGrid');
    }
}

function zaladujN1(){
    if(localStorage.getItem('N1'))
    {
            N1 = localStorage.getItem('N1');
    }
}

/// Funckje symulacji

function filterOptyki(object){
    return object.typ == "SoczS";
}

function filterZrodlaSwiatla(object){
    return object.typ == "PromS";
}

function uruchomSymulacje(){
    zaladujOs();
    let zrodla_swiatla = os_Optyczna.filter(filterZrodlaSwiatla);
    for(let i=0;i<zrodla_swiatla.length;i++){
        Symuluj(zrodla_swiatla[i].wspx, zrodla_swiatla[i].wspy, zrodla_swiatla[i].alfa, os_Optyczna);
    }
}

function wZasiegu(wspx, h, P, xo){
    if(wspx<=xo)    return false;
    if(WYSOKOSC/2+h<P)  return false;
    if(WYSOKOSC/2-h>P)  return false;
    return true;
}

function Symuluj(wspx, wspy, alfa, os_Optyczna){
    let obiektyOptyczne = os_Optyczna.filter(filterOptyki);
    let a, b, xo, yo, y_pomo, b_pomo;
    xo = wspx;
    yo = wspy;

    a = Math.tan((Math.PI/180*(180-alfa)));
    b = yo-a*xo;

    ctx.beginPath();
    ctx.lineWidth=2;
    ctx.moveTo(xo, yo);

    while(true){
        let min = SZEROKOSC+100;
        let min_id = -1;
        for(let i=0;i<obiektyOptyczne.length;i++){
            obiektyOptyczne[i].P = a*obiektyOptyczne[i].wspx + b;

            if(!wZasiegu(obiektyOptyczne[i].wspx, obiektyOptyczne[i].h, obiektyOptyczne[i].P, xo)){
                continue;
            }

            if(obiektyOptyczne[i].wspx<min){
                min = obiektyOptyczne[i].wspx;
                min_id = i;
            }
        }

        if(min_id==-1){
            if(alfa==90){
                ctx.lineTo(xo, 0);
            }
            else if(alfa==270){
                ctx.lineTo(xo, WYSOKOSC);
            }
            else if(alfa<90||alfa>270)
            {
                if(a<0)
                    ctx.lineTo(-b/a,0);
                else if(a==0)
                    ctx.lineTo(SZEROKOSC, b);
                else
                    ctx.lineTo( (WYSOKOSC-b)/a,WYSOKOSC);
            }
            else{
                if(a>0)
                    ctx.lineTo(-b/a,0);
                else if(a==0)
                    ctx.lineTo(0, b);
                else
                    ctx.lineTo( (WYSOKOSC-b)/a,WYSOKOSC);
            }
            ctx.stroke();
            break;
        }

        ctx.lineTo(obiektyOptyczne[min_id].wspx, obiektyOptyczne[min_id].P);
        xo = obiektyOptyczne[min_id].wspx;

        b_pomo = WYSOKOSC/2 - a*(obiektyOptyczne[min_id].wspx - obiektyOptyczne[min_id].F);
        y_pomo = a*obiektyOptyczne[min_id].wspx + b_pomo;

        a = (y_pomo-obiektyOptyczne[min_id].P)/((obiektyOptyczne[min_id].wspx + obiektyOptyczne[min_id].F)-xo);
        b = y_pomo-a*(obiektyOptyczne[min_id].wspx + obiektyOptyczne[min_id].F);

    }
}

/// Funckje rysowania

function rysuj_soczS(id){
    if (!os_Optyczna[id]) return;
    ctx.beginPath();
    ctx.lineWidth=2;
    ctx.moveTo(os_Optyczna[id].wspx,WYSOKOSC/2-os_Optyczna[id].h);
    ctx.lineTo(os_Optyczna[id].wspx-10,WYSOKOSC/2-os_Optyczna[id].h+10)
    ctx.moveTo(os_Optyczna[id].wspx,WYSOKOSC/2-os_Optyczna[id].h);
    ctx.lineTo(os_Optyczna[id].wspx+10,WYSOKOSC/2-os_Optyczna[id].h+10)
    ctx.moveTo(os_Optyczna[id].wspx,WYSOKOSC/2-os_Optyczna[id].h)
    ctx.lineTo(os_Optyczna[id].wspx, WYSOKOSC/2+ os_Optyczna[id].h);
    ctx.lineTo(os_Optyczna[id].wspx-10,WYSOKOSC/2+os_Optyczna[id].h-10)
    ctx.moveTo(os_Optyczna[id].wspx,WYSOKOSC/2+os_Optyczna[id].h);
    ctx.lineTo(os_Optyczna[id].wspx+10,WYSOKOSC/2+os_Optyczna[id].h-10)
    ctx.stroke();
}

function rysuj_promS(id){
    if (!os_Optyczna[id]) return;
    ctx.beginPath();
    ctx.lineWidth=2;
    let dl = 30;
    ctx.moveTo(os_Optyczna[id].wspx, os_Optyczna[id].wspy);
    ctx.arc(os_Optyczna[id].wspx, os_Optyczna[id].wspy, 2, 0, Math.PI * 2, true);
    ctx.fill();
    ctx.moveTo(os_Optyczna[id].wspx, os_Optyczna[id].wspy);

    ctx.lineTo(os_Optyczna[id].wspx +dl*Math.cos(os_Optyczna[id].alfa*Math.PI/180), os_Optyczna[id].wspy - dl*Math.sin(os_Optyczna[id].alfa*Math.PI/180));
    ctx.stroke();
}

function rysuj_os(){
    ctx.beginPath();
    ctx.lineWidth=3;
    ctx.moveTo(0,WYSOKOSC/2);
    ctx.lineTo(SZEROKOSC, WYSOKOSC/2);
    ctx.stroke();
}

function rysuj_obiekty(){
    zaladujOs();
    for(let i=0;i<os_Optyczna.length; i++)
        {
            if(os_Optyczna[i].typ=='SoczS')
            {
                rysuj_soczS(i);
            }
            else if(os_Optyczna[i].typ=='PromS')
            {
                rysuj_promS(i);
            }
        }
}

function rysujObiektyPomocnicze(){
    zaladujGrid();
    zaladujOgniskowe();
    if(pokazOgniskowe==1)
    {
        rysujOgniskowe();
    }
    if(pokazGrid==1)
    {
        rysujGrid();
    }
    return;
}

function rysujGrid(){
    let odl=j;
    ctx.beginPath();
    while(odl<=SZEROKOSC){
        ctx.moveTo(odl,WYSOKOSC/2);
        if(odl%100==0)
        {
            ctx.lineWidth=2;
            ctx.moveTo(odl,WYSOKOSC/2+7.5);
            ctx.lineTo(odl,WYSOKOSC/2-7.5);
            ctx.font = "10px Arial";
            ctx.fillText(`${odl}`,odl,WYSOKOSC/2+7.5+15);
        }
        else{
            ctx.lineWidth=1;
            ctx.moveTo(odl,WYSOKOSC/2+3.75);
            ctx.lineTo(odl,WYSOKOSC/2-3.75);
            ctx.font = "8px Arial";
            ctx.fillText(`${odl}`,odl,WYSOKOSC/2+7.5+12);
        }
        odl+=50;
    }
    odl=j;
    while(odl<=WYSOKOSC){
        ctx.moveTo(0,odl);
        if(odl%100==0)
        {
            ctx.lineWidth=2;
            ctx.lineTo(7.5,odl);
            ctx.font = "10px Arial";
            ctx.fillText(`${odl}`,7.5+15,odl);
        }
        else{
            ctx.lineWidth=1;
            ctx.lineTo(3.75,odl);
            ctx.font = "8px Arial";
            ctx.fillText(`${odl}`,3.75+12,odl);
        }
        odl+=50;
    }
    ctx.stroke();
}

function rysujOgniskowe(){
    zaladujOs();
    ctx.beginPath();
    ctx.lineWidth=3;
    ctx.font = "15px Arial bold";
    for(let i=0;i<os_Optyczna.length;i++){
        if(os_Optyczna[i].typ=="PromS") continue;
        ctx.moveTo(os_Optyczna[i].wspx-os_Optyczna[i].F, WYSOKOSC/2-10);
        ctx.lineTo(os_Optyczna[i].wspx-os_Optyczna[i].F, WYSOKOSC/2+10);
        ctx.fillText(`F${os_Optyczna[i].nazwa}`,os_Optyczna[i].wspx-os_Optyczna[i].F, WYSOKOSC/2+10+25);
        ctx.moveTo(os_Optyczna[i].wspx+os_Optyczna[i].F, WYSOKOSC/2-10);
        ctx.lineTo(os_Optyczna[i].wspx+os_Optyczna[i].F, WYSOKOSC/2+10);
        ctx.fillText(`F${os_Optyczna[i].nazwa}`,os_Optyczna[i].wspx+os_Optyczna[i].F, WYSOKOSC/2+10+25);
    }
    ctx.stroke();
}

function rysujElementyKontrolne(id){
    zaladujOs();
    if(os_Optyczna[id].typ=="PromS"){
        rysujElementyKontrolnePromienia(id);
    }
    else{
        rysujElementyKontrolneSoczewki(id);
    }
}

function rysujElementyKontrolnePromienia(id){

}

function rysujElementyKontrolneSoczewki(id){
    let wsp = os_Optyczna[id].wspx;
    ctx.beginPath();
    ctx.lineWidth=3;
    ctx.arc(wsp+30, WYSOKOSC/2-30, 10, 0, 360);
    ctx.fill();
    ctx.stroke();
}

/// Funkcje obsługi wstążek

function wyswietlWstazke(wstazka){
    zaladujAktualneId();
    if(id_Obiektu!=-1){
        zaladujWstazkeWlasciwosci();
    }
    if(wstazka=="SYMULACJA")
    {
        document.getElementById('Opcja-symulacji').style.boxShadow = "0px 0px 2px 0px black inset";
        document.getElementById('Opcja-tworzenia').style.boxShadow = "";
        zaladujSymulacje();
    }
    else if(wstazka=="TWORZENIE")
    {
        document.getElementById('Opcja-tworzenia').style.boxShadow = "0px 0px 2px 0px black inset";
        document.getElementById('Opcja-symulacji').style.boxShadow = "";
        zaladujTworzenie();
    }
    else{
        zaladujWlasciwosci(id_Obiektu);
    }
}

function dodawanieEventListener(){
    document.getElementById('Opcja-symulacji').addEventListener('click', function() {
        wstazka = "SYMULACJA";
        localStorage.setItem('wstazka', wstazka);
        wyswietlWstazke(wstazka);
    });
    
    document.getElementById('Opcja-tworzenia').addEventListener('click', function() {
        wstazka = "TWORZENIE";
        localStorage.setItem('wstazka', wstazka);
        wyswietlWstazke(wstazka);
    });
}

/// Funckje obsługi Symulacji

function zaladujSymulacje(){
    zaladujN1();
    let Symulacja = `<div class="sterowanie" id="sterowanie">
                        <div class="kontener-przyciskow">
                            <button class="uruchom" id="uruchom"> <img src="img/uruchom.png" width="100%" height="100%"> <span class="span-przycisk">Uruchom</span></button> 
                            <button class="reset" id="reset"><img src="img/reset.png" width="100%" height="100%"> <span  class="span-przycisk">Reset</span></button> 
                            <button class="wyczysc" id="wyczysc"><img src="img/wyczysc.png" width="100%" height="100%"> <span  class="span-przycisk">Wyczyść</span></button>
                        </div>
                        <span>Sterowanie</span>
                    </div>
                    <div class="pokazywanie">
                         <div class="kontener-przyciskow">
                            <button class="pokaz-ogniskowe" id="pokaz-ogniskowe"> <img id="pokaz-ogniskowe-img" src="img/pokaz-ogniskowe.png" width="100%" height="100%"> <span  class="span-przycisk" id="pokaz-ogniskowe-span"></span></button>
                            <button class="pokaz-grid" id="pokaz-grid">  <img id="pokaz-grid-img" src="img/pokaz-grid.png" width="100%" height="100%"> <span  class="span-przycisk" id="pokaz-grid-span"></span></button>
                        </div>
                        <span>Widok</span>
                    </div>
                    <div class="material">
                        <form class="osrodek">
                            <label for="N1">N1:</label>
                            <input type="text" id="N1" placeholder="podaj N1:" value="${N1}">
                        </form>
                        <span>Ośrodek</span>
                    </div>
                    <div class="lista-obiektow" id="lista-obiektow">

                    </div>`;

    kontener.innerHTML=Symulacja;
    document.getElementById('lista-obiektow').innerHTML='';
    zaladujOs();
    for(let i=0;i<os_Optyczna.length;i++)
    {
        dodajPrzycisk(i);
    }

    if(pokazGrid==1)
    {
        document.getElementById('pokaz-grid-img').src = "img/schowaj-grid.png";
        document.getElementById('pokaz-grid-span').innerText = "Schowaj siatkę";
    }
    else if(pokazGrid==0)
    {
        document.getElementById('pokaz-grid-img').src = "img/pokaz-grid.png";
        document.getElementById('pokaz-grid-span').innerText = "Pokaż siatkę";
    }
    zaladujOgniskowe();
    if(pokazOgniskowe==1)
    {
        document.getElementById('pokaz-ogniskowe-img').src = "img/schowaj-ogniskowe.png";
        document.getElementById('pokaz-ogniskowe-span').innerText = "Schowaj ogniskowe";
    }
    else if(pokazOgniskowe==0)
    {
        document.getElementById('pokaz-ogniskowe-img').src = "img/pokaz-ogniskowe.png";
        document.getElementById('pokaz-ogniskowe-span').innerText = "Pokaż ogniskowe";
    }

    document.getElementById('wyczysc').addEventListener('click', function(){
        wyczysc();
    });

    document.getElementById('pokaz-ogniskowe').addEventListener('click', function(){
        zaladujOgniskowe();
        if(pokazOgniskowe==1)
        {
            document.getElementById('pokaz-ogniskowe-img').src = "img/pokaz-ogniskowe.png";
            document.getElementById('pokaz-ogniskowe-span').innerText = "Pokaż ogniskowe";
            pokazOgniskowe = 0;
        }
        else if(pokazOgniskowe==0)
        {
                document.getElementById('pokaz-ogniskowe-img').src = "img/schowaj-ogniskowe.png";
                document.getElementById('pokaz-ogniskowe-span').innerText = "Schowaj ogniskowe";
                pokazOgniskowe=1;
        }
        localStorage.setItem('pokazOgniskowe', pokazOgniskowe);
        rysuj();
    });

    document.getElementById('pokaz-grid').addEventListener('click', function(){
        zaladujGrid();
        if(pokazGrid==1)
        {
            document.getElementById('pokaz-grid-img').src = "img/pokaz-grid.png";
            document.getElementById('pokaz-grid-span').innerText = "Pokaż siatkę";
            pokazGrid = 0;
        }
        else if(pokazGrid==0)
        {
            document.getElementById('pokaz-grid-img').src = "img/schowaj-grid.png";
            document.getElementById('pokaz-grid-span').innerText = "Schowaj siatkę";
            pokazGrid=1;
        }
        localStorage.setItem('pokazGrid', pokazGrid);
        rysuj();
    });

    document.getElementById('uruchom').addEventListener('click', function(){
        uruchomSymulacje();
    });

    document.getElementById('reset').addEventListener('click', function(){
        rysuj();
    });

    document.getElementById('N1').addEventListener('input', function(){
        localStorage.setItem('N1', parseFloat(this.value) || 0);
    });
}

function wyczysc(){
    os_Optyczna=[];
    localStorage.setItem('os_Optyczna', JSON.stringify(os_Optyczna));
    localStorage.setItem('id_Obiektu', -1);
    location.reload();
    rysuj();
}

function dodajPrzycisk(id){
    let przycisk = document.createElement("button");
    przycisk.innerText = `${id} : ${os_Optyczna[id].nazwa}`;
    przycisk.classList.add("przyciskObiektu");

    przycisk.onclick = function(){
        localStorage.setItem('id_Obiektu', id);
        wyswietlWlasciwosci(id);
    }
    document.getElementById('lista-obiektow').appendChild(przycisk);
}

/// Funkcje obsługi Tworzenia

function zaladujTworzenie(){
    kontener.innerHTML= Tworzenie;
    document.getElementById('skupiajaca').addEventListener('click', function(){
        zaktualizujOs(soczewkaSkupiajaca);
    });
    
    document.getElementById('promien-swietlny').addEventListener('click', function(){
        zaktualizujOs(promienSwietlny);
    });
}

function zaktualizujOs(obiekt){
    obiekt.id = os_Optyczna.length;
    localStorage.setItem('id_Obiektu', obiekt.id)
    os_Optyczna.push(obiekt);

    localStorage.setItem('os_Optyczna', JSON.stringify(os_Optyczna));
    wyswietlWlasciwosci(os_Optyczna.length-1);
    rysuj();
}

/// Funkcje obsługi Właściwości

function zaladujWstazkeWlasciwosci(){
    if(!document.getElementById('Opcja-wlasciwosci'))
    {
        const wlasciwosci = document.createElement("div");
        wlasciwosci.className = "Opcja-wlasciwosci";
        wlasciwosci.id = "Opcja-wlasciwosci";
        const p = document.createElement("p");
        const tekst = document.createTextNode("WŁAŚCIWOŚCI");
        p.appendChild(tekst);
        wlasciwosci.appendChild(p);
        document.getElementById('pasek_rodzaji').appendChild(wlasciwosci);
        document.getElementById('Opcja-symulacji').style.boxShadow = "";
        document.getElementById('Opcja-tworzenia').style.boxShadow = "";

        document.getElementById('Opcja-wlasciwosci').addEventListener('click', function() {
            zaladujAktualneId();
            wyswietlWlasciwosci(id_Obiektu);
        });
    }
}

function usunWstazkeWlasciwosci(){
    if(document.getElementById('Opcja-wlasciwosci'))
    {
        document.getElementById('Opcja-wlasciwosci').remove();
    }
}

function wyswietlWlasciwosci(id){
    zaladujWstazkeWlasciwosci();
    wstazka = "WŁAŚCIWOŚCI";
    localStorage.setItem('wstazka', wstazka);
    document.getElementById('Opcja-symulacji').style.boxShadow = "";
    document.getElementById('Opcja-tworzenia').style.boxShadow = "";
    zaladujWlasciwosci(id);
}

function zaladujWlasciwosci(id){
    if(os_Optyczna[id].typ =="SoczS")
    {
        zaladujWlasciwosciSoczewki(id);
    }
    else if(os_Optyczna[id].typ =="PromS")
    {
        zaladujWlasciwosciPromienia(id);
    }
}

function zaladujWlasciwosciSoczewki(id){
    kontener.innerHTML=`<div class="dane">
                        <div class="kontener-przyciskow">
                        <div class='nazwa'>
                            <form>  
                                <label for='nazwa'>Nazwa: </label>
                                <input type='text' id='nazwa' placeholder='podaj nazwę:' value=${os_Optyczna[id].nazwa}>
                            </form>
                        </div>
                        <div class="wspx">
                            <form>
                                <label for='wspx'>Współrzędne: </label>
                                <input type='text' id='wspx' placeholder='podaj wspx:' value=${os_Optyczna[id].wspx}>
                            </form>
                        </div>
                        <div class ="h">
                            <form>
                                <label for='h'>Wysokość soczewki: </label>
                                <input type='text' id='h' placeholder='podaj h:' value=${os_Optyczna[id].h}
                            </form>
                        </div>
                        <div class='optyka' id='optyka'>
                            <form>
                                <label for='F'>F: </label>
                                <input type='text'' id='F' placeholder='podaj F:' value=${os_Optyczna[id].F}>
                            </form>
                        </div>
                        </div>
                        <span>Właściwości</span>
                        </div>
                        <div class='dod_przyciski' id='dod_przyciski'>
                            <div class="kontener-przyciskow">
                                <button class="F-zaawansowane" id="F-zaawansowane"><img height=100% width=100% src="img/zaawansowane.png"><span>Zaawansowane</span></button>
                                <button class="usun" id="usun"><img height=100% width=100% src="img/usun.png"><span>Usuń</span></button>
                            </div>
                            <span>Zaawansowane</span>
                        </div>`;
    dodawanieEventListener();
    EventSoczS(id);
}

function zaladujWlasciwosciPromienia(id){
    kontener.innerHTML=`<div class="dane">
                        <div class="kontener-przyciskow">
                        <div class='nazwa'>
                            <form>  
                                <label for='nazwa'>Nazwa: </label>
                                <input type='text' id='nazwa' placeholder='podaj nazwę:' value=${os_Optyczna[id].nazwa}>
                            </form>
                        </div>
                        <div class="wspx">
                            <form>
                                <label for='wspx'>Współrzędne x: </label>
                                <input type='text' id='wspx' placeholder='podaj wspx:' value=${os_Optyczna[id].wspx}>
                            </form>
                        </div>
                        <div class ="h">
                            <form>
                                <label for='wspy'>Współrzędne y: </label>
                                <input type='text' id='wspy' placeholder='podaj wspy:' value=${os_Optyczna[id].wspy}>
                            </form>
                        </div>
                        <div class='optyka' id='optyka'>
                            <form>
                                <label for='alfa'>alfa: </label>
                                <input type='text'' id='alfa' placeholder='podaj alfa:' value=${os_Optyczna[id].alfa}>
                            </form>
                        </div>
                        </div>
                        <span>Właściwości</span>
                        </div>
                        <div class='dod_przyciski' id='dod_przyciski'>
                            <div class="kontener-przyciskow">
                                <button class="usun" id="usun"><img height=100% width=100% src="img/usun.png"><span>Usuń</span></button>
                            </div>
                            <span>Usuwanie</span>
                        </div>`;
    dodawanieEventListener();
    EventPromS(id);
}

function EventSoczS(id){

    document.getElementById('nazwa').addEventListener("input", function(){
        os_Optyczna[id].nazwa = this.value;
        localStorage.setItem('os_Optyczna', JSON.stringify(os_Optyczna));
        rysuj();
    });

    document.getElementById('wspx').addEventListener("input", function(){
        os_Optyczna[id].wspx = parseFloat(this.value) || 0;
        localStorage.setItem('os_Optyczna', JSON.stringify(os_Optyczna));
        rysuj();
    });

    document.getElementById('h').addEventListener("input", function(){
        os_Optyczna[id].h = parseFloat(this.value) || 0;
        localStorage.setItem('os_Optyczna', JSON.stringify(os_Optyczna));
        rysuj();
    });

    document.getElementById('F').addEventListener("input", function(){
        os_Optyczna[id].F = parseFloat(this.value) || 0;
        localStorage.setItem('os_Optyczna', JSON.stringify(os_Optyczna));
        rysuj();
    });

    document.getElementById('usun').addEventListener("click", function(){
        wstazka = "SYMULACJA";
        localStorage.setItem('wstazka', wstazka);
        wyswietlWstazke(wstazka);
        os_Optyczna.splice(id, 1);
        localStorage.setItem('os_Optyczna', JSON.stringify(os_Optyczna));
        odswiez_os_optyczna();
        localStorage.setItem('id_Obiektu', -1);
        location.reload();
        rysuj();
    });

    document.getElementById('F-zaawansowane').addEventListener("click", function(){
        document.getElementById('okno-zaawansowane').style.display = "block";
    });
}

function EventPromS(id){

    document.getElementById('nazwa').addEventListener("input", function(){
        os_Optyczna[id].nazwa = this.value;
        localStorage.setItem('os_Optyczna', JSON.stringify(os_Optyczna));
        rysuj();
    });

    document.getElementById('wspx').addEventListener("input", function(){
        os_Optyczna[id].wspx = parseFloat(this.value) || 0;
        localStorage.setItem('os_Optyczna', JSON.stringify(os_Optyczna));
        rysuj();
    });

    document.getElementById('wspy').addEventListener("input", function(){
        os_Optyczna[id].wspy = parseFloat(this.value) || 0;
        localStorage.setItem('os_Optyczna', JSON.stringify(os_Optyczna));
        rysuj();
    });

    document.getElementById('alfa').addEventListener("input", function(){
        os_Optyczna[id].alfa = parseFloat(this.value) || 0;
        localStorage.setItem('os_Optyczna', JSON.stringify(os_Optyczna));
        rysuj();
    });

    document.getElementById('usun').addEventListener("click", function(){
        wstazka = "SYMULACJA";
        localStorage.setItem('wstazka', wstazka);
        wyswietlWstazke(wstazka);
        os_Optyczna.splice(id, 1);
        localStorage.setItem('os_Optyczna', JSON.stringify(os_Optyczna));
        odswiez_os_optyczna();
        localStorage.setItem('id_Obiektu', -1);
        location.reload();
        rysuj();
    });
}

document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") {
        document.getElementById('okno-zaawansowane').style.display = "none";
        this.location.reload();
    }
});


document.getElementById('zamknij').addEventListener('click', function(){
    zaladujAktualneId();
    zaladujN1();
    let R1 = parseFloat(document.getElementById('R1').value) || 0;
    let R2 = parseFloat(document.getElementById('R2').value) || 0;
    let Ns = parseFloat(document.getElementById('Ns').value) || 0;
    os_Optyczna[id_Obiektu].F = 1/(((1/R1)+(1/R2))*((Ns/N1)-1));
    localStorage.setItem('os_Optyczna', JSON.stringify(os_Optyczna));
    document.getElementById('okno-zaawansowane').style.display = "none";
    location.reload();
});

// Klikanie

function sprawdzWspolrzedne(x, y){
    let cosZadzialo = 0;
    zaladujOs();
    zaladujAktualneId();
    for(let i=0;i<os_Optyczna.length;i++){
        if(czykliknal(x, y, i)){
            wyswietlWlasciwosci(i);
            //rysujElementyKontrolne(i);
            localStorage.setItem('id_Obiektu', i);
            cosZadzialo=1;
            break;
        }
    }

    if(cosZadzialo==0){
            localStorage.setItem('id_Obiektu', -1);
            wstazka = "SYMULACJA";
            localStorage.setItem('wstazka', wstazka);
            document.getElementById('Opcja-symulacji').style.boxShadow = "0px 0px 2px 0px black inset";
            document.getElementById('Opcja-tworzenia').style.boxShadow = "";
            zaladujSymulacje();
            location.reload();
    }
}

function czykliknal(x, y, i){
    if(os_Optyczna[i].typ=="PromS"){
        return czykliknalPromien(x, y, i);
    }
    else{
        return czykliknalSoczewke(x, y, i);
    }
}

function czykliknalSoczewke(x, y, i){
    if(os_Optyczna[i].wspx-x<-1*margines||os_Optyczna[i].wspx-x>margines)   return false;
    if(y>os_Optyczna[i].h+WYSOKOSC/2+margines||y<-1*os_Optyczna[i].h+WYSOKOSC/2-margines)   return false;
    return true;
}

function czykliknalPromien(x, y, i){
    if(os_Optyczna[i].wspx-x<-1*margines||os_Optyczna[i].wspx-x>margines)   return false;
    if(os_Optyczna[i].wspy-y<-1*margines||os_Optyczna[i].wspy-y>margines)   return false;
    return true;
}


///


