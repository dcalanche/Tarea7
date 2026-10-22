let db;
const dbName = "RestauranteDB";
const storeName = "reservas";

// Inicializar IndexedDB
const request = indexedDB.open(dbName, 1);

request.onupgradeneeded = (event) => {
    db = event.target.result;
    if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
    }
};

request.onsuccess = (event) => {
    db = event.target.result;
    document.getElementById("estado-db").textContent = "Base de datos lista";
};

request.onerror = (event) => {
    console.error("Error al abrir IndexedDB:", event.target.error);
    document.getElementById("estado-db").textContent = "Error al conectar DB";
};

// Guardar reserva
document.getElementById("reserva-form").addEventListener("submit", (e) => {
    e.preventDefault();
    
    const nuevaReserva = {
        nombre: document.getElementById("nombre").value,
        personas: document.getElementById("personas").value,
        fecha: document.getElementById("fecha").value
    };

    const transaction = db.transaction([storeName], "readwrite");
    const store = transaction.objectStore(storeName);
    const requestAdd = store.add(nuevaReserva);

    requestAdd.onsuccess = () => {
        alert("¡Reserva guardada con éxito!");
        document.getElementById("reserva-form").reset();
    };
});

// Botón Mostrar Datos
document.getElementById("btn-mostrar").addEventListener("click", () => {
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
                <strong>Personas:</strong> ${res.personas}<br>
                <strong>Fecha/Hora:</strong> ${new Date(res.fecha).toLocaleString()}
            `;
            contenedor.appendChild(item);
        });
    };
});

// Botón Limpiar
document.getElementById("btn-limpiar").addEventListener("click", () => {
    if (confirm("¿Está seguro de que desea eliminar todas las reservas?")) {
        const transaction = db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const requestClear = store.clear();

        requestClear.onsuccess = () => {
            document.getElementById("lista-reservas").innerHTML = "";
            alert("Todas las reservas han sido eliminadas.");
        };
    }
});