import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import React, { useState } from "react";

type Props = {
  onTabChange?: (tabId: string) => void;
};

const tabs = [
  { id: "dashboard", label: "Dashboard" },
  { id: "sales", label: "Ventas" },
  { id: "inventory", label: "Inventario" },
  { id: "purchases", label: "Compras" },
  { id: "reports", label: "Reportes" },
];

export default function Header({ onTabChange }: Props) {
  const [activeTab, setActiveTab] = useState("dashboard");

  const handlePress = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  return (
    <View className="w-full shadow-md">
      {/* Encabezado */}
      <View className="w-full bg-gradient-to-br from-[#8B4513] to-[#A0522D] px-5 py-6 items-center">
        <Text className="text-white text-xl font-bold mb-1">
          ☕ Coffee UrbanTech 🍔
        </Text>
        <Text className="text-white text-xs opacity-90">
          CoffeeTime & UrbanBite - Sistema de Gestión
        </Text>
      </View>

      {/* Tabs (sin ScrollView) */}
      <View className="flex-row w-full bg-gray-100 border-b border-gray-300">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            className={`
          flex-1           /* cada tab ocupa 1/fracción igual */
          py-3            /* padding vertical */
          items-center    /* centra horizontalmente el texto */
          justify-center  /* centra verticalmente */
          ${activeTab === tab.id ? "bg-[#8B4513]" : ""}
        `}
          >
            <Text
              className={`
            text-[11px] font-bold
            ${activeTab === tab.id ? "text-white" : "text-gray-600"}
          `}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
