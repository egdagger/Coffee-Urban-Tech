import React from "react";
import { View, Text } from "react-native";

type Props = {
  title: string;
  headers: string[];
  rows: string[][];
};

export default function DataTable({ title, headers, rows }: Props) {
  return (
    <View className="bg-white p-5 rounded-xl border border-gray-200 shadow mb-5">
      <Text className="text-[#8B4513] text-lg font-bold mb-4">{title}</Text>

      <View className="flex-row border-b border-gray-300 pb-1 mb-2">
        {headers.map((h, i) => (
          <Text
            key={i}
            className="flex-1 text-xs font-bold text-white bg-[#8B4513] px-1 py-1 mr-1 text-center rounded"
          >
            {h}
          </Text>
        ))}
      </View>

      {rows.map((row, i) => (
        <View key={i} className="flex-row border-b border-gray-100 py-1">
          {row.map((cell, j) => (
            <Text
              key={j}
              className="flex-1 text-xs text-gray-800 px-1 text-center"
            >
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}
