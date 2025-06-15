import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";

const initialProducts = [
  {
    id: 1,
    name: "Café",
    description: "Café en grano premium",
    price: 120,
    stock: 8,
    category: "Bebidas",
  },
  {
    id: 2,
    name: "Té",
    description: "Té verde importado",
    price: 80,
    stock: 15,
    category: "Bebidas",
  },
];

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
};

export default function InventarioScreen() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "Bebidas",
  });

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddProduct = () => {
    const product = {
      id: Date.now(),
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      stock: parseInt(newProduct.stock),
      category: newProduct.category,
    };
    setProducts([...products, product]);
    setNewProduct({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "Bebidas",
    });
    setShowAddModal(false);
  };

  const handleEditProduct = () => {
    if (!editingProduct) return;
    const updatedProducts = products.map((p) =>
      p.id === editingProduct.id ? editingProduct : p
    );
    setProducts(updatedProducts);
    setEditingProduct(null);
  };

  const deleteProduct = (productId: number) => {
    setProducts(products.filter((p) => p.id !== productId));
  };

  return (
    <ScrollView className="flex-1 bg-white p-4">
      <View className="bg-white rounded-xl p-5 shadow border border-gray-100">
        <Text className="text-amber-800 mb-4 text-lg border-b-2 border-gray-100 pb-2 font-bold">
          Gestión de Inventario
        </Text>

        <TouchableOpacity
          onPress={() => setShowAddModal(true)}
          className="w-full rounded-lg mb-5 overflow-hidden"
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#78350f", "#b45309"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="w-full px-6 py-3 rounded-lg"
          >
            <Text className="text-white text-center font-bold">
              Agregar Producto
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        <View className="mb-5">
          <TextInput
            placeholder="Buscar en inventario..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-sm"
            placeholderTextColor="#888"
          />
        </View>

        <View>
          {filteredProducts.map((product) => (
            <View
              key={product.id}
              className="bg-gray-100 rounded-lg p-4 mb-2 border-l-4 border-amber-800"
            >
              <View className="flex-row justify-between items-start">
                <View className="flex-1">
                  <Text className="text-amber-800 mb-1 font-bold">
                    {product.name}
                  </Text>
                  <Text className="text-gray-600 text-sm">
                    {product.description}
                  </Text>
                  <Text className="text-sm mt-2">
                    <Text className="font-bold">Precio:</Text> $
                    {product.price.toFixed(2)} |{" "}
                    <Text className="font-bold">Stock:</Text>{" "}
                    <Text className={product.stock < 10 ? "text-red-500" : ""}>
                      {product.stock}
                    </Text>{" "}
                    | <Text className="font-bold">Categoría:</Text>{" "}
                    {product.category}
                  </Text>
                </View>
                <View className="flex flex-row gap-2 ml-2">
                  <TouchableOpacity
                    onPress={() => setEditingProduct({ ...product })}
                    className="bg-blue-500 px-3 py-1 rounded mb-1"
                  >
                    <Text className="text-white text-sm">Editar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => deleteProduct(product.id)}
                    className="bg-red-500 px-3 py-1 rounded"
                  >
                    <Text className="text-white text-sm">Eliminar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Modal Agregar Producto */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-xl p-6 w-11/12 max-w-md">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold">Agregar Producto</Text>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Text className="text-gray-500 text-xl">×</Text>
              </Pressable>
            </View>
            <View>
              <Text className="mb-2 font-bold">Nombre</Text>
              <TextInput
                value={newProduct.name}
                onChangeText={(v) => setNewProduct({ ...newProduct, name: v })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                placeholder="Nombre"
              />
              <Text className="mb-2 font-bold">Descripción</Text>
              <TextInput
                value={newProduct.description}
                onChangeText={(v) =>
                  setNewProduct({ ...newProduct, description: v })
                }
                className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                placeholder="Descripción"
                multiline
              />
              <Text className="mb-2 font-bold">Precio ($)</Text>
              <TextInput
                value={newProduct.price}
                onChangeText={(v) => setNewProduct({ ...newProduct, price: v })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                placeholder="Precio"
                keyboardType="numeric"
              />
              <Text className="mb-2 font-bold">Stock Inicial</Text>
              <TextInput
                value={newProduct.stock}
                onChangeText={(v) => setNewProduct({ ...newProduct, stock: v })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                placeholder="Stock"
                keyboardType="numeric"
              />
              <Text className="mb-2 font-bold">Categoría</Text>
              <View className="border-2 border-gray-300 rounded-lg mb-4">
                <Picker
                  selectedValue={newProduct.category}
                  onValueChange={(v) =>
                    setNewProduct({ ...newProduct, category: v })
                  }
                  style={{ height: 40 }}
                >
                  <Picker.Item label="Bebidas" value="Bebidas" />
                  <Picker.Item label="Comida" value="Comida" />
                  <Picker.Item label="Postres" value="Postres" />
                  <Picker.Item label="Otros" value="Otros" />
                </Picker>
              </View>

              <TouchableOpacity
                onPress={handleAddProduct}
                className="w-full rounded-lg mb-5 overflow-hidden"
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#78350f", "#b45309"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="w-full px-6 py-3 rounded-lg"
                >
                  <Text className="text-white text-center font-bold">
                    Agregar Producto
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Editar Producto */}
      <Modal visible={!!editingProduct} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white rounded-xl p-6 w-11/12 max-w-md">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold">Editar Producto</Text>
              <Pressable onPress={() => setEditingProduct(null)}>
                <Text className="text-gray-500 text-xl">×</Text>
              </Pressable>
            </View>
            {editingProduct && (
              <View>
                <Text className="mb-2 font-bold">Nombre</Text>
                <TextInput
                  value={editingProduct.name}
                  onChangeText={(v) =>
                    setEditingProduct({ ...editingProduct, name: v })
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                  placeholder="Nombre"
                />
                <Text className="mb-2 font-bold">Descripción</Text>
                <TextInput
                  value={editingProduct.description}
                  onChangeText={(v) =>
                    setEditingProduct({ ...editingProduct, description: v })
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                  placeholder="Descripción"
                  multiline
                />
                <Text className="mb-2 font-bold">Precio ($)</Text>
                <TextInput
                  value={String(editingProduct.price)}
                  onChangeText={(v) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: parseFloat(v) || 0,
                    })
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                  placeholder="Precio"
                  keyboardType="numeric"
                />
                <Text className="mb-2 font-bold">Stock</Text>
                <TextInput
                  value={String(editingProduct.stock)}
                  onChangeText={(v) =>
                    setEditingProduct({
                      ...editingProduct,
                      stock: parseInt(v) || 0,
                    })
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                  placeholder="Stock"
                  keyboardType="numeric"
                />
                <Text className="mb-2 font-bold">Categoría</Text>
                <View className="border-2 border-gray-300 rounded-lg mb-4">
                  <Picker
                    selectedValue={editingProduct.category}
                    onValueChange={(v) =>
                      setEditingProduct({ ...editingProduct, category: v })
                    }
                    style={{ height: 40 }}
                  >
                    <Picker.Item label="Bebidas" value="Bebidas" />
                    <Picker.Item label="Comida" value="Comida" />
                    <Picker.Item label="Postres" value="Postres" />
                    <Picker.Item label="Otros" value="Otros" />
                  </Picker>
                </View>
                <TouchableOpacity
                  onPress={handleEditProduct}
                  className="w-full bg-gradient-to-r from-amber-800 to-amber-700 px-6 py-3 rounded-lg font-bold"
                >
                  <Text className="text-white text-center font-bold">
                    Actualizar Producto
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
