import React from "react";
import { Pressable, Text, View } from "react-native";

import { Purchase } from '../../firebaseData'; // Ajusta la ruta si es necesario

type Props = {
  purchases: Purchase[];
  onDelete: (id: string) => void; // Un comentario para tus compañeros sobre el cambio de tipo de ID
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
          {/* Ordenar por fecha para mostrar las más recientes primero (aunque ya lo hacemos en ComprasScreen) */}
          {purchases.map((p) => (
            <View
              key={p.id}
              className="bg-gray-100 rounded-lg border-l-4 border-red-500 px-4 py-3 mb-4"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-[#8B4513] font-bold mb-1">
                    Compra # {p.id.substring(0, 8)}... {/* Mostrar solo parte del ID para legibilidad */}
                  </Text>
                  <Text className="text-xs text-gray-700">
                    Proveedor: {p.supplierName}
                  </Text>
                  <Text className="text-xs text-gray-700 mb-2">
                    Fecha: {p.purchaseDate.toDate().toLocaleString()} {/* Convierte Timestamp a Date */}
                  </Text>

                  {/* Mostrar los items comprados dentro de esta compra */}
                  <Text className="text-xs font-bold text-gray-700 mt-2">
                    Productos:
                  </Text>
                  {p.items.map((item, index) => (
                    <Text key={index} className="text-xs text-gray-700 ml-2">
                      • {item.productName} (x{item.quantity}) - ${item.unitCost.toFixed(2)} c/u
                    </Text>
                  ))}
                </View>
                <Text className="text-red-600 font-bold ml-4 text-lg">
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