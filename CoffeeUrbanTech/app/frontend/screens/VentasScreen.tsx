import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
}

interface SaleItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Sale {
  id: number;
  date: string;
  items: SaleItem[];
  total: number;
}

const VentasScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Café Americano",
      description: "Café negro tradicional aromático",
      price: 2.5,
      stock: 50,
      category: "Bebidas",
    },
    {
      id: 2,
      name: "Cappuccino",
      description: "Café con leche espumosa cremosa",
      price: 3.0,
      stock: 30,
      category: "Bebidas",
    },
    {
      id: 3,
      name: "Latte",
      description: "Café con leche suave y sedosa",
      price: 3.25,
      stock: 25,
      category: "Bebidas",
    },
    {
      id: 4,
      name: "Hamburguesa Clásica",
      description: "Hamburguesa con queso, lechuga y tomate",
      price: 8.5,
      stock: 20,
      category: "Comida",
    },
    {
      id: 5,
      name: "Hamburguesa BBQ",
      description: "Hamburguesa con salsa barbacoa y bacon",
      price: 9.75,
      stock: 15,
      category: "Comida",
    },
    {
      id: 6,
      name: "Papas Fritas",
      description: "Papas crujientes con sal marina",
      price: 3.5,
      stock: 40,
      category: "Comida",
    },
    {
      id: 7,
      name: "Brownie",
      description: "Brownie de chocolate con nueces",
      price: 4.0,
      stock: 18,
      category: "Postres",
    },
    {
      id: 8,
      name: "Cheesecake",
      description: "Tarta de queso con frutos rojos",
      price: 5.25,
      stock: 12,
      category: "Postres",
    },
    {
      id: 9,
      name: "Croissant",
      description: "Croissant mantecoso recién horneado",
      price: 2.75,
      stock: 35,
      category: "Otros",
    },
    {
      id: 10,
      name: "Sandwich Club",
      description: "Sandwich de pollo, bacon y vegetales",
      price: 7.25,
      stock: 22,
      category: "Comida",
    },
  ]);

  const [sales, setSales] = useState<Sale[]>([]);
  const [currentSale, setCurrentSale] = useState<SaleItem[]>([]);
  const [nextSaleId, setNextSaleId] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(
    (product) =>
      product.stock > 0 &&
      (product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const addToSale = (productId: number) => {
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

  const updateQuantity = (productId: number, change: number) => {
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

  const removeFromSale = (productId: number) => {
    const updatedSale = currentSale.filter(
      (item) => item.productId !== productId
    );
    setCurrentSale(updatedSale);
  };

  const completeSale = () => {
    if (currentSale.length === 0) {
      Alert.alert("❌ Error", "No hay productos en la venta");
      return;
    }

    const total = currentSale.reduce((sum, item) => sum + item.subtotal, 0);

    const sale: Sale = {
      id: nextSaleId,
      date: new Date().toISOString(),
      items: [...currentSale],
      total: total,
    };

    setSales((prevSales) => [...prevSales, sale]);
    setNextSaleId((prev) => prev + 1);

    // Update inventory
    const updatedProducts = products.map((product) => {
      const saleItem = currentSale.find(
        (item) => item.productId === product.id
      );
      if (saleItem) {
        return { ...product, stock: product.stock - saleItem.quantity };
      }
      return product;
    });
    setProducts(updatedProducts);

    setCurrentSale([]);
    Alert.alert("🎉 Éxito", `Venta completada: $${total.toFixed(2)}`);
  };

  const clearSale = () => {
    if (currentSale.length > 0) {
      setCurrentSale([]);
    }
  };

  const getTotalAmount = () => {
    return currentSale.reduce((sum, item) => sum + item.subtotal, 0);
  };

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

          {/* Sale Items */}
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

          {/* Total Section */}
          {currentSale.length > 0 && (
            <View className="bg-amber-800 p-6 rounded-2xl mb-5">
              <Text className="text-white text-3xl font-bold mb-5">
                💰 Total: ${getTotalAmount().toFixed(2)}
              </Text>
              <View className="flex-row justify-between">
                <TouchableOpacity
                  className="bg-green-500 px-6 py-3 rounded-xl flex-1 mr-2"
                  onPress={completeSale}
                >
                  <Text className="text-white text-sm font-bold text-center">
                    ✅ Completar Venta
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className="bg-gray-500 px-6 py-3 rounded-xl flex-1 ml-2"
                  onPress={clearSale}
                >
                  <Text className="text-white text-sm font-bold text-center">
                    🗑️ Limpiar
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Historial de Ventas */}
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
            sales
              .slice(-10)
              .reverse()
              .map((sale) => (
                <View
                  key={sale.id}
                  className="bg-green-50 rounded-xl p-5 mb-4 border-l-4 border-green-500"
                >
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="font-bold text-base">
                      🧾 Venta #{sale.id}
                    </Text>
                    <Text className="text-green-600 font-bold text-lg">
                      💰 ${sale.total.toFixed(2)}
                    </Text>
                  </View>

                  <Text className="text-gray-600 text-sm mb-4">
                    📅 {new Date(sale.date).toLocaleString()}
                  </Text>

                  <View className="bg-white bg-opacity-70 p-4 rounded-lg">
                    <Text className="font-bold text-sm mb-2">
                      📝 Productos vendidos:
                    </Text>
                    {sale.items.map((item, index) => (
                      <View
                        key={index}
                        className="flex-row justify-between py-1 border-b border-gray-200"
                      >
                        <Text className="text-sm">
                          • {item.name} x{item.quantity}
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
