import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Pressable } from "react-native";
import { Picker } from "@react-native-picker/picker";

type Props = {
  products: { id: number; name: string; stock: number }[];
  onAddPurchase: (purchase: {
    supplier: string;
    product: string;
    quantity: number;
    unitCost: number;
    total: number;
  }) => void;
};

export default function PurchaseForm({ products, onAddPurchase }: Props) {
  const [supplier, setSupplier] = useState("");
  const [product, setProduct] = useState("");
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
    if (!product) return;
    const q = parseInt(quantity);
    const u = parseFloat(unitCost);
    if (q <= 0 || u <= 0) return;

    onAddPurchase({
      supplier,
      product,
      quantity: q,
      unitCost: u,
      total: q * u,
    });

    setQuantity("");
    setUnitCost("");
    setProduct("");
    setTotal(null);
  };

  return (
    <View className="bg-white rounded-xl p-5 mb-5 border border-gray-200 shadow">
      <Text className="text-[#8B4513] text-lg font-bold mb-4">
        Registrar Compra
      </Text>

      {/* Proveedor */}
      <Text className="text-sm font-bold text-gray-700 mb-1">Compra</Text>
      <View className="mb-4">
        <TextInput
          value={supplier}
          onChangeText={setSupplier}
          className="border border-gray-300 rounded-lg px-4 py-2 mb-4 text-sm"
          placeholder="Nombre del proveedor"
        />
      </View>

      {/* Producto */}
      <Text className="text-sm font-bold text-gray-700 mb-1">Producto</Text>
      <View className="border border-gray-300 rounded-lg mb-4">
        <Picker
          selectedValue={product}
          onValueChange={(value) => setProduct(value)}
        >
          <Picker.Item label="Seleccionar producto" value="" />
          {products.map((p) => (
            <Picker.Item
              label={`${p.name} (Stock: ${p.stock})`}
              value={p.name}
              key={p.id}
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
