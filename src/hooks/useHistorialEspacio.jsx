import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../services/firebase';

export const useHistorialEspacio = (id) => {
  const [espacio, setEspacio] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    // Referencias a los nodos de Firebase
    const espacioRef = ref(db, `espacios/${id}`);
    const historialRef = ref(db, `historial/${id}`);

    // Escuchar datos del espacio actual
    const unsubscribeEspacio = onValue(espacioRef, (snapshot) => {
      setEspacio(snapshot.val());
    });

    // Escuchar el historial y ordenarlo del más reciente al más antiguo
    const unsubscribeHistorial = onValue(historialRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const arregloHistorial = Object.values(data).sort((a, b) => b.fechaHora - a.fechaHora);
        setHistorial(arregloHistorial);
      } else {
        setHistorial([]);
      }
      setLoading(false);
    });

    // Limpiar suscripciones al salir de la página
    return () => {
      unsubscribeEspacio();
      unsubscribeHistorial();
    };
  }, [id]);

  return { espacio, historial, loading };
};