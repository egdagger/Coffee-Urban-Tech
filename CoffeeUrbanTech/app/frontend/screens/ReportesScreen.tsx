import React, { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Picker } from "@react-native-picker/picker";
import ReportSummary from "../components/ReportSummary";
import ProductSalesChart from "../components/ProductSalesChart";
import DataTable from "../components/DataTable";

export default function ReportesScreen() {
  const [period, setPeriod] = useState("today");

  const stats = {
    totalRevenue: 248.5,
    totalCosts: 156.2,
    totalTransactions: 23,
    avgTicket: 10.8,
    netProfit: 92.3,
    profitMargin: 37.1,
  };

  const productSales = [
    { label: "Café Americano", value: 85 },
    { label: "Cappuccino", value: 72 },
    { label: "Hamburguesa", value: 59.5 },
    { label: "Brownie", value: 32 },
  ];

  const categoryData = {
    title: "🏷️ Ventas por Categoría",
    headers: ["Categoría", "Cantidad", "Ingresos", "%"],
    rows: [
      ["Bebidas", "35", "$157.00", "63.2%"],
      ["Comida", "7", "$59.50", "23.9%"],
      ["Postres", "8", "$32.00", "12.9%"],
    ],
  };

  const topProducts = {
    title: "🏆 Productos Más Vendidos",
    headers: ["Producto", "Cantidad", "Ingresos", "Margen"],
    rows: [
      ["Café Americano", "20", "$85.00", "42%"],
      ["Cappuccino", "15", "$72.00", "38%"],
      ["Hamburguesa Clásica", "7", "$59.50", "35%"],
      ["Brownie", "8", "$32.00", "45%"],
    ],
  };

  const costAnalysis = {
    title: "💰 Análisis de Costos",
    headers: ["Concepto", "Monto", "% del Total"],
    rows: [
      ["Costo de Productos", "$124.50", "79.7%"],
      ["Materias Primas", "$31.70", "20.3%"],
      ["Total Costos", "$156.20", "100%"],
    ],
  };

  const inventoryStatus = {
    title: "📦 Estado del Inventario",
    headers: ["Producto", "Stock", "Estado", "Valor"],
    rows: [
      ["Aguacates", "30", "✓ Normal", "$3.00"],
      ["Café Juan Valdéz", "15", "⚠ Bajo", "$5.00"],
      ["Pan de hamburguesa", "18", "✓ Normal", "$1.00"],
      ["Harina", "7", "⚠ Crítico", "$1.00"],
    ],
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View className="bg-white p-5 rounded-xl border border-gray-200 shadow mb-5">
          <Text className="text-[#8B4513] text-lg font-bold mb-4">
            Reportes Financieros
          </Text>

          <Text className="text-sm font-bold text-gray-700 mb-1">Período</Text>
          <View className="border border-gray-300 rounded-lg mb-4">
            <Picker selectedValue={period} onValueChange={setPeriod}>
              <Picker.Item label="Hoy" value="today" />
              <Picker.Item label="Esta Semana" value="week" />
              <Picker.Item label="Este Mes" value="month" />
              <Picker.Item label="Este Año" value="year" />
            </Picker>
          </View>

          <Pressable className="bg-[#8B4513] rounded-lg py-3 mb-3">
            <Text className="text-white font-bold text-center">
              Generar Reporte
            </Text>
          </Pressable>

          <Pressable className="bg-gray-500 rounded-lg py-3">
            <Text className="text-white font-bold text-center">
              Exportar PDF
            </Text>
          </Pressable>
        </View>

        <ReportSummary {...stats} />

        <ProductSalesChart data={productSales} />

        <DataTable {...categoryData} />
        <DataTable {...topProducts} />
        <DataTable {...costAnalysis} />
        <DataTable {...inventoryStatus} />
      </ScrollView>
    </View>
  );
}
