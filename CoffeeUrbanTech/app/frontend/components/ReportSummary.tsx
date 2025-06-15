import React from "react";
import { View, Text } from "react-native";

type Props = {
  totalRevenue: number;
  totalCosts: number;
  totalTransactions: number;
  avgTicket: number;
  netProfit: number;
  profitMargin: number;
};

export default function ReportSummary({
  totalRevenue,
  totalCosts,
  totalTransactions,
  avgTicket,
  netProfit,
  profitMargin,
}: Props) {
  const isPositive = netProfit >= 0;

  return (
    <View className="bg-white p-5 rounded-xl border border-gray-200 shadow mb-5">
      <View className="bg-blue-100 rounded-lg py-2 px-3 mb-4">
        <Text className="text-blue-700 text-center font-bold">
          Reporte generado para: Hoy (25 de Mayo, 2025)
        </Text>
      </View>

      <View className="flex-row flex-wrap -mx-1 mb-4">
        <View className="w-1/2 px-1 mb-3">
          <View className="bg-gray-100 rounded-lg p-4 border-l-4 border-[#8B4513]">
            <Text className="text-[#8B4513] text-xl font-bold mb-1">
              ${totalRevenue.toFixed(2)}
            </Text>
            <Text className="text-xs text-gray-600">Ingresos Totales</Text>
          </View>
        </View>
        <View className="w-1/2 px-1 mb-3">
          <View className="bg-gray-100 rounded-lg p-4 border-l-4 border-[#8B4513]">
            <Text className="text-[#8B4513] text-xl font-bold mb-1">
              ${totalCosts.toFixed(2)}
            </Text>
            <Text className="text-xs text-gray-600">Costos Totales</Text>
          </View>
        </View>
        <View className="w-1/2 px-1 mb-3">
          <View className="bg-gray-100 rounded-lg p-4 border-l-4 border-[#8B4513]">
            <Text className="text-[#8B4513] text-xl font-bold mb-1">
              {totalTransactions}
            </Text>
            <Text className="text-xs text-gray-600">Transacciones</Text>
          </View>
        </View>
        <View className="w-1/2 px-1 mb-3">
          <View className="bg-gray-100 rounded-lg p-4 border-l-4 border-[#8B4513]">
            <Text className="text-[#8B4513] text-xl font-bold mb-1">
              ${avgTicket.toFixed(2)}
            </Text>
            <Text className="text-xs text-gray-600">Ticket Promedio</Text>
          </View>
        </View>
      </View>

      <View className="bg-[#8B4513] rounded-xl py-4 px-3 mb-2">
        <Text className="text-white text-center text-lg font-bold">
          {isPositive ? "Ganancia Neta" : "Pérdida Neta"}: $
          {Math.abs(netProfit).toFixed(2)}
        </Text>
        <Text className="text-white text-center text-sm opacity-90">
          Margen de ganancia: {profitMargin.toFixed(1)}%
        </Text>
      </View>
    </View>
  );
}
