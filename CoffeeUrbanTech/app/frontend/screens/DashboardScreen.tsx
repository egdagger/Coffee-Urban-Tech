import React, { useEffect, useState } from "react";
import { View, Text, ScrollView } from "react-native";

const sales = [
  { id: 1, date: new Date().toISOString(), total: 120.5 },
  { id: 2, date: new Date().toISOString(), total: 80.0 },
];
const purchases = [
  { id: 1, date: new Date().toISOString(), product: "Café", total: 50.0 },
];
const products = [
  { id: 1, name: "Café", stock: 8 },
  { id: 2, name: "Azúcar", stock: 15 },
];

type Activity = {
  type: "sale" | "purchase";
  date: string;
  description: string;
  amount: number;
};

export default function DashboardScreen() {
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);

  useEffect(() => {
    const allActivity = [
      ...sales.map((sale) => ({
        type: "sale" as const,
        date: sale.date,
        description: `Venta #${sale.id} - $${sale.total.toFixed(2)}`,
        amount: sale.total,
      })),
      ...purchases.map((purchase) => ({
        type: "purchase" as const,
        date: purchase.date,
        description: `Compra de ${purchase.product} - $${purchase.total.toFixed(
          2
        )}`,
        amount: purchase.total,
      })),
    ]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    setRecentActivity(allActivity);
  }, []);

  const today = new Date().toDateString();
  const todaySales = sales.filter(
    (sale) => new Date(sale.date).toDateString() === today
  );
  const totalSalesToday = todaySales.reduce((sum, sale) => sum + sale.total, 0);

  const currentMonth = new Date().getMonth();
  const monthPurchases = purchases.filter(
    (purchase) => new Date(purchase.date).getMonth() === currentMonth
  );
  const totalPurchasesMonth = monthPurchases.reduce(
    (sum, purchase) => sum + purchase.total,
    0
  );

  const lowStockItems = products.filter((product) => product.stock < 10);

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
            {products.length}
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
