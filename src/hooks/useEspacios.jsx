import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../services/firebase';

export const useEspacios = () => {
  const [espacios, setEspacios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const espaciosRef = ref(db, 'espacios');
    
    // onValue escucha los cambios en tiempo real
    const unsubscribe = onValue(espaciosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Convertir el objeto a array y ordenarlo por columna (1-4) y número (1-20)
        const listaEspacios = Object.values(data).sort((a, b) => {
          if (a.columna === b.columna) return a.numero - b.numero;
          return a.columna - b.columna;
        });
        setEspacios(listaEspacios);
      }
      setLoading(false);
    });

    // Limpiar el listener cuando el componente se desmonte
    return () => unsubscribe();
  }, []);

  return { espacios, loading };
};