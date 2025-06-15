import React from "react";
import { View, Text, Pressable } from "react-native";

type Props = {
  purchases: {
    id: number;
    supplier: string;
    product: string;
    quantity: number;
    unitCost: number;
    total: number;
    date: string;
  }[];
  onDelete: (id: number) => void;
};

export default function PurchaseHistory({ purchases, onDelete }: Props) {
  return (
    <View className="bg-white rounded-xl p-5 border border-gray-200 shadow">
      <Text className="text-[#8B4513] text-lg font-bold mb-4">
        Historial de Compras
      </Text>

      {purchases.length === 0 ? (
        <View className="items-center py-10">
          <Text className="text-[#8B4513] font-bold mb-2">
            No hay Compras registradas
          </Text>
          <Text className="text-gray-600 text-sm text-center">
            Registra tu primera compra usando el formulario de arriba
          </Text>
        </View>
      ) : (
        <>
          {purchases.map((p) => (
            <View
              key={p.id}
              className="bg-gray-100 rounded-lg border-l-4 border-red-500 px-4 py-3 mb-4"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-[#8B4513] font-bold mb-1">
                    Compra #{p.id}
                  </Text>
                  <Text className="text-xs text-gray-700">
                    Producto: {p.product}
                  </Text>
                  <Text className="text-xs text-gray-700">
                    Proveedor: {p.supplier}
                  </Text>
                  <Text className="text-xs text-gray-700">
                    Cantidad: {p.quantity}
                  </Text>
                  <Text className="text-xs text-gray-700">
                    Costo Unitario: ${p.unitCost.toFixed(2)}
                  </Text>
                  <Text className="text-xs text-gray-700">
                    Fecha: {new Date(p.date).toLocaleString()}
                  </Text>
                </View>
                <Text className="text-red-600 font-bold ml-4">
                  ${p.total.toFixed(2)}
                </Text>
              </View>

              <Pressable
                onPress={() => onDelete(p.id)}
                className="bg-red-500 rounded px-3 py-1 mt-3 self-start"
              >
                <Text className="text-white text-xs font-bold">Eliminar</Text>
              </Pressable>
            </View>
          ))}
        </>
      )}
    </View>
  );
}
