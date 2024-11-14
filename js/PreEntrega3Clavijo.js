//  Variables
let listOfBookings = [];                                            //  Reservas existentes                                                   
let listOfSlots = [];                                               //  Espacios para playrooms existentes

const SYS_DATE = new Date();                                        //  Fecha del sistema
const DATE_FORMAT = {                                               //  Formato para fechas
    weekday: 'long', 
    day: 'numeric', 
    month: 'long'};

let bookingForm = document.getElementById('booking-form');          //  Formulario para reservas
bookingForm.addEventListener("submit", validateBookingForm);

const filledTextInput =                                             //  Control de campos de texto
    (input) => input.value.trim() !== "";

//  Clases
class BookingSlot{
    constructor(id, room, date, hour, vacancy){
        this.id = id;
        this.room = room;
        this.date = new Date(date);
        this.hour = hour;
        this.isVacant = vacancy;
    }
    //  Generar HTML con slot
    drawSlot(){
        //  Sólo si está vacante
        if(this.isVacant){
            //  Obtener contenedor
            let container = document.getElementById("form-playrooms");
            //  Crear elemento a añadir
            let slot = document.createElement("div");
            slot.className = 'room';
            //  Plantilla
            slot.innerHTML = `
                <input type="radio" id="${this.id}" name="playrooms" class="plrChoice" value="${this.id}">
                <label for="${this.id}">ID: ${this.id} Playroom ${this.room} ${this.date.toLocaleDateString("es-ES", DATE_FORMAT)} ${this.hour} (2 horas)</label>
            `;
            //  Añadir
            container.appendChild(slot);
        }
    }
}

class ClientBooking{
    constructor(firstName, lastName, phoneNumber, EMail, quantity, comments, playroom){
        this.bookID = listOfBookings.length + 1;
        this.bookQuantity = quantity;
        this.bookPlayroom = playroom;
        this.bookComments = comments;
        this.clientName = firstName + " " + lastName;
        this.clientPhone = phoneNumber;
        this.clientEMail = EMail;
    }
}


//  Funciones
function loadPage(){
    syncData("load");
    //  Mostrar Slots en pantalla
    for(const slot of listOfSlots){
        slot.drawSlot();
    }
}

function loadFromStorage(key){
    let result = true;
    //  Recuperar datos
    const toLoad = JSON.parse(localStorage.getItem(key));
    //  Cargar datos
    switch(key){
        case "Slots":
            toLoad !== null ? listOfSlots = toLoad.map(data => new BookingSlot(...Object.values(data))) : result = false;
            break;
        case "Bookings":
            toLoad !== null ? listOfBookings = toLoad.map(data => new ClientBooking(...Object.values(data))) : result = false;
            break;
    }
    return result;
}

function saveOnStorage(key, data){
    //  Convertir datos
    const toSave =  JSON.stringify(data);
    //  Guardar datos
    localStorage.setItem(key, toSave);
}

function  syncData(option){
    //  Control de ejecución
    let run = true;
    let slotsLoaded, booksLoaded;
    while(run){
        //  Opciones
        switch(option){
            case "check":
                //  Verificar si existen Slots
                slotsLoaded ? run = false : option = "create";
                break;
            case "create":
                //  Crear Slots
                slotsGenerator();
                option = "save";
                break;
            case "load":
                //  Cargar datos
                slotsLoaded = loadFromStorage("Slots");
                booksLoaded = loadFromStorage("Bookings");
                //  Verificación
                option = "check";
                break;
            case "save":
                //  Guardar datos
                saveOnStorage("Slots", listOfSlots);
                saveOnStorage("Bookings", listOfBookings);
                run = false;
                break;
        }
    }
}

function validateBookingForm(){
    //  Sincronizar datos
    loadPage();
    //  Variables
    let save = true;
    let check = 1;
    //  Elementos
    const elemFirstName = document.getElementById('cliFirstName');
    const elemLastName = document.getElementById('cliLastName');
    const elemPhoneNumber = document.getElementById('cliPhoneNumber');
    const elemEMail = document.getElementById('cliEMail');
    const elemQuantity = document.querySelector('#infQuantity option:checked');
    const elemComments = document.getElementById('infComments');
    const elemPlayroom = document.querySelector('input[name="playrooms"]:checked');
    //  Validar completitud de campos obligatorios
    do{
        switch(check){
            case 1:
                save = filledTextInput(elemFirstName);
                break;
            case 2:
                save = filledTextInput(elemLastName);
                break;
            case 3:
                save = filledTextInput(elemPhoneNumber);
                break;
            case 4:
                save = filledTextInput(elemEMail);
                break;
            case 5:
                save = filledTextInput(elemQuantity);
                break;
            case 6:
                save = filledTextInput(elemPlayroom);
                break;
        }
        check++;
    }
    while(save && check <= 6);
    //  Guardar si los campos obligatorios está llenos
    if(save){
        //  Datos
        let first = elemFirstName.value;
        let last = elemLastName.value;
        let phone = elemPhoneNumber.value;
        let mail = elemEMail.value;
        let quantity = elemQuantity.value;
        let comments = elemComments.value;
        let room = elemPlayroom.value;
        let bookToSave = new ClientBooking(first, last, phone, mail, quantity, comments, room);
        //  Listar
        listOfBookings.push(bookToSave);
        //  Cambiar disponibilidad
        listOfSlots[room - 1].isVacant = false;
        //  Guardar
        syncData("save");
    }
    save = false;
}

function slotsGenerator(){
    let hour;
    let limit = new Date(SYS_DATE);
    limit.setMonth(limit.getMonth() + 1);
    //  Generar fechas a un mes vista
    for(let d = SYS_DATE; d <= limit; d.setDate(d.getDate() + 1)){
        //  Generar fechas (viernes y sábados)
        if(d.getDay() >= 5){
            //  Generar dos horarios por fecha
            for(let h = 1; h <= 2; h++){
                switch(h){
                    case 1:
                        hour = "15:00";
                        break;
                    case 2:
                        hour = "17:00";
                        break;
                }
                //  Listar
                listOfSlots.push(new BookingSlot((listOfSlots.length + 1), "Café", d, hour, true));
                listOfSlots.push(new BookingSlot((listOfSlots.length + 1), "Crema", d, hour, true));
            }
        }
    }
}


//  EJECUCIÓN (Carga del sitio)
loadPage();
