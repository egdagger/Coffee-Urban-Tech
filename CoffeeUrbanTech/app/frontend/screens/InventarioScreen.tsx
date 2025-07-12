import { Picker } from "@react-native-picker/picker";
import { LinearGradient } from "expo-linear-gradient";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
  KeyboardAvoidingView,
} from "react-native";
import { db } from "@/firebaseConfigWeb";
import { Product } from "../../firebaseData";

const { height: screenHeight } = Dimensions.get("window");

const categoriasPorTipo: Record<string, string[]> = {
  "Producto de cocina": ["Comida", "Postres", "Bebidas Preparadas", "Otros"],
  "Materia prima": ["Bebidas", "Ingredientes", "Envasados", "Otros"],
};

export default function InventarioScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    unitCost: "",
    stock: "",
    category: "Comida",
    productType: "Producto de cocina",
    inMenu: false,
  });

  const SUGERENCIA_UTILIDAD = 0.4;

  useEffect(() => {
    const q = query(collection(db, "products"), orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const productsData: Product[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        productsData.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          unitCost: data.unitCost,
          stock: data.stock,
          category: data.category,
          productType: data.productType,
          suggestedPrice: data.suggestedPrice || null,
          inMenu: data.inMenu || false,
          createdAt:
            data.createdAt instanceof Timestamp ? data.createdAt : null,
          updatedAt:
            data.updatedAt instanceof Timestamp ? data.updatedAt : null,
        });
      });
      setProducts(productsData);
    });

    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedProducts = {
    "Producto de cocina": filteredProducts.filter(
      (p) => p.productType === "Producto de cocina"
    ),
    "Materia prima": filteredProducts.filter(
      (p) => p.productType === "Materia prima"
    ),
  };

  const handleAddProduct = async () => {
    if (
      !newProduct.name ||
      !newProduct.price ||
      !newProduct.unitCost ||
      !newProduct.stock
    ) {
      Alert.alert(
        "Error",
        "Por favor, rellena todos los campos obligatorios: Nombre, Precio, Costo y Stock."
      );
      return;
    }

    try {
      const productData = {
        name: newProduct.name,
        description: newProduct.description,
        price: parseFloat(newProduct.price),
        unitCost: parseFloat(newProduct.unitCost),
        stock: parseInt(newProduct.stock),
        category: newProduct.category,
        productType: newProduct.productType,
        inMenu: newProduct.inMenu,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        suggestedPrice: parseFloat(newProduct.price),
      };

      await addDoc(collection(db, "products"), productData);
      Alert.alert("Producto agregado.");

      setNewProduct({
        name: "",
        description: "",
        price: "",
        unitCost: "",
        stock: "",
        category: "Comida",
        productType: "Producto de cocina",
        inMenu: false,
      });
      setShowAddModal(false);
    } catch (error) {
      Alert.alert("Error. Hubo un problema al agregar el producto.");
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct || !editingProduct.id) {
      Alert.alert("No hay producto seleccionado.");
      return;
    }

    if (
      !editingProduct.name ||
      !editingProduct.price ||
      !editingProduct.unitCost ||
      !editingProduct.stock
    ) {
      Alert.alert("Error, rellena los campos: Nombre, Precio, Costo y Stock.");
      return;
    }

    try {
      const productRef = doc(db, "products", editingProduct.id);

      const updatedData = {
        name: editingProduct.name,
        description: editingProduct.description,
        price: parseFloat(editingProduct.price.toString()),
        unitCost: parseFloat(editingProduct.unitCost.toString()),
        stock: parseInt(editingProduct.stock.toString()),
        category: editingProduct.category,
        productType: editingProduct.productType,
        inMenu: editingProduct.inMenu,
        updatedAt: serverTimestamp(),
        suggestedPrice: parseFloat(
          editingProduct.suggestedPrice?.toString() || "0"
        ),
      };

      await updateDoc(productRef, updatedData);
      Alert.alert("Producto actualizado.");
      setEditingProduct(null);
    } catch (error) {
      Alert.alert("Error. Por favor, intenta de nuevo.");
    }
  };

  const deleteProduct = async (productId: string) => {
    Alert.alert(
      "Confirmar Eliminación",
      "¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible.",
      [
        {
          text: "Cancelar",
          onPress: () => console.log("Eliminación cancelada"),
          style: "cancel",
        },
        {
          text: "Eliminar",
          onPress: async () => {
            try {
              const productRef = doc(db, "products", productId);
              await deleteDoc(productRef);
              Alert.alert("Producto eliminado correctamente.");
            } catch (error) {
              Alert.alert(
                "Hubo un problema al eliminar el producto. Inténtalo de nuevo."
              );
            }
          },
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  function redondearPrecio(precio: number) {
    return Math.round(precio * 2) / 2;
  }

  const handleCostoChange = (v: string) => {
    if (!v) {
      setNewProduct((prev) => ({ ...prev, unitCost: "", price: "" }));
      return;
    }
    const costo = parseFloat(v.replace(",", "."));
    if (isNaN(costo)) {
      setNewProduct((prev) => ({ ...prev, unitCost: v, price: "" }));
      return;
    }
    const precioSugerido = redondearPrecio(
      costo * (1 + SUGERENCIA_UTILIDAD)
    ).toString();
    setNewProduct((prev) => ({
      ...prev,
      unitCost: v,
      price: precioSugerido,
    }));
  };

  const handleEditCostoChange = (v: string) => {
    if (!editingProduct) return;
    if (!v) {
      setEditingProduct((prev) => ({
        ...prev!,
        unitCost: 0,
        price: 0,
        suggestedPrice: 0,
      }));
      return;
    }
    const costo = parseFloat(v.replace(",", "."));
    if (isNaN(costo)) {
      setEditingProduct((prev) => ({ ...prev!, unitCost: 0 }));
      return;
    }
    const precioSugerido = redondearPrecio(costo * (1 + SUGERENCIA_UTILIDAD));
    setEditingProduct((prev) => ({
      ...prev!,
      unitCost: costo,
      price: precioSugerido,
      suggestedPrice: precioSugerido,
    }));
  };

  return (
    <View className="flex-1 bg-white">
      <ScrollView
        className="p-4"
        contentContainerStyle={{ paddingBottom: 50 }}
        keyboardShouldPersistTaps="handled"
      >
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

          {Object.entries(groupedProducts).map(([productType, productos]) => (
            <View key={productType} className="mb-10">
              <View
                className={`flex-row items-center mb-4 px-4 py-2 rounded-lg ${
                  productType === "Producto de cocina"
                    ? "bg-amber-100 border-l-8 border-amber-700"
                    : "bg-green-100 border-l-8 border-green-700"
                }`}
              >
                <Text
                  className={`text-xl font-extrabold ${
                    productType === "Producto de cocina"
                      ? "text-amber-800"
                      : "text-green-800"
                  }`}
                >
                  {productType === "Producto de cocina"
                    ? "🍳 Productos de cocina"
                    : "🌱 Materias primas"}
                </Text>
              </View>
              {productos.length === 0 && (
                <Text className="text-gray-400 mb-2 ml-4">
                  No hay productos en esta categoría.
                </Text>
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
                      <View className="text-sm mt-2">
                        <Text>
                          <Text className="font-bold">Precio venta:</Text> $
                          {product.price.toFixed(2)}
                        </Text>
                        <Text>
                          <Text className="font-bold">Costo:</Text> $
                          {product.unitCost.toFixed(2)}
                        </Text>
                        <Text>
                          <Text
                            className={
                              product.price - product.unitCost < 0
                                ? "text-red-500"
                                : "text-green-700"
                            }
                          >
                            <Text className="font-bold text-gray-800">
                              Utilidad:
                            </Text>{" "}
                            ${(product.price - product.unitCost).toFixed(2)}
                          </Text>
                        </Text>
                        <Text>
                          <Text className="font-bold">Stock:</Text>{" "}
                          <Text
                            className={product.stock < 10 ? "text-red-500" : ""}
                          >
                            {product.stock}
                          </Text>
                        </Text>
                        <Text>
                          <Text className="font-bold">Categoría:</Text>{" "}
                          {product.category}
                        </Text>
                        <Text>
                          <Text className="font-bold">Tipo:</Text>{" "}
                          {product.productType}
                        </Text>
                        {product.suggestedPrice !== null && (
                          <Text>
                            <Text className="font-bold">Sugerido:</Text> $
                            {product.suggestedPrice?.toFixed(2)}
                          </Text>
                        )}
                        <Text>
                          <Text className="font-bold">En Menú:</Text>{" "}
                          {product.inMenu ? "Sí" : "No"}
                        </Text>
                        {product.createdAt && (
                          <Text>
                            <Text className="font-bold">Creado:</Text>{" "}
                            {product.createdAt?.toDate().toLocaleDateString()}
                          </Text>
                        )}
                        {product.updatedAt && (
                          <Text>
                            <Text className="font-bold">Actualizado:</Text>{" "}
                            {product.updatedAt?.toDate().toLocaleDateString()}
                          </Text>
                        )}
                      </View>
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
              <View className="h-1 bg-gray-200 rounded-full mt-6 mb-2" />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal para agregar producto */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View className="flex-1 bg-black/50 justify-center items-center">
            <ScrollView
              contentContainerStyle={{ paddingVertical: 20 }}
              style={{ maxHeight: screenHeight * 0.8, width: "90%" }}
              keyboardShouldPersistTaps="handled"
            >
              <View className="bg-white rounded-xl p-6">
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
                    onChangeText={(v) =>
                      setNewProduct({ ...newProduct, name: v })
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                    placeholder="Nombre"
                    placeholderTextColor="#888"
                  />
                  <Text className="mb-2 font-bold">Descripción</Text>
                  <TextInput
                    value={newProduct.description}
                    onChangeText={(v) =>
                      setNewProduct({ ...newProduct, description: v })
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                    placeholder="Descripción"
                    placeholderTextColor="#888"
                    multiline
                  />

                  <Text className="mb-2 font-bold">Costo por unidad ($)</Text>
                  <TextInput
                    value={newProduct.unitCost}
                    onChangeText={handleCostoChange}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                    placeholder="Costo por unidad"
                    placeholderTextColor="#888"
                    keyboardType="numeric"
                  />

                  <Text className="mb-2 font-bold">Precio venta ($)</Text>
                  <TextInput
                    value={newProduct.price}
                    onChangeText={(v) =>
                      setNewProduct({ ...newProduct, price: v })
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                    placeholder="Precio venta"
                    keyboardType="numeric"
                    placeholderTextColor="#888"
                  />

                  <Text className="mb-2 font-bold">
                    Precio venta sugerido ($)
                  </Text>
                  <View className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 bg-gray-100">
                    <Text className="text-lg text-gray-700">
                      {newProduct.price ? `$${newProduct.price}` : "--"}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500 mb-2">
                    El precio sugerido es un {SUGERENCIA_UTILIDAD * 100}% sobre
                    el costo por unidad.
                  </Text>
                  <Text className="mb-2 font-bold">Stock Inicial</Text>
                  <TextInput
                    value={newProduct.stock}
                    onChangeText={(v) =>
                      setNewProduct({ ...newProduct, stock: v })
                    }
                    className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                    placeholder="Stock"
                    keyboardType="numeric"
                    placeholderTextColor="#888"
                  />
                  <Text className="mb-2 font-bold">Tipo de Producto</Text>
                  <View className="border-2 border-gray-300 rounded-lg mb-4 overflow-hidden">
                    <Picker
                      selectedValue={newProduct.productType}
                      onValueChange={(v) => {
                        setNewProduct({
                          ...newProduct,
                          productType: v,
                          category: categoriasPorTipo[v][0],
                        });
                      }}
                      style={{
                        height: Platform.OS === "ios" ? 180 : 55,
                        width: "100%",
                      }}
                      mode="dropdown"
                    >
                      <Picker.Item
                        label="Producto de cocina"
                        value="Producto de cocina"
                      />
                      <Picker.Item
                        label="Materia prima"
                        value="Materia prima"
                      />
                    </Picker>
                  </View>
                  <Text className="mb-2 font-bold">Categoría</Text>
                  <View className="border-2 border-gray-300 rounded-lg mb-4 overflow-hidden">
                    <Picker
                      selectedValue={newProduct.category}
                      onValueChange={(v) =>
                        setNewProduct({ ...newProduct, category: v })
                      }
                      style={{
                        height: Platform.OS === "ios" ? 180 : 55,
                        width: "100%",
                      }}
                      mode="dropdown"
                    >
                      {categoriasPorTipo[newProduct.productType].map((cat) => (
                        <Picker.Item key={cat} label={cat} value={cat} />
                      ))}
                    </Picker>
                  </View>
                  <Text className="mb-2 font-bold">¿En el Menú?</Text>
                  <View className="border-2 border-gray-300 rounded-lg mb-4 overflow-hidden">
                    <Picker
                      selectedValue={newProduct.inMenu ? "true" : "false"}
                      onValueChange={(v) =>
                        setNewProduct({ ...newProduct, inMenu: v === "true" })
                      }
                      style={{
                        height: Platform.OS === "ios" ? 180 : 55,
                        width: "100%",
                      }}
                      mode="dropdown"
                    >
                      <Picker.Item label="Sí" value="true" />
                      <Picker.Item label="No" value="false" />
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
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Modal para editar producto */}
      <Modal visible={!!editingProduct} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View className="flex-1 bg-black/50 justify-center items-center">
            <ScrollView
              contentContainerStyle={{ paddingVertical: 20 }}
              style={{ maxHeight: screenHeight * 0.8, width: "90%" }}
              keyboardShouldPersistTaps="handled"
            >
              <View className="bg-white rounded-xl p-6">
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
                      placeholderTextColor="#888"
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
                      placeholderTextColor="#888"
                    />
                    <Text className="mb-2 font-bold">Costo por unidad ($)</Text>
                    <TextInput
                      value={String(editingProduct.unitCost)}
                      onChangeText={handleEditCostoChange}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4"
                      placeholder="Costo por unidad"
                      keyboardType="numeric"
                      placeholderTextColor="#888"
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
                      placeholderTextColor="#888"
                    />
                    <Text className="mb-2 font-bold">
                      Precio venta sugerido ($)
                    </Text>
                    <View className="w-full p-3 border-2 border-gray-300 rounded-lg mb-4 bg-gray-100">
                      <Text className="text-lg text-gray-700">
                        {editingProduct.suggestedPrice !== null
                          ? `$${editingProduct.suggestedPrice?.toFixed(2)}`
                          : "--"}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-500 mb-2">
                      El precio sugerido es un {SUGERENCIA_UTILIDAD * 100}%
                      sobre el costo por unidad.
                    </Text>
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
                      placeholderTextColor="#888"
                    />
                    <Text className="mb-2 font-bold">Tipo de Producto</Text>
                    <View className="border-2 border-gray-300 rounded-lg mb-4 overflow-hidden">
                      <Picker
                        selectedValue={editingProduct.productType}
                        onValueChange={(v) => {
                          const newCategory = categoriasPorTipo[v][0];
                          setEditingProduct({
                            ...editingProduct,
                            productType: v,
                            category: newCategory,
                          });
                        }}
                        style={{
                          height: Platform.OS === "ios" ? 180 : 55,
                          width: "100%",
                        }}
                        mode="dropdown"
                      >
                        <Picker.Item
                          label="Producto de cocina"
                          value="Producto de cocina"
                        />
                        <Picker.Item
                          label="Materia prima"
                          value="Materia prima"
                        />
                      </Picker>
                    </View>
                    <Text className="mb-2 font-bold">Categoría</Text>
                    <View className="border-2 border-gray-300 rounded-lg mb-4 overflow-hidden">
                      <Picker
                        selectedValue={editingProduct.category}
                        onValueChange={(v) =>
                          setEditingProduct({ ...editingProduct, category: v })
                        }
                        style={{
                          height: Platform.OS === "ios" ? 180 : 55,
                          width: "100%",
                        }}
                        mode="dropdown"
                      >
                        {categoriasPorTipo[editingProduct.productType].map(
                          (cat) => (
                            <Picker.Item key={cat} label={cat} value={cat} />
                          )
                        )}
                      </Picker>
                    </View>
                    <Text className="mb-2 font-bold">¿En el Menú?</Text>
                    <View className="border-2 border-gray-300 rounded-lg mb-4 overflow-hidden">
                      <Picker
                        selectedValue={editingProduct.inMenu ? "true" : "false"}
                        onValueChange={(v) =>
                          setEditingProduct({
                            ...editingProduct,
                            inMenu: v === "true",
                          })
                        }
                        style={{
                          height: Platform.OS === "ios" ? 180 : 55,
                          width: "100%",
                        }}
                        mode="dropdown"
                      >
                        <Picker.Item label="Sí" value="true" />
                        <Picker.Item label="No" value="false" />
                      </Picker>
                    </View>
                    <TouchableOpacity
                      onPress={handleEditProduct}
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
                          Actualizar Producto
                        </Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
