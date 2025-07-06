import React, { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import PurchaseForm from "../components/PurchaseForm";
import PurchaseHistory from "../components/PurchaseHistory";

import { collection, doc, onSnapshot, orderBy, query, runTransaction, Timestamp } from "firebase/firestore";
import { db } from '../../../firebaseConfigWeb';
import { Product, Purchase, PurchasedItem } from '../../firebaseData';


export default function ComprasScreen() {
  const [products, setProducts] = useState<Product[]>([]);
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

  // Leemos productos
  useEffect(() => {
    const q = query(collection(db, "products"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData: Product[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      } as Product));
      setProducts(productsData);
    }, (error) => {
      Alert.alert("Error");
    });

    return () => unsubscribe();
  }, []);

  // Leer Compras
  useEffect(() => {
    const q = query(collection(db, "purchases"), orderBy("purchaseDate", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const purchasesData: Purchase[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        purchaseDate: doc.data().purchaseDate || Timestamp.now(),
      } as Purchase));
      setPurchases(purchasesData);
    }, (error) => {
      Alert.alert("No se pudo cargar el historial de compras");
    });

    return () => unsubscribe();
  }, []);


  const addPurchase = async (newPurchaseData: {
    productId: string;
    quantity: number;
    supplierName?: string;
    unitCost?: number;
  }) => {
    try {
      await runTransaction(db, async (transaction) => {
        const productRef = doc(db, "products", newPurchaseData.productId);
        const productDoc = await transaction.get(productRef);

        if (!productDoc.exists()) {
          throw new Error("Producto no encontrado en inventario.");
        }

        const productInInventory = productDoc.data() as Product;
        const newStock = productInInventory.stock + newPurchaseData.quantity;

        transaction.update(productRef, { stock: newStock });

        const unitCostAtPurchase = newPurchaseData.unitCost ?? productInInventory.unitCost;
        const totalItemCost = unitCostAtPurchase * newPurchaseData.quantity;

        const purchasedItem: PurchasedItem = {
          productId: newPurchaseData.productId,
          productName: productInInventory.name,
          quantity: newPurchaseData.quantity,
          unitCost: unitCostAtPurchase,
        };

        const purchaseToAdd: Omit<Purchase, 'id'> = {
          purchaseDate: Timestamp.now(),
          supplierName: newPurchaseData.supplierName ?? "Proveedor Desconocido",
          items: [purchasedItem],
          total: totalItemCost,
        };

        transaction.set(doc(collection(db, "purchases")), purchaseToAdd);
      });

      showNotification("Compra registrada.");
    } catch (error) {
      showNotification("Error al registrar la compra.");
    }
  };

  const deletePurchase = async (id: string) => {
    try {
      await runTransaction(db, async (transaction) => {
        const purchaseRef = doc(db, "purchases", id);
        const purchaseDoc = await transaction.get(purchaseRef);

        if (!purchaseDoc.exists()) {
          throw new Error("Compra no encontrada.");
        }

        const removedPurchase = purchaseDoc.data() as Purchase;

        // Revertir stock?
        for (const item of removedPurchase.items) {
          const productRef = doc(db, "products", item.productId);
          const productDoc = await transaction.get(productRef);

          if (productDoc.exists()) {
            const productInInventory = productDoc.data() as Product;
            const newStock = Math.max(productInInventory.stock - item.quantity, 0);
            transaction.update(productRef, { stock: newStock });
          } else {
            console.warn(`Error, no se encontro el producto: (${item.productName}) para revertir stock.`);
          }
        }

        transaction.delete(purchaseRef);
      });

      showNotification("Compra eliminada correctamente y stock revertido.");
    } catch (error) {
      showNotification("Error al eliminar la compra.");
    }
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <PurchaseForm products={products} onAddPurchase={addPurchase} />
        <PurchaseHistory purchases={purchases} onDelete={deletePurchase} />
      </ScrollView>
    </View>
  );
};