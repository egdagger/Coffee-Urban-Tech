import React, { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import PurchaseForm from "../components/PurchaseForm";
import PurchaseHistory from "../components/PurchaseHistory";

export default function ComprasScreen() {
  const [products, setProducts] = useState([
    { id: 1, name: "Café Molido Premium", price: 2.5, stock: 50 },
    { id: 2, name: "Aguacate", price: 5.0, stock: 30 },
    { id: 3, name: "Lechuga", price: 8.5, stock: 25 },
    { id: 4, name: "Tomate", price: 4.0, stock: 15 },
    { id: 5, name: "Pescado", price: 2.0, stock: 40 },
    { id: 6, name: "Extracto de naranja", price: 3.5, stock: 35 },
    { id: 7, name: "Almendras", price: 6.0, stock: 20 },
    { id: 8, name: "Envolturas", price: 5.0, stock: 12 },
  ]);

  type Purchase = {
    id: number;
    supplier: string;
    product: string;
    quantity: number;
    unitCost: number;
    total: number;
    date: string;
  };
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [notification, setNotification] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const showNotification = (
    text: string,
    type: "success" | "error" = "success"
  ) => {
    setNotification({ text, type });
  };

  const addPurchase = (newPurchase: {
    product: string;
    quantity: number;
    supplier?: string;
    unitCost?: number;
  }) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.name === newPurchase.product
          ? { ...p, stock: p.stock + newPurchase.quantity }
          : p
      )
    );
    const productObj = products.find((p) => p.name === newPurchase.product);
    const unitCost = newPurchase.unitCost ?? productObj?.price ?? 0;
    const supplier = newPurchase.supplier ?? "N/A";
    const total = unitCost * newPurchase.quantity;
    setPurchases((prev) => [
      {
        id: Date.now(),
        supplier,
        product: newPurchase.product,
        quantity: newPurchase.quantity,
        unitCost,
        total,
        date: new Date().toISOString(),
      },
      ...prev,
    ]);
    showNotification(
      `Compra registrada: ${newPurchase.quantity} ${newPurchase.product}`
    );
  };

  const deletePurchase = (id: number) => {
    setPurchases((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((p) => p.id === id);
      if (index !== -1) {
        const removed = updated.splice(index, 1)[0];
        setProducts((ps) =>
          ps.map((p) =>
            p.name === removed.product
              ? { ...p, stock: Math.max(p.stock - removed.quantity, 0) }
              : p
          )
        );
      }
      return updated;
    });
    showNotification("Compra eliminada correctamente");
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <PurchaseForm products={products} onAddPurchase={addPurchase} />
        <PurchaseHistory purchases={purchases} onDelete={deletePurchase} />
      </ScrollView>
    </View>
  );
}
