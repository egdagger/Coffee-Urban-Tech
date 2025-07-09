import { collection, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore';
import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { db } from '@/firebaseConfigWeb';
import { Product, Purchase, Sale } from '@/app/firebaseData';

type Activity = {
  type: "sale" | "purchase";
  date: string;
  description: string;
  amount: number;
};

export default function DashboardScreen() {
  const [firebaseSales, setFirebaseSales] = useState<Sale[]>([]);
  const [firebasePurchases, setFirebasePurchases] = useState<Purchase[]>([]);
  const [firebaseProducts, setFirebaseProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        //Productos
        const productsSnapshot = await getDocs(collection(db, "products"));
        const productsList: Product[] = productsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || '',
            description: data.description || '',
            price: data.price || 0,
            unitCost: data.unitCost || 0,
            stock: data.stock || 0,
            category: data.category || '',
            productType: data.productType || '',
            suggestedPrice: data.suggestedPrice || null,
            inMenu: data.inMenu || false,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : null,
          } as Product; // Casteo final
        });
        setFirebaseProducts(productsList);

        // Ventas
        const thirtyDaysAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        const salesQuery = query(
            collection(db, "sales"),
            where("date", ">=", thirtyDaysAgo),
            orderBy("date", "desc")
        );
        const salesSnapshot = await getDocs(salesQuery);
        const salesList: Sale[] = salesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            date: data.date instanceof Timestamp ? data.date : Timestamp.fromDate(new Date()),
            items: data.items || [],
            total: data.total || 0,
            invoiceCode: data.invoiceCode || null, // Nuevo campo
          } as Sale;
        });
        setFirebaseSales(salesList);

        // Compras
        const purchasesQuery = query(
            collection(db, "purchases"),
            where("purchaseDate", ">=", thirtyDaysAgo),
            orderBy("purchaseDate", "desc")
        );
        const purchasesSnapshot = await getDocs(purchasesQuery);
        const purchasesList: Purchase[] = purchasesSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            purchaseDate: data.purchaseDate instanceof Timestamp ? data.purchaseDate : Timestamp.fromDate(new Date()),
            supplierName: data.supplierName || 'N/A',
            items: data.items || [],
            total: data.total || 0,
          } as Purchase;
        });
        setFirebasePurchases(purchasesList);

      } catch (err: any) {
        setError("Error: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading && !error) {
      const allActivity = [
        ...firebaseSales.map((sale) => ({
          type: "sale" as const,
          date: sale.date instanceof Timestamp ? sale.date.toDate().toISOString() : new Date().toISOString(),
          description: `${sale.invoiceCode || `Venta #${sale.id.substring(0, 8)}`} - $${sale.total.toFixed(2)}`,
          amount: sale.total,
        })),
        ...firebasePurchases.map((purchase) => ({
          type: "purchase" as const,
          date: purchase.purchaseDate instanceof Timestamp ? purchase.purchaseDate.toDate().toISOString() : new Date().toISOString(),
          description: `Compra de ${purchase.items.map(item => item.productName).join(', ')} - $${purchase.total.toFixed(2)}`,
          amount: purchase.total,
        })),
      ]
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

      setRecentActivity(allActivity);
    }
  }, [firebaseSales, firebasePurchases, loading, error]);

  const today = new Date().toDateString();
  const totalSalesToday = firebaseSales.filter(
      (sale) => sale.date instanceof Timestamp && sale.date.toDate().toDateString() === today
  ).reduce((sum, sale) => sum + sale.total, 0);

  const currentMonth = new Date().getMonth();
  const totalPurchasesMonth = firebasePurchases.filter(
      (purchase) => purchase.purchaseDate instanceof Timestamp && purchase.purchaseDate.toDate().getMonth() === currentMonth
  ).reduce((sum, purchase) => sum + purchase.total, 0);

  const lowStockItems = firebaseProducts.filter((product) => product.stock < 10);

  if (loading) {
    return (
        <View>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Cargando data...</Text>
        </View>
    );
  }

  if (error) {
    return (
        <View>
          <Text className="text-red-600 text-lg mb-2">Error de Carga</Text>
          <Text className="text-gray-700 text-base text-center">{error}</Text>
          <Text className="text-gray-500 text-sm mt-2">
            Error en la carga de Firebase.
          </Text>
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
              {firebaseProducts.length}
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
};