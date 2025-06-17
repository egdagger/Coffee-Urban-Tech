import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const initialProducts = [
  {
    id: 1,
    name: "Café",
    description: "Café en grano premium",
    price: 120,
    costo: 80,
    stock: 8,
    category: "Bebidas",
    tipo: "Materia prima", // Nuevo campo
  },
  {
    id: 2,
    name: "Té",
    description: "Té verde importado",
    price: 80,
    costo: 50,
    stock: 15,
    category: "Bebidas",
    tipo: "Materia prima",
  },
];

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  costo: number;
  stock: number;
  category: string;
  tipo: string; // Nuevo campo
};

const categoriasPorTipo: Record<string, string[]> = {
  "Producto de cocina": ["Comida", "Postres", "Otros"],
  "Materia prima": ["Bebidas", "Ingredientes", "Otros"],
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
    costo: "",
    stock: "",
    category: "Comida",
    tipo: "Producto de cocina", // Valor por defecto
  });

  const SUGERENCIA_UTILIDAD = 0.4; // 40% de utilidad sugerida

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Agrupa productos por tipo
  const groupedProducts = {
    "Producto de cocina": filteredProducts.filter((p) => p.tipo === "Producto de cocina"),
    "Materia prima": filteredProducts.filter((p) => p.tipo === "Materia prima"),
  };

  const handleAddProduct = () => {
    const product = {
      id: Date.now(),
      name: newProduct.name,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      costo: parseFloat(newProduct.costo),
      stock: parseInt(newProduct.stock),
      category: newProduct.category,
      tipo: newProduct.tipo,
    };
    setProducts([...products, product]);
    setNewProduct({
      name: "",
      description: "",
      price: "",
      costo: "",
      stock: "",
      category: categoriasPorTipo[newProduct.tipo][0],
      tipo: "Producto de cocina",
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

  function redondearPrecio(precio: number) {
    return Math.round(precio * 2) / 2;
  }

  const handleCostoChange = (v: string) => {
    if (!v) {
      setNewProduct((prev) => ({ ...prev, costo: "", price: "" }));
      return;
    }
    const costo = parseFloat(v.replace(",", "."));
    if (isNaN(costo)) {
      setNewProduct((prev) => ({ ...prev, costo: v, price: "" }));
      return;
    }
    const precioSugerido = redondearPrecio(costo * (1 + SUGERENCIA_UTILIDAD)).toString();
    setNewProduct((prev) => ({
      ...prev,
      costo: v,
      price: precioSugerido,
    }));
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

        {/* Mostrar productos agrupados */}
        {Object.entries(groupedProducts).map(([tipo, productos]) => (
          <View key={tipo} className="mb-10">
            {/* Encabezado visual destacado */}
            <View
              className={`flex-row items-center mb-4 px-4 py-2 rounded-lg ${
                tipo === "Producto de cocina"
                  ? "bg-amber-100 border-l-8 border-amber-700"
                  : "bg-green-100 border-l-8 border-green-700"
              }`}
            >
              <Text
                className={`text-xl font-extrabold ${
                  tipo === "Producto de cocina" ? "text-amber-800" : "text-green-800"
                }`}
              >
                {tipo === "Producto de cocina" ? "🍳 Productos de cocina" : "🌱 Materias primas"}
              </Text>
            </View>
            {productos.length === 0 && (
              <Text className="text-gray-400 mb-2 ml-4">No hay productos en esta categoría.</Text>
            )}
            {productos.map((product) => (
              <View
                key={product.id}
                className="bg-white rounded-lg p-4 mb-2 ml-2 mr-2 shadow border-l-4 border-amber-800"
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
                      <Text className="font-bold">Precio venta:</Text> ${product.price.toFixed(2)} |{" "}
                      <Text className="font-bold">Costo:</Text> ${product.costo.toFixed(2)} |{" "}
                      <Text className="font-bold">Utilidad:</Text>{" "}
                      <Text className={product.price - product.costo < 0 ? "text-red-500" : "text-green-700"}>
                        ${ (product.price - product.costo).toFixed(2) }
                      </Text>
                      {" | "}
                      <Text className="font-bold">Stock:</Text>{" "}
                      <Text className={product.stock < 10 ? "text-red-500" : ""}>
                        {product.stock}
                      </Text>{" "}
                      | <Text className="font-bold">Categoría:</Text> {product.category}
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
            {/* Línea divisoria visual entre categorías */}
            <View className="h-1 bg-gray-200 rounded-full mt-6 mb-2" />
          </View>
        ))}
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

              <Text className="mb-2 font-bold">Costo ($)</Text>
              <TextInput
                value={newProduct.costo}
                onChangeText={handleCostoChange}
                className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                placeholder="Costo"
                keyboardType="numeric"
              />
              
              <Text className="mb-2 font-bold">Precio venta ($)</Text>
              <TextInput
                value={newProduct.price}
                onChangeText={(v) => setNewProduct({ ...newProduct, price: v })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                placeholder="Precio venta"
                keyboardType="numeric"
              />
              
              <Text className="mb-2 font-bold">Precio venta sugerido ($)</Text>
              <View className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 bg-gray-100">
                <Text className="text-lg text-gray-700">
                  {newProduct.price ? `$${newProduct.price}` : "--"}
                </Text>
              </View>
              <Text className="text-xs text-gray-500 mb-2">
                El precio sugerido es un {SUGERENCIA_UTILIDAD * 100}% sobre el costo.
              </Text>
              <Text className="mb-2 font-bold">Stock Inicial</Text>
              <TextInput
                value={newProduct.stock}
                onChangeText={(v) => setNewProduct({ ...newProduct, stock: v })}
                className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                placeholder="Stock"
                keyboardType="numeric"
              />
              <Text className="mb-2 font-bold">Tipo</Text>
              <View className="border-2 border-gray-300 rounded-lg mb-4">
                <Picker
                  selectedValue={newProduct.tipo}
                  onValueChange={(v) => {
                    setNewProduct({
                      ...newProduct,
                      tipo: v,
                      category: categoriasPorTipo[v][0], // Cambia la categoría al primer valor disponible
                    });
                  }}
                  style={{ height: 40 }}
                >
                  <Picker.Item label="Producto de cocina" value="Producto de cocina" />
                  <Picker.Item label="Materia prima" value="Materia prima" />
                </Picker>
              </View>
              <Text className="mb-2 font-bold">Categoría</Text>
              <View className="border-2 border-gray-300 rounded-lg mb-4">
                <Picker
                  selectedValue={newProduct.category}
                  onValueChange={(v) =>
                    setNewProduct({ ...newProduct, category: v })
                  }
                  style={{ height: 40 }}
                >
                  {categoriasPorTipo[newProduct.tipo].map((cat) => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
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
                <Text className="mb-2 font-bold">Precio venta ($)</Text>
                <TextInput
                  value={String(editingProduct.price)}
                  onChangeText={(v) =>
                    setEditingProduct({
                      ...editingProduct,
                      price: parseFloat(v) || 0,
                    })
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                  placeholder="Precio venta"
                  keyboardType="numeric"
                />
                <Text className="mb-2 font-bold">Costo ($)</Text>
                <TextInput
                  value={String(editingProduct.costo)}
                  onChangeText={(v) =>
                    setEditingProduct({
                      ...editingProduct,
                      costo: parseFloat(v) || 0,
                    })
                  }
                  className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                  placeholder="Costo"
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
                <Text className="mb-2 font-bold">Tipo</Text>
                <View className="border-2 border-gray-300 rounded-lg mb-4">
                  <Picker
                    selectedValue={editingProduct.tipo}
                    onValueChange={(v) =>
                      setEditingProduct({ ...editingProduct, tipo: v })
                    }
                    style={{ height: 40 }}
                  >
                    <Picker.Item label="Producto de cocina" value="Producto de cocina" />
                    <Picker.Item label="Materia prima" value="Materia prima" />
                  </Picker>
                </View>
                <Text className="mb-2 font-bold">Categoría</Text>
                <View className="border-2 border-gray-300 rounded-lg mb-4">
                  <Picker
                    selectedValue={editingProduct.category}
                    onValueChange={(v) =>
                      setEditingProduct({ ...editingProduct, category: v })
                    }
                    style={{ height: 40 }}
                  >
                    {categoriasPorTipo[editingProduct.tipo].map((cat) => (
                      <Picker.Item key={cat} label={cat} value={cat} />
                    ))}
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
