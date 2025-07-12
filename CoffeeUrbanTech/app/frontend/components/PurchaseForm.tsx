import { Picker } from "@react-native-picker/picker";
import React, { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

// Importa el tipo Product desde tu archivo de modelos de datos
import { Product } from "../../firebaseData";

type Props = {
  // products ahora es un array de tu tipo Product de Firebase
  products: Product[];
  // onAddPurchase espera un productId y supplierName, alineado con ComprasScreen
  onAddPurchase: (purchase: {
    productId: string;
    quantity: number;
    supplierName?: string;
    unitCost?: number;
  }) => void;
};

export default function PurchaseForm({ products, onAddPurchase }: Props) {
  const [supplierName, setSupplierName] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    const q = parseFloat(quantity);
    const u = parseFloat(unitCost);
    if (!isNaN(q) && !isNaN(u) && q > 0 && u > 0) {
      setTotal(q * u);
    } else {
      setTotal(null);
    }
  }, [quantity, unitCost]);

  const handleSubmit = () => {
    if (!selectedProductId) return;
    const q = parseInt(quantity);
    const u = parseFloat(unitCost);
    if (isNaN(q) || isNaN(u) || q <= 0 || u <= 0) return;

    onAddPurchase({
      supplierName,
      productId: selectedProductId,
      quantity: q,
      unitCost: u,
    });

    setQuantity("");
    setUnitCost("");
    setSelectedProductId("");
    setSupplierName("");
    setTotal(null);
  };

  return (
    <View className="bg-white rounded-xl p-5 mb-5 border border-gray-200 shadow">
      <Text className="text-[#8B4513] text-lg font-bold mb-4">
        Registrar Compra
      </Text>

      {/* Proveedor */}
      <Text className="text-sm font-bold text-gray-700 mb-1">Proveedor</Text>
      <View className="mb-4">
        <TextInput
          value={supplierName}
          onChangeText={setSupplierName}
          className="border border-gray-300 rounded-lg px-4 py-2 mb-4 text-sm"
          placeholder="Nombre del proveedor"
          placeholderTextColor="#888"
        />
      </View>

      {/* Producto */}
      <Text className="text-sm font-bold text-gray-700 mb-1">Producto</Text>
      <View className="border border-gray-300 rounded-lg mb-4">
        <Picker
          selectedValue={selectedProductId}
          onValueChange={(itemValue) => setSelectedProductId(String(itemValue))}
          mode="dropdown"
          style={{ color: "#222", fontWeight: "bold" }}
        >
          <Picker.Item label="Seleccionar producto" value="" color="#888" />
          {products.map((p) => (
            <Picker.Item
              label={`${p.name} (Stock: ${p.stock})`}
              value={p.id}
              key={p.id}
              color="#222"
            />
          ))}
        </Picker>
      </View>

      {/* Cantidad */}
      <Text className="text-sm font-bold text-gray-700 mb-1">Cantidad</Text>
      <TextInput
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="numeric"
        className="border border-gray-300 rounded-lg px-4 py-2 mb-4 text-sm"
        placeholder="Ej: 10"
        placeholderTextColor="#888"
      />

      {/* Costo Unitario */}
      <Text className="text-sm font-bold text-gray-700 mb-1">
        Costo Unitario ($)
      </Text>
      <TextInput
        value={unitCost}
        onChangeText={setUnitCost}
        keyboardType="numeric"
        className="border border-gray-300 rounded-lg px-4 py-2 mb-4 text-sm"
        placeholder="Ej: 1.50"
        placeholderTextColor="#888"
      />

      {/* Total */}
      {total !== null && (
        <View className="bg-[#8B4513] rounded-lg py-3 mb-4">
          <Text className="text-white text-center font-bold">
            Total: ${total.toFixed(2)}
          </Text>
        </View>
      )}

      {/* Botón */}
      <Pressable
        onPress={handleSubmit}
        className="bg-[#8B4513] rounded-lg py-3"
      >
        <Text className="text-white font-bold text-center">
          Registrar Compra
        </Text>
      </Pressable>
    </View>
  );
}
