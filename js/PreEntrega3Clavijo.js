//  Variables
let listOfBookings = [];                            //  Reservas existentes                                                   
let listOfSlots = [];                               //  Espacios para playrooms existentes

const SYS_DATE = new Date();                        //  Fecha del sistema
const DATE_FORMAT = {                               //  Formato para fechas
    weekday: 'long', 
    day: 'numeric', 
    month: 'long'};

let bookingForm =                                   //  Formulario para reservas
    document.getElementById('booking-form');
bookingForm.addEventListener("submit", validateBookingForm);

const filledTextInput =                             //  Control de campos de texto
    (input) => input.value.trim() !== "";

//  Clases
class BookingSlot{
    constructor(id, room, date, hour){
        this.id = id;
        this.room = room;
        this.date = new Date(date);
        this.hour = hour;
        this.isVacant = true;
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
                <label for="${this.id}">ID: ${this.id}Playroom ${this.room} ${this.date.toLocaleDateString("es-ES", DATE_FORMAT)} ${this.hour} (2 horas)</label>
            `;
            //  Añadir
            container.appendChild(slot);
        }
    }
}

class ClientBooking{
    constructor(firstName, lastName, phoneNumber, EMail, quantity, comments, playroom){
        this.bookID = "PLR-" + (listOfBookings.length + 1);
        this.bookQuantity = quantity;
        this.bookPlayroom = playroom;
        this.bookComments = comments;
        this.clientName = firstName + " " + lastName;
        this.clientPhone = phoneNumber;
        this.clientEMail = EMail;
    }
    showBooking(){
        let msg = "Datos reserva:\n";
        msg += `\n    ID:               ${this.bookID}`;
        msg += `\n    Cantidad:         ${this.bookQuantity}`;
        msg += `\n    Playroom:         ${this.bookPlayroom}`;
        msg += `\n    Comentarios:      ${this.bookComments}`;
        msg += `\n    Cliente:          ${this.clientName}`;
        msg += `\n    Teléfono:         ${this.clientPhone}`;
        msg += `\n    Correo:           ${this.clientEMail}`;
        alert(msg);
    }
}


//  Funciones
function loadPage(){
    syncData("load");
    //  Mostrar Slots en pantalla
    for(const slot of listOfSlots){
        //alert("Mostrando...");
        slot.drawSlot();
    }
}

function loadFromStorage(key, location){
    let result = true;
    let ob;
    //  Recuperar datos
    const toLoad = JSON.parse(localStorage.getItem(key));
    alert("Cargar "+ key + " " + toLoad);  //  BORRAR
    //  Crear objetos según datos
    switch(location){
        case "Slots":
            //
            ob = new BookingSlot(...Object.values(data));
            break;
        case "Bookings":
            //
            ob = new ClientBooking(...Object.values(data));
            break;
    }
    //  Cargar datos
    toLoad !== null ? location = toLoad.map(data => ob) : result = false;
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
    let slotsLoaded;    //  La primera vez se necesita
    while(run){
        //  Opciones
        switch(option){
            case "check":
                //  Verificar si existen Slots
                slotsLoaded ? run = false : option = "create";
                //(!slotsLoaded) && (option = "create");
                break;
            case "create":
                //  Crear Slots
                slotsGenerator();
                option = "save";
                break;
            case "load":
                //  Cargar datos
                slotsLoaded = loadFromStorage("Slots", listOfSlots);
                loadFromStorage("Bookings", listOfBookings);
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
}   //  fin syncData()

function validateBookingForm(){   //  Cambiar nombre
    //  Sincronizar datos
    loadPage();

    //  Variables
    let save = true;
    let check = 1;

    //  Elementos
    const firstName = document.getElementById('cliFirstName');
    const lastName = document.getElementById('cliLastName');
    const phoneNumber = document.getElementById('cliPhoneNumber');
    const EMail = document.getElementById('cliEMail');
    const quantity = document.querySelector('#infQuantity option:checked');
    const comments = document.getElementById('infComments');
    const playroom = document.querySelector('input[name="playrooms"]:checked');
    //  Validar completitud de campos obligatorios
    do{
        switch(check){
            case 1:
                save = filledTextInput(firstName);
                break;
            case 2:
                save = filledTextInput(lastName);
                break;
            case 3:
                save = filledTextInput(phoneNumber);
                break;
            case 4:
                save = filledTextInput(EMail);
                break;
            case 5:
                save = filledTextInput(quantity);
                break;
            case 6:
                save = filledTextInput(playroom);
                break;
        }
        check++;
    }
    while(save && check <= 6);

    //  Guardar si los campos obligatorios está llenos
    if(save){
        //  Guardar en la lista
        const bookData = new ClientBooking(
            firstName.value, 
            lastName.value, 
            phoneNumber.value, 
            EMail.value, 
            quantity.value, 
            comments.value, 
            playroom.value);
        listOfBookings.push(bookData);

        //  Cambiar disponibilidad
        listOfSlots[playroom - 1].isVacant = false;
        alert(listOfSlots[playroom - 1].isVacant);

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
                listOfSlots.push(new BookingSlot((listOfSlots.length + 1), "Café", d, hour));
                listOfSlots.push(new BookingSlot((listOfSlots.length + 1), "Crema", d, hour));
            }
        }
    }
}


//  EJECUCIÓN (Carga del sitio)
loadPage();
