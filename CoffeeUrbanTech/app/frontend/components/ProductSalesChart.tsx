import React from "react";
import { View, Text } from "react-native";

type Props = {
  data: { label: string; value: number }[];
};

export default function ProductSalesChart({ data }: Props) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <View className="bg-white p-5 rounded-xl border border-gray-200 shadow mb-5">
      <Text className="text-[#8B4513] text-lg font-bold mb-4">
        📊 Ventas por Producto
      </Text>

      {data.map((item) => (
        <View key={item.label} className="flex-row items-center mb-3">
          <Text className="w-24 text-right mr-2 font-bold text-xs">
            {item.label}
          </Text>
          <View className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-full rounded-full"
              style={{
                width: `${(item.value / maxValue) * 100}%`,
                backgroundColor: "#8B4513",
              }}
            />
          </View>
          <Text className="ml-2 text-[#8B4513] font-bold text-xs">
            ${item.value.toFixed(2)}
          </Text>
        </View>
      ))}
    </View>
  );
}
