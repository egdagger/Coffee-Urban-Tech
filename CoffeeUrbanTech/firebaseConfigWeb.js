import firebase from 'firebase/compat/app'; // Para la inicialización
import 'firebase/compat/firestore'; // Si vas a usar Firestore


const firebaseConfig = {
  apiKey: "AIzaSyD6ayt-f-HbYATmzEWejkYoEH1FJntyU2Q",
  authDomain: "coffee-urban-tech.firebaseapp.com",
  projectId: "coffee-urban-tech",
  storageBucket: "coffee-urban-tech.firebasestorage.app",
  messagingSenderId: "177052798498",
  appId: "1:177052798498:web:801c609c415e68ff64c47b"
};


// Inicializa Firebase SOLO SI NO HA SIDO INICIALIZADO AÚN
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  console.log('✅ Firebase SDK Inicializado Correctamente para WEB.');
} else {
  console.log('✅ Firebase SDK ya estaba inicializado.');
}

// Exporta la instancia de Firestore para que puedas usarla en tus componentes
const firestoreDb = firebase.firestore();

export { firestoreDb };

/*
// Producto
type Producto = {
  id: string; // ID de Firestore
  categoria: string;
  costo_unitario: number;
  descripcion: string;
  en_menu: boolean; // Si esta en Menu o no
  fecha_creacion: Timestamp;
  nombre: string;
  precio_sugerido: number; //Si tipo_producto = "Menu", otro tipo_producto no tiene este campo
  precio_venta: number;   //Si tipo_producto = "Menu", otro tipo_producto no tiene este campo
  stock: number;
  tipo_producto: string;
  ultima_actualizacion: Timestamp;
};

// Compra
type Compra = {
  id: string; // ID de Firestore
  fecha_compra: Timestamp;
  id_proveedor: string;
  nombre_proveedor: string;
  productos_comprados[]: { // Array de objetos
    cantidad: number;
    costo_unitario: number;
    id_producto: string;
    nombre_producto: string;
  };
  total_compra: number;
};

// Proveedor
type Proveedor = {
  id: string; // ID de Firestore
  direccion: string;
  email: string;
  fecha_creacion: Timestamp;
  nombre: string;
  nombre_contacto: string;
  telefono: string;
};

// Venta
type Venta = {
  id: string; // ID de Firestore
  estado: string; //Si se proceso la transacción "Completado | Cancelado"
  fecha_venta: Timestamp; 
  productos_vendidos[]:   // Array de objetos
    { 
        cantidad: number;
        id_producto: string;
        nombre_producto: string;
        precio_venta: number;
    };
  total_venta: number;
};
*/
