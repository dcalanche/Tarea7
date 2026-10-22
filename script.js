let db;
const dbName = "RestauranteDB";
const storeName = "reservas";

// 1. Inicializar la base de datos IndexedDB
const request = indexedDB.open(dbName, 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
    document.getElementById("estado-db").textContent = "Conectada correctamente";
};

request.onerror = (event) => {
    console.error("Error al abrir IndexedDB:", event.target.error);
    document.getElementById("estado-db").textContent = "Error de conexión";
};

// 2. Guardar o actualizar datos
document.getElementById("reserva-form").addEventListener("submit", (e) => {
    e.preventDefault();
    
    const id = document.getElementById("id-reserva").value;
    const datosReserva = {
        nombre: document.getElementById("nombre").value,
        area: document.getElementById("area").value,
        personas: document.getElementById("personas").value,
        fecha: document.getElementById("fecha").value
    };

    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);

    if (id) {
        // Si hay un ID guardado, actualizamos usando .put()
        datosReserva.id = Number(id);
        store.put(datosReserva).onsuccess = () => {
            alert("Reserva actualizada correctamente");
            resetearFormulario();
            mostrarDatos();
        };
    } else {
        // Si no hay ID, insertamos usando .add()
        store.add(datosReserva).onsuccess = () => {
            alert("¡Reserva guardada con éxito!");
            resetearFormulario();
            mostrarDatos();
        };
    }
});

// 3. Mostrar los registros guardados en IndexedDB
function mostrarDatos() {
    const contenedor = document.getElementById("lista-reservas");
    contenedor.innerHTML = "";

    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const requestGetAll = store.getAll();

    requestGetAll.onsuccess = () => {
        const reservas = requestGetAll.result;
        if (reservas.length === 0) {
            contenedor.innerHTML = "<p>No hay reservas registradas.</p>";
            return;
        }

        reservas.forEach((res) => {
            const item = document.createElement("div");
            item.className = "reserva-item";
            item.innerHTML = `
                <strong>Cliente:</strong> ${res.nombre}<br>
                <strong>Área / Mesa:</strong> ${res.area || 'No asignada'}<br>
                <strong>Personas:</strong> ${res.personas}<br>
                <strong>Fecha y Hora:</strong> ${new Date(res.fecha).toLocaleString()}<br>
                <div style="margin-top: 10px;">
                    <button onclick="prepararEdicion(${res.id})" class="btn secondary" style="padding: 4px 12px; font-size: 0.85rem;">Editar</button>
                </div>
            `;
            contenedor.appendChild(item);
        });
    };
}

document.getElementById("btn-mostrar").addEventListener("click", mostrarDatos);

// 4. Cargar datos de la reserva elegida en el formulario para editar
function prepararEdicion(id) {
    const transaction = db.transaction([storeName], "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => {
        const res = request.result;
        if (res) {
            document.getElementById("id-reserva").value = res.id;
            document.getElementById("nombre").value = res.nombre;
            document.getElementById("area").value = res.area || "";
            document.getElementById("personas").value = res.personas;
            document.getElementById("fecha").value = res.fecha;

            document.getElementById("btn-guardar").textContent = "Actualizar Reserva";
            document.getElementById("btn-cancelar").style.display = "inline-block";
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };
}

// Botón de cancelar la edición en progreso
document.getElementById("btn-cancelar").addEventListener("click", resetearFormulario);

// 5. Restablecer el formulario
function resetearFormulario() {
    document.getElementById("reserva-form").reset();
    document.getElementById("id-reserva").value = "";
    document.getElementById("btn-guardar").textContent = "Guardar Reserva";
    document.getElementById("btn-cancelar").style.display = "none";
}

// 6. Limpiar todos los datos de IndexedDB
document.getElementById("btn-limpiar").addEventListener("click", () => {
    if (confirm("¿Está seguro de que desea borrar TODAS las reservas?")) {
        const transaction = db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        
        store.clear().onsuccess = () => {
            document.getElementById("lista-reservas").innerHTML = "";
            resetearFormulario();
            alert("Se han borrado todas las reservas.");
        };
    }
});