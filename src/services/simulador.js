import { ref, set, update } from "firebase/database";
import { db } from "./firebase";

// Genera los 80 espacios iniciales
export const inicializarParqueadero = async () => {
  const espacios = {};
  
  for (let col = 1; col <= 4; col++) {
    for (let num = 1; num <= 20; num++) {
      const id = `ESP-C0${col}-${num.toString().padStart(2, '0')}`;
      const distancia = Math.random() * 150; // Distancia aleatoria entre 0 y 150 cm
      const estado = distancia <= 50 ? 'ocupado' : 'libre';
      
      espacios[id] = {
        id,
        columna: col,
        numero: num,
        distanciaDetectada: parseFloat(distancia.toFixed(1)),
        estado,
        fechaHora: Date.now(),
        ubicacion: {
          nombre: "Parqueadero UTEQ",
          // Coordenadas base (se pueden ajustar por celda matemáticamente luego)
          latitud: -1.012270, 
          longitud: -79.468280,
          boundingBox: { norte: -1.012261, sur: -1.012570, oeste: -79.468299, este: -79.467462 }
        }
      };
    }
  }
  
  // Sube el bloque completo a Firebase
  await set(ref(db, 'espacios'), espacios);
  console.log("80 espacios inicializados en RTDB");
};

// Simula cambios aleatorios cada cierto tiempo
export const iniciarSimulacion = () => {
  setInterval(() => {
    // Elegimos una columna y un número al azar para actualizar
    const colAleatoria = Math.floor(Math.random() * 4) + 1;
    const numAleatorio = Math.floor(Math.random() * 20) + 1;
    const id = `ESP-C0${colAleatoria}-${numAleatorio.toString().padStart(2, '0')}`;
    
    const nuevaDistancia = Math.random() * 150;
    const nuevoEstado = nuevaDistancia <= 50 ? 'ocupado' : 'libre';
    const timestamp = Date.now();

    const updates = {};
    // Actualizamos el estado actual
    updates[`espacios/${id}/distanciaDetectada`] = parseFloat(nuevaDistancia.toFixed(1));
    updates[`espacios/${id}/estado`] = nuevoEstado;
    updates[`espacios/${id}/fechaHora`] = timestamp;
    
    // Guardamos en el historial
    updates[`historial/${id}/${timestamp}`] = {
      distanciaDetectada: parseFloat(nuevaDistancia.toFixed(1)),
      estado: nuevoEstado,
      fechaHora: timestamp
    };

    update(ref(db), updates);
  }, 5000); // Cambia un sensor cada 5 segundos
};