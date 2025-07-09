import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  collection,
  query,
  onSnapshot,
  doc,
  orderBy,
  limit,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/firebaseConfigWeb';

// Importar tipos de datos
import { Product, Sale, SoldItem } from '../../firebaseData';

interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

const VentasScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [currentSale, setCurrentSale] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingSale, setSavingSale] = useState(false);

  useEffect(() => {
    const productsQuery = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(productsQuery, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Error loading products:", error);
      Alert.alert("Error", "No se pudieron cargar los productos");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const salesQuery = query(
        collection(db, 'sales'),
        orderBy('date', 'desc'),
        limit(10)
    );
    const unsubscribe = onSnapshot(salesQuery, (snapshot) => {
      const salesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Sale[];
      setSales(salesData);
    }, (error) => {
      console.error("Error loading sales:", error);
      Alert.alert("Error", "No se pudieron cargar las ventas");
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter(
      (product) =>
          product.stock > 0 &&
          (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToSale = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const existingItem = currentSale.find(
        (item) => item.productId === productId
    );

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        const updatedSale = currentSale.map((item) =>
            item.productId === productId
                ? {
                  ...item,
                  quantity: item.quantity + 1,
                  subtotal: (item.quantity + 1) * item.price,
                }
                : item
        );
        setCurrentSale(updatedSale);
      } else {
        Alert.alert("❌ Error", "Stock insuficiente");
        return;
      }
    } else {
      const newItem: SaleItem = {
        productId: productId,
        name: product.name,
        price: product.price,
        quantity: 1,
        subtotal: product.price,
      };
      setCurrentSale([...currentSale, newItem]);
    }
  };

  const updateQuantity = (productId: string, change: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const saleItem = currentSale.find((item) => item.productId === productId);
    if (!saleItem) return;

    const newQuantity = saleItem.quantity + change;

    if (newQuantity <= 0) {
      removeFromSale(productId);
      return;
    }

    if (newQuantity > product.stock) {
      Alert.alert("❌ Error", "Stock insuficiente");
      return;
    }

    const updatedSale = currentSale.map((item) =>
        item.productId === productId
            ? { ...item, quantity: newQuantity, subtotal: newQuantity * item.price }
            : item
    );
    setCurrentSale(updatedSale);
  };

  const removeFromSale = (productId: string) => {
    const updatedSale = currentSale.filter(
        (item) => item.productId !== productId
    );
    setCurrentSale(updatedSale);
  };

  const generateInvoiceCode = () => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    return `FAC-${year}${month}${day}-${hours}${minutes}${seconds}`;
  };

  const completeSale = async () => {
    if (currentSale.length === 0) {
      Alert.alert("❌ Error", "No hay productos en la venta");
      return;
    }

    setSavingSale(true);

    try {
      const total = currentSale.reduce((sum, item) => sum + item.subtotal, 0);
      const invoiceCode = generateInvoiceCode();

      const saleItems: SoldItem[] = currentSale.map(item => ({
        productId: item.productId,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        subtotal: item.subtotal
      }));

      const saleData = {
        date: Timestamp.now(),
        items: saleItems,
        total: total,
        invoiceCode: invoiceCode,
      };

      const batch = writeBatch(db);

      const saleRef = doc(collection(db, 'sales'));
      batch.set(saleRef, saleData);

      currentSale.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
          const productRef = doc(db, 'products', item.productId);
          batch.update(productRef, {
            stock: product.stock - item.quantity,
            updatedAt: Timestamp.now()
          });
        }
      });

      await batch.commit();

      setCurrentSale([]);
      Alert.alert("🎉 Éxito", `Venta completada\nFactura: ${invoiceCode}\nTotal: ${total.toFixed(2)}`);
    } catch (error) {
      console.error("Error completing sale:", error);
      Alert.alert("❌ Error", "No se pudo completar la venta");
    } finally {
      setSavingSale(false);
    }
  };

  const clearSale = () => {
    if (currentSale.length > 0) {
      setCurrentSale([]);
    }
  };

  const getTotalAmount = () => {
    return currentSale.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleString();
  };

  if (loading) {
    return (
        <View className="flex-1 bg-white items-center justify-center">
          <ActivityIndicator size="large" color="#92400e" />
          <Text className="text-amber-800 mt-4">Cargando productos...</Text>
        </View>
    );
  }

  return (
      <View className="flex-1 bg-white">
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* Nueva Venta */}
          <View>
            <Text className="text-amber-800 text-xl font-bold mb-5 border-b-2 border-gray-100 pb-3">
              🛒 Registrar Nueva Venta
            </Text>

            {/* Search Box */}
            <View className="mb-5">
              <TextInput
                  className="w-full p-4 border-2 border-gray-300 rounded-xl text-base"
                  placeholder="🔍 Buscar producto..."
                  value={searchTerm}
                  onChangeText={setSearchTerm}
              />
            </View>

            {/* Product List */}
            <View className="mb-5">
              {filteredProducts.length === 0 ? (
                  <View className="text-center py-12 px-5">
                    <Text className="text-amber-800 text-2xl font-bold mb-4">
                      😟 No hay productos disponibles
                    </Text>
                    <Text className="text-gray-600 text-base">
                      Agrega productos al inventario primero
                    </Text>
                  </View>
              ) : (
                  filteredProducts.map((product) => (
                      <View
                          key={product.id}
                          className="bg-gray-50 rounded-xl p-5 mb-4 border-l-4 border-amber-800"
                      >
                        <View className="flex-row justify-between items-center">
                          <View className="flex-1 mr-4">
                            <Text className="text-amber-800 text-lg font-bold mb-2">
                              {product.name}
                            </Text>
                            <Text className="text-gray-600 text-sm mb-1">
                              {product.description}
                            </Text>
                            <Text className="text-gray-800 text-sm font-bold mb-1">
                              💰 Precio: ${product.price.toFixed(2)} | 📦 Stock:{" "}
                              {product.stock}
                            </Text>
                            <Text className="text-gray-500 text-xs">
                              🏷️ Categoría: {product.category}
                            </Text>
                          </View>
                          <TouchableOpacity
                              className="bg-amber-800 px-5 py-3 rounded-xl"
                              onPress={() => addToSale(product.id)}
                          >
                            <Text className="text-white text-sm font-bold">
                              ➕ Agregar
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                  ))
              )}
            </View>

            {currentSale.length > 0 && (
                <View className="mb-5">
                  <Text className="text-amber-800 text-lg font-bold mb-4 border-b border-gray-200 pb-2">
                    🛍️ Productos en la venta:
                  </Text>
                  {currentSale.map((item) => (
                      <View
                          key={item.productId}
                          className="bg-gray-50 rounded-xl p-5 mb-4 border-l-4 border-amber-800"
                      >
                        <View className="flex-row justify-between items-start mb-4">
                          <View className="flex-1">
                            <Text className="text-amber-800 text-lg font-bold mb-2">
                              {item.name}
                            </Text>
                            <Text className="text-gray-600 text-sm mb-3">
                              💰 ${item.price.toFixed(2)} x {item.quantity} = $
                              {item.subtotal.toFixed(2)}
                            </Text>

                            {/* Quantity Controls */}
                            <View className="flex-row items-center mb-3">
                              <TouchableOpacity
                                  className="w-11 h-11 rounded-full border-2 border-amber-800 bg-white items-center justify-center mr-3"
                                  onPress={() => updateQuantity(item.productId, -1)}
                              >
                                <Text className="text-amber-800 text-lg font-bold">
                                  −
                                </Text>
                              </TouchableOpacity>

                              <View className="w-16 h-12 border-2 border-gray-300 rounded-lg items-center justify-center">
                                <Text className="text-base font-bold">
                                  {item.quantity}
                                </Text>
                              </View>

                              <TouchableOpacity
                                  className="w-11 h-11 rounded-full border-2 border-amber-800 bg-white items-center justify-center ml-3"
                                  onPress={() => updateQuantity(item.productId, 1)}
                              >
                                <Text className="text-amber-800 text-lg font-bold">
                                  +
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>

                          <TouchableOpacity
                              className="bg-red-500 px-4 py-2 rounded-xl ml-3"
                              onPress={() => removeFromSale(item.productId)}
                          >
                            <Text className="text-white text-xs font-bold">
                              🗑️ Quitar
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                  ))}
                </View>
            )}

            {currentSale.length > 0 && (
                <View className="bg-amber-800 p-6 rounded-2xl mb-5">
                  <Text className="text-white text-3xl font-bold mb-5">
                    💰 Total: ${getTotalAmount().toFixed(2)}
                  </Text>
                  <View className="flex-row justify-between">
                    <TouchableOpacity
                        className={`px-6 py-3 rounded-xl flex-1 mr-2 ${
                            savingSale ? 'bg-gray-400' : 'bg-green-500'
                        }`}
                        onPress={completeSale}
                        disabled={savingSale}
                    >
                      {savingSale ? (
                          <ActivityIndicator size="small" color="white" />
                      ) : (
                          <Text className="text-white text-sm font-bold text-center">
                            ✅ Completar Venta
                          </Text>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="bg-gray-500 px-6 py-3 rounded-xl flex-1 ml-2"
                        onPress={clearSale}
                        disabled={savingSale}
                    >
                      <Text className="text-white text-sm font-bold text-center">
                        🗑️ Limpiar
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
            )}
          </View>

          <View>
            <Text className="text-amber-800 text-xl font-bold mb-5 border-b-2 border-gray-100 pb-3">
              📊 Historial de Ventas
            </Text>

            {sales.length === 0 ? (
                <View className="text-center py-12 px-5">
                  <Text className="text-amber-800 text-2xl font-bold mb-4">
                    📋 No hay ventas registradas
                  </Text>
                  <Text className="text-gray-600 text-base">
                    Las ventas aparecerán aquí una vez registradas
                  </Text>
                </View>
            ) : (
                sales.map((sale) => (
                    <View
                        key={sale.id}
                        className="bg-green-50 rounded-xl p-5 mb-4 border-l-4 border-green-500"
                    >
                      <View className="flex-row justify-between items-center mb-4">
                        <Text className="font-bold text-base">
                          🧾 {sale.invoiceCode || `Venta #${sale.id.substring(0, 8)}...`}
                        </Text>
                        <Text className="text-green-600 font-bold text-lg">
                          💰 ${sale.total.toFixed(2)}
                        </Text>
                      </View>

                      <Text className="text-gray-600 text-sm mb-4">
                        📅 {formatDate(sale.date)}
                      </Text>

                      <View className="bg-white bg-opacity-70 p-4 rounded-lg">
                        <Text className="font-bold text-sm mb-2">
                          📝 Productos vendidos:
                        </Text>
                        {sale.items.map((item: { productName: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; quantity: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; subtotal: number; }, index: React.Key | null | undefined) => (
                            <View
                                key={index}
                                className="flex-row justify-between py-1 border-b border-gray-200"
                            >
                              <Text className="text-sm">
                                • {item.productName} x{item.quantity}
                              </Text>
                              <Text className="text-sm font-bold">
                                ${item.subtotal.toFixed(2)}
                              </Text>
                            </View>
                        ))}
                      </View>
                    </View>
                ))
            )}
          </View>
        </ScrollView>
      </View>
  );
};

export default VentasScreen;