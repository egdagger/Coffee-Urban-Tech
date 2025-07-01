import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { firestoreDb } from '../../../firebaseConfigWeb';

// Modelos de Datos
type Producto = {
  id: string;
  categoria: string;
  costo_unitario: number;
  descripcion: string;
  en_menu: boolean;
  fecha_creacion: any;
  nombre: string;
  precio_sugerido: number;
  precio_venta: number;
  stock: number;
  tipo_producto: string;
  ultima_actualizacion: any;
};

type ItemComprado = {
  cantidad: number;
  costo_unitario: number;
  id_producto: string;
  nombre_producto: string;
};

type Compra = {
  id: string;
  fecha_compra: any;
  id_proveedor: string;
  nombre_proveedor: string;
  productos_comprados: ItemComprado[];
  total_compra: number;
};

type ItemVendido = {
  cantidad: number;
  id_producto: string;
  nombre_producto: string;
  precio_venta: number;
};

type Venta = {
  id: string;
  estado: string;
  fecha_venta: any;
  productos_vendidos: ItemVendido[];
  total_venta: number;
};

type Activity = {
  type: "sale" | "purchase";
  date: string;
  description: string;
  amount: number;
};


export default function DashboardScreen() {
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  useEffect(() => {
    //Carga de 'Venta'
    const ventasSubscriber = firestoreDb
      .collection('Venta')
      .onSnapshot(querySnapshot => {
        const fetchedVentas: Venta[] = [];
        querySnapshot.forEach(documentSnapshot => {
          const data = documentSnapshot.data();
          fetchedVentas.push({
            id: documentSnapshot.id,
            estado: data.estado || '',
            fecha_venta: data.fecha_venta ? data.fecha_venta.toDate() : new Date(),
            productos_vendidos: data.productos_vendidos || [],
            total_venta: data.total_venta || 0,
          });
        });
        setVentas(fetchedVentas);
        checkAllLoaded();
      }, err => {
        console.error("Error:", err);
        setError("No se cargaron las ventas.");
        setLoading(false);
      });

    // Carga de 'Compra'
    const comprasSubscriber = firestoreDb
      .collection('Compra')
      .onSnapshot(querySnapshot => {
        const fetchedCompras: Compra[] = [];
        querySnapshot.forEach(documentSnapshot => {
          const data = documentSnapshot.data();
          fetchedCompras.push({
            id: documentSnapshot.id,
            fecha_compra: data.fecha_compra ? data.fecha_compra.toDate() : new Date(),
            id_proveedor: data.id_proveedor || '',
            nombre_proveedor: data.nombre_proveedor || 'Desconocido',
            productos_comprados: data.productos_comprados || [],
            total_compra: data.total_compra || 0,
          });
        });
        setCompras(fetchedCompras);
        checkAllLoaded();
      }, err => {
        console.error("Error:", err);
        setError("No se cargaron las compras.");
        setLoading(false);
      });

    // Cargar 'Producto'
    const productosSubscriber = firestoreDb
      .collection('Producto')
      .onSnapshot(querySnapshot => {
        const fetchedProductos: Producto[] = [];
        querySnapshot.forEach(documentSnapshot => {
          const data = documentSnapshot.data();
          fetchedProductos.push({
            id: documentSnapshot.id,
            categoria: data.categoria || '',
            costo_unitario: data.costo_unitario || 0,
            descripcion: data.descripcion || '',
            en_menu: data.en_menu || false,
            fecha_creacion: data.fecha_creacion ? data.fecha_creacion.toDate() : new Date(),
            nombre: data.nombre || 'Sin Nombre',
            precio_sugerido: data.precio_sugerido || 0,
            precio_venta: data.precio_venta || 0,
            stock: data.stock || 0,
            tipo_producto: data.tipo_producto || '',
            ultima_actualizacion: data.ultima_actualizacion ? data.ultima_actualizacion.toDate() : new Date(),
          });
        });
        setProductos(fetchedProductos);
        checkAllLoaded();
      }, err => {
        console.error("Error :", err);
        setError("No se cargaron los productos.");
        setLoading(false);
      });

    // Revisa todas las colecciones carguen
    let loadedCount = 0;
    const totalCollections = 3; // Compra+Venta+Producto

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount >= totalCollections) {
        setLoading(false);
      }
    };

    // Limpiar suscripciones al desmontar el componente
    return () => {
      ventasSubscriber();
      comprasSubscriber();
      productosSubscriber();
    };
  }, []); // Se ejecuta una sola vez al montar el componente

  // Actividad Reciente
  useEffect(() => {
    if (ventas.length > 0 || compras.length > 0) {
        const allActivity = [
            ...ventas.map((venta) => ({
                type: "sale" as const,
                date: venta.fecha_venta.toISOString(),
                description: `Venta #${venta.id.substring(0, 4)} - $${venta.total_venta.toFixed(2)}`,
                amount: venta.total_venta,
            })),
            ...compras.map((compra) => ({
                type: "purchase" as const,
                date: compra.fecha_compra.toISOString(),
                description: `Compra de ${compra.productos_comprados.length > 0 ? compra.productos_comprados[0].nombre_producto : 'Múltiples'} - $${compra.total_compra.toFixed(2)}`,
                amount: compra.total_compra,
            })),
        ]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);

        setRecentActivity(allActivity);
    }
  }, [ventas, compras]);

  // Cálculos de dashboard
  const today = new Date();
  const todayDateString = today.toDateString();

  const totalSalesToday = ventas.reduce((sum, venta) => {
    const saleDate = venta.fecha_venta instanceof Date ? venta.fecha_venta : new Date(venta.fecha_venta);
    return saleDate.toDateString() === todayDateString ? sum + venta.total_venta : sum;
  }, 0);

  const currentMonth = today.getMonth();
  const monthPurchases = compras.filter((compra) => {
    const purchaseDate = compra.fecha_compra instanceof Date ? compra.fecha_compra : new Date(compra.fecha_compra);
    return purchaseDate.getMonth() === currentMonth && purchaseDate.getFullYear() === today.getFullYear();
  });
  const totalPurchasesMonth = monthPurchases.reduce(
    (sum, purchase) => sum + purchase.total_compra,
    0
  );

  const lowStockItems = productos.filter((producto) => producto.stock < 10);

  // Renderizado condicional basado en loading y error
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTextTitle}>¡Error!</Text>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.errorText}>Revisar la conexión con la BD.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="flex-row flex-wrap justify-between mb-6">
        <View className="bg-gray-100 p-5 rounded-xl items-center w-[47%] mb-4 border-l-4 border-amber-800">
          <Text className="text-amber-800 text-2xl font-bold mb-1">
            ${totalSalesToday.toFixed(2)}
          </Text>
          <Text className="text-gray-600 text-sm">Ventas Hoy</Text>
        </View>
        <View className="bg-gray-100 p-5 rounded-xl items-center w-[47%] mb-4 border-l-4 border-amber-800">
          <Text className="text-amber-800 text-2xl font-bold mb-1">
            {productos.length}
          </Text>
          <Text className="text-gray-600 text-sm">Productos</Text>
        </View>
        <View className="bg-gray-100 p-5 rounded-xl items-center w-[47%] mb-4 border-l-4 border-amber-800">
          <Text className="text-amber-800 text-2xl font-bold mb-1">
            {lowStockItems.length}
          </Text>
          <Text className="text-gray-600 text-sm">Stock Bajo</Text>
        </View>
        <View className="bg-gray-100 p-5 rounded-xl items-center w-[47%] mb-4 border-l-4 border-amber-800">
          <Text className="text-amber-800 text-2xl font-bold mb-1">
            ${totalPurchasesMonth.toFixed(2)}
          </Text>
          <Text className="text-gray-600 text-sm">Compras Mes</Text>
        </View>
      </View>

      <View className="bg-white rounded-xl p-5 shadow border border-gray-100">
        <Text className="text-amber-800 mb-4 text-lg border-b-2 border-gray-100 pb-2 font-bold">
          Actividad Reciente
        </Text>
        {recentActivity.length === 0 ? (
          <View className="items-center py-10">
            <Text className="mb-2 text-amber-800 font-bold">
              No hay actividad reciente
            </Text>
            <Text className="text-gray-600">
              Comienza registrando ventas o gestionando inventario
            </Text>
          </View>
        ) : (
          recentActivity.map((activity, index) => (
            <View
              key={index}
              className={`bg-gray-100 rounded-lg p-4 mb-2 border-l-4 ${
                activity.type === "sale" ? "border-green-500" : "border-red-500"
              }`}
            >
              <View className="flex-row justify-between items-center">
                <View>
                  <Text className="font-bold">{activity.description}</Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    {new Date(activity.date).toLocaleString()}
                  </Text>
                </View>
                <Text
                  className={`font-bold ${
                    activity.type === "sale" ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {activity.type === "sale" ? "+" : "-"}$
                  {activity.amount.toFixed(2)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fee',
    borderRadius: 8,
    margin: 20,
  },
  errorTextTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 5,
  },
});