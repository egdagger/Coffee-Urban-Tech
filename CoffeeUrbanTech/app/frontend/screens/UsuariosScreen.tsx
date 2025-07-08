import {Picker} from "@react-native-picker/picker";
import {LinearGradient} from "expo-linear-gradient";
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
    updateDoc
} from "firebase/firestore";
import React, {useEffect, useState} from "react";
import {
    Modal,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Platform,
} from "react-native";
import {db} from '@/firebaseConfigWeb';

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: "admin" | "cajero";
    isActive: boolean;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
}

const CustomAlert = ({
                         visible,
                         title,
                         message,
                         onClose
                     }: {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
}) => {
    if (!visible) return null;

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View className="flex-1 bg-black/50 justify-center items-center">
                <View className="bg-white p-6 rounded-xl w-11/12 max-w-md">
                    <Text className="text-lg font-bold mb-4 text-center">{title}</Text>
                    <Text className="text-gray-700 mb-6 text-center">{message}</Text>
                    <TouchableOpacity
                        onPress={onClose}
                        className="bg-amber-700 py-3 rounded-lg"
                    >
                        <Text className="text-white text-center font-bold">OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

export default function UsuariosScreen() {
    const [users, setUsers] = useState<User[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [showAlert, setShowAlert] = useState(false);
    const [alertConfig, setAlertConfig] = useState({title: "", message: ""});
    const [newUser, setNewUser] = useState({
        name: "",
        email: "",
        phone: "",
        role: "cajero" as "admin" | "cajero",
        isActive: true,
        password: "",
        confirmPassword: "",
    });

    // Estado para el modal de edición (incluye contraseña)
    const [editUserForm, setEditUserForm] = useState({
        name: "",
        email: "",
        phone: "",
        role: "cajero" as "admin" | "cajero",
        isActive: true,
        password: "",
        confirmPassword: "",
        changePassword: false, // Flag para saber si quiere cambiar la contraseña
    });

    useEffect(() => {
        const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const usersData: User[] = [];
            snapshot.forEach((docu) => {
                const data = docu.data();
                usersData.push({
                    id: docu.id,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    role: data.role,
                    isActive: data.isActive,
                    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
                    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : null,
                });
            });
            setUsers(usersData);
        });
        return () => unsubscribe();
    }, []);

    const showCustomAlert = (title: string, message: string) => {
        setAlertConfig({title, message});
        setShowAlert(true);
    };

    const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const validatePhone = (phone: string) => /^[\d\-\(\)\s\+]+$/.test(phone) && phone.length >= 10;
    const validatePassword = (password: string) => {
        if (password.length < 6) return false;
        if (!/(?=.*[a-z])/.test(password)) return false; // Al menos una minúscula
        if (!/(?=.*[A-Z])/.test(password)) return false; // Al menos una mayúscula
        if (!/(?=.*\d)/.test(password)) return false; // Al menos un número
        return true;
    };

    const handleAddUser = async () => {
        // Validaciones básicas
        if (!newUser.name || !newUser.email || !newUser.phone || !newUser.password || !newUser.confirmPassword) {
            showCustomAlert("Error", "Completa todos los campos");
            return;
        }

        if (!validateEmail(newUser.email)) {
            showCustomAlert("Error", "El email no tiene un formato válido");
            return;
        }

        if (!validatePhone(newUser.phone)) {
            showCustomAlert("Error", "El teléfono debe tener al menos 10 caracteres y solo números, espacios, guiones y paréntesis");
            return;
        }

        if (!validatePassword(newUser.password)) {
            showCustomAlert("Error", "La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, una minúscula y un número");
            return;
        }

        if (newUser.password !== newUser.confirmPassword) {
            showCustomAlert("Error", "Las contraseñas no coinciden");
            return;
        }

        try {
            const data = {
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                role: newUser.role,
                isActive: newUser.isActive,
                password: newUser.password, // En producción, deberías hashear la contraseña
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            await addDoc(collection(db, "users"), data);
            setShowAddModal(false);
            setNewUser({
                name: "",
                email: "",
                phone: "",
                role: "cajero",
                isActive: true,
                password: "",
                confirmPassword: ""
            });
            showCustomAlert("Éxito", "Usuario agregado correctamente");
        } catch (err) {
            showCustomAlert("Error", "No se pudo agregar el usuario");
        }
    };

    const handleEditUser = async () => {
        if (!editingUser) return;

        // Validaciones básicas
        if (!editUserForm.name || !editUserForm.email || !editUserForm.phone) {
            showCustomAlert("Error", "Completa todos los campos obligatorios");
            return;
        }

        if (!validateEmail(editUserForm.email)) {
            showCustomAlert("Error", "El email no tiene un formato válido");
            return;
        }

        if (!validatePhone(editUserForm.phone)) {
            showCustomAlert("Error", "El teléfono debe tener al menos 10 caracteres y solo números, espacios, guiones y paréntesis");
            return;
        }

        // Validar contraseña si se quiere cambiar
        if (editUserForm.changePassword) {
            if (!editUserForm.password || !editUserForm.confirmPassword) {
                showCustomAlert("Error", "Completa los campos de contraseña");
                return;
            }

            if (!validatePassword(editUserForm.password)) {
                showCustomAlert("Error", "La contraseña debe tener al menos 6 caracteres, incluir una mayúscula, una minúscula y un número");
                return;
            }

            if (editUserForm.password !== editUserForm.confirmPassword) {
                showCustomAlert("Error", "Las contraseñas no coinciden");
                return;
            }
        }

        try {
            const updateData: any = {
                name: editUserForm.name,
                email: editUserForm.email,
                phone: editUserForm.phone,
                role: editUserForm.role,
                isActive: editUserForm.isActive,
                updatedAt: serverTimestamp(),
            };

            // Solo actualizar contraseña si se marcó el checkbox
            if (editUserForm.changePassword) {
                updateData.password = editUserForm.password; // En producción, hashear la contraseña
            }

            await updateDoc(doc(db, "users", editingUser.id), updateData);
            setEditingUser(null);
            showCustomAlert("Éxito", "Usuario actualizado correctamente");
        } catch (err) {
            showCustomAlert("Error", "No se pudo actualizar el usuario");
        }
    };

    const openEditModal = (user: User) => {
        setEditingUser(user);
        setEditUserForm({
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            isActive: user.isActive,
            password: "",
            confirmPassword: "",
            changePassword: false,
        });
    };

    const filteredUsers = users.filter((u) =>
        `${u.name}${u.email}${u.phone}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedUsers = {
        admin: filteredUsers.filter((u) => u.role === "admin"),
        cajero: filteredUsers.filter((u) => u.role === "cajero"),
    };

    const deleteUserConfirmed = async () => {
        if (!deleteId) return;
        try {
            await deleteDoc(doc(db, "users", deleteId));
            setDeleteId(null);
            showCustomAlert("Éxito", "Usuario eliminado correctamente");
        } catch (err) {
            showCustomAlert("Error", "No se pudo eliminar el usuario");
        }
    };

    const toggleUserStatus = async (id: string, current: boolean) => {
        try {
            await updateDoc(doc(db, "users", id), {
                isActive: !current,
                updatedAt: serverTimestamp(),
            });
            showCustomAlert("Éxito", `Usuario ${!current ? "activado" : "desactivado"} correctamente`);
        } catch (err) {
            showCustomAlert("Error", "No se pudo cambiar el estado del usuario");
        }
    };

    const pickerStyle = Platform.OS === "web" ? {height: 42, paddingVertical: 0} : {};

    return (
        <ScrollView className="flex-1 bg-white p-4">
            <View className="bg-white rounded-xl p-5 shadow border border-gray-100">
                <Text className="text-amber-800 text-lg font-bold mb-4">Gestión de Usuarios</Text>

                <TouchableOpacity
                    onPress={() => setShowAddModal(true)}
                    className="w-full rounded-lg mb-5 overflow-hidden"
                    activeOpacity={0.8}
                >
                    <LinearGradient
                        colors={["#78350f", "#b45309"]}
                        className="w-full px-6 py-3 rounded-lg"
                    >
                        <Text className="text-white text-center font-bold">Agregar Usuario</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <TextInput
                    placeholder="Buscar por nombre, email o teléfono"
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    className="border border-gray-300 rounded-lg p-3 mb-5"
                />

                {Object.entries(groupedUsers).map(([role, list]) => (
                    <View key={role} className="mb-6">
                        <Text
                            className={`text-lg font-bold mb-2 ${role === "admin" ? "text-red-700" : "text-blue-700"}`}>
                            {role === "admin" ? "👑 Administradores" : "💼 Cajeros"}
                        </Text>
                        {list.map((u) => (
                            <View key={u.id} className="border p-4 mb-2 rounded-lg border-l-4 border-amber-600">
                                <Text className="font-bold text-lg">{u.name}</Text>
                                <Text>Email: {u.email}</Text>
                                <Text>Tel: {u.phone}</Text>
                                <Text>Rol: {u.role}</Text>
                                <Text>Estado: {u.isActive ? "Activo" : "Inactivo"}</Text>

                                <View className="flex-row mt-2 gap-2">
                                    <TouchableOpacity onPress={() => openEditModal(u)}
                                                      className="bg-blue-500 px-3 py-1 rounded">
                                        <Text className="text-white">Editar</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => toggleUserStatus(u.id, u.isActive)}
                                                      className={`px-3 py-1 rounded ${u.isActive ? "bg-orange-500" : "bg-green-600"}`}>
                                        <Text
                                            className="text-white font-bold">{u.isActive ? "Desactivar" : "Activar"}</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={() => setDeleteId(u.id)}
                                                      className="bg-red-500 px-3 py-1 rounded">
                                        <Text className="text-white">Eliminar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                ))}
            </View>

            {/* Alert personalizado */}
            <CustomAlert
                visible={showAlert}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => setShowAlert(false)}
            />

            {/* Modal confirmación de eliminación */}
            <Modal visible={!!deleteId} transparent animationType="fade">
                <View className="flex-1 bg-black/50 justify-center items-center">
                    <View className="bg-white p-6 rounded-xl w-11/12 max-w-md">
                        <Text className="text-lg font-bold mb-4">¿Eliminar este usuario?</Text>
                        <View className="flex-row justify-between">
                            <TouchableOpacity onPress={() => setDeleteId(null)}
                                              className="px-6 py-2 bg-gray-300 rounded-lg">
                                <Text>Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={deleteUserConfirmed} className="px-6 py-2 bg-red-600 rounded-lg">
                                <Text className="text-white">Eliminar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal Agregar Usuario */}
            <Modal visible={showAddModal} transparent animationType="fade">
                <View className="flex-1 bg-black/50 justify-center items-center">
                    <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}
                                className="w-full">
                        <View className="bg-white p-6 rounded-xl w-11/12 max-w-md relative my-4">
                            <TouchableOpacity
                                onPress={() => setShowAddModal(false)}
                                className="absolute top-3 right-3 z-10"
                            >
                                <Text className="text-xl font-bold text-gray-500 mt-2 mr-3">✕</Text>
                            </TouchableOpacity>

                            <Text className="text-lg font-bold mb-4">Agregar Usuario</Text>

                            <Text className="text-sm font-medium mb-1 text-gray-700">Nombre completo</Text>
                            <TextInput
                                placeholder="Ingrese nombre completo"
                                value={newUser.name}
                                onChangeText={(v) => setNewUser({...newUser, name: v})}
                                className="border p-3 mb-3 rounded-lg border-gray-300"
                            />

                            <Text className="text-sm font-medium mb-1 text-gray-700">Correo electrónico</Text>
                            <TextInput
                                placeholder="ejemplo@gmail.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={newUser.email}
                                onChangeText={(v) => setNewUser({...newUser, email: v})}
                                className="border p-3 mb-3 rounded-lg border-gray-300"
                            />

                            <Text className="text-sm font-medium mb-1 text-gray-700">Teléfono</Text>
                            <TextInput
                                placeholder="Ingrese número de teléfono"
                                keyboardType="phone-pad"
                                value={newUser.phone}
                                onChangeText={(v) => setNewUser({...newUser, phone: v})}
                                className="border p-3 mb-3 rounded-lg border-gray-300"
                            />

                            <Text className="text-sm font-medium mb-1 text-gray-700">Contraseña</Text>
                            <TextInput
                                placeholder="Mínimo 6 caracteres, 1 mayúscula, 1 minúscula, 1 número"
                                secureTextEntry={true}
                                value={newUser.password}
                                onChangeText={(v) => setNewUser({...newUser, password: v})}
                                className="border p-3 mb-3 rounded-lg border-gray-300"
                            />

                            <Text className="text-sm font-medium mb-1 text-gray-700">Confirmar contraseña</Text>
                            <TextInput
                                placeholder="Repite la contraseña"
                                secureTextEntry={true}
                                value={newUser.confirmPassword}
                                onChangeText={(v) => setNewUser({...newUser, confirmPassword: v})}
                                className="border p-3 mb-3 rounded-lg border-gray-300"
                            />

                            <Text className="text-sm font-medium mb-1 text-gray-700">Rol</Text>
                            <View className="border border-gray-300 rounded-lg mb-3 overflow-hidden">
                                <Picker
                                    selectedValue={newUser.role}
                                    onValueChange={(v) => setNewUser({...newUser, role: v})}
                                    style={pickerStyle}
                                >
                                    <Picker.Item label="Cajero" value="cajero"/>
                                    <Picker.Item label="Administrador" value="admin"/>
                                </Picker>
                            </View>

                            <Text className="text-sm font-medium mb-1 text-gray-700">Estado</Text>
                            <View className="border border-gray-300 rounded-lg mb-4 overflow-hidden">
                                <Picker
                                    selectedValue={newUser.isActive ? "true" : "false"}
                                    onValueChange={(v) => setNewUser({...newUser, isActive: v === "true"})}
                                    style={pickerStyle}
                                >
                                    <Picker.Item label="Activo" value="true"/>
                                    <Picker.Item label="Inactivo" value="false"/>
                                </Picker>
                            </View>

                            <TouchableOpacity
                                onPress={handleAddUser}
                                className="bg-amber-700 py-3 rounded-lg"
                            >
                                <Text className="text-white text-center font-bold">Guardar</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            {/* Modal Editar Usuario */}
            {editingUser && (
                <Modal visible={!!editingUser} transparent animationType="fade">
                    <View className="flex-1 bg-black/50 justify-center items-center">
                        <ScrollView
                            contentContainerStyle={{flexGrow: 1, justifyContent: 'center', alignItems: 'center'}}
                            className="w-full">
                            <View className="bg-white p-6 rounded-xl w-11/12 max-w-md relative my-4">
                                <TouchableOpacity
                                    onPress={() => setEditingUser(null)}
                                    className="absolute top-3 right-3 z-10"
                                >
                                    <Text className="text-xl font-bold text-gray-500 mt-2 mr-3">✕</Text>
                                </TouchableOpacity>

                                <Text className="text-lg font-bold mb-4 text-center">Editar Usuario</Text>

                                <Text className="text-sm font-medium mb-1 text-gray-700">Nombre completo</Text>
                                <TextInput
                                    placeholder="Ingrese nombre completo"
                                    value={editUserForm.name}
                                    onChangeText={(v) => setEditUserForm({...editUserForm, name: v})}
                                    className="border p-3 mb-3 rounded-lg border-gray-300"
                                />

                                <Text className="text-sm font-medium mb-1 text-gray-700">Correo electrónico</Text>
                                <TextInput
                                    placeholder="ejemplo@gmail.com"
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    value={editUserForm.email}
                                    onChangeText={(v) => setEditUserForm({...editUserForm, email: v})}
                                    className="border p-3 mb-3 rounded-lg border-gray-300"
                                />

                                <Text className="text-sm font-medium mb-1 text-gray-700">Teléfono</Text>
                                <TextInput
                                    placeholder="Ingrese número de teléfono"
                                    keyboardType="phone-pad"
                                    value={editUserForm.phone}
                                    onChangeText={(v) => setEditUserForm({...editUserForm, phone: v})}
                                    className="border p-3 mb-3 rounded-lg border-gray-300"
                                />

                                {/* Checkbox para cambiar contraseña */}
                                <TouchableOpacity
                                    onPress={() => setEditUserForm({
                                        ...editUserForm,
                                        changePassword: !editUserForm.changePassword,
                                        password: "",
                                        confirmPassword: ""
                                    })}
                                    className="flex-row items-center mb-3"
                                >
                                    <View
                                        className={`w-5 h-5 border-2 border-gray-400 rounded mr-2 ${editUserForm.changePassword ? 'bg-amber-700' : 'bg-white'}`}>
                                        {editUserForm.changePassword && (
                                            <Text className="text-white text-center text-xs">✓</Text>
                                        )}
                                    </View>
                                    <Text className="text-sm text-gray-700">Cambiar contraseña</Text>
                                </TouchableOpacity>

                                {editUserForm.changePassword && (
                                    <>
                                        <Text className="text-sm font-medium mb-1 text-gray-700">Nueva contraseña</Text>
                                        <TextInput
                                            placeholder="Mínimo 6 caracteres, 1 mayúscula, 1 minúscula, 1 número"
                                            secureTextEntry={true}
                                            value={editUserForm.password}
                                            onChangeText={(v) => setEditUserForm({...editUserForm, password: v})}
                                            className="border p-3 mb-3 rounded-lg border-gray-300"
                                        />

                                        <Text className="text-sm font-medium mb-1 text-gray-700">Confirmar nueva
                                            contraseña</Text>
                                        <TextInput
                                            placeholder="Repite la nueva contraseña"
                                            secureTextEntry={true}
                                            value={editUserForm.confirmPassword}
                                            onChangeText={(v) => setEditUserForm({...editUserForm, confirmPassword: v})}
                                            className="border p-3 mb-3 rounded-lg border-gray-300"
                                        />
                                    </>
                                )}

                                <Text className="text-sm font-medium mb-1 text-gray-700">Rol</Text>
                                <View className="border border-gray-300 rounded-lg mb-3 overflow-hidden">
                                    <Picker
                                        selectedValue={editUserForm.role}
                                        onValueChange={(v) => setEditUserForm({...editUserForm, role: v})}
                                        style={pickerStyle}
                                    >
                                        <Picker.Item label="Cajero" value="cajero"/>
                                        <Picker.Item label="Administrador" value="admin"/>
                                    </Picker>
                                </View>

                                <Text className="text-sm font-medium mb-1 text-gray-700">Estado</Text>
                                <View className="border border-gray-300 rounded-lg mb-4 overflow-hidden">
                                    <Picker
                                        selectedValue={editUserForm.isActive ? "true" : "false"}
                                        onValueChange={(v) =>
                                            setEditUserForm({...editUserForm, isActive: v === "true"})
                                        }
                                        style={pickerStyle}
                                    >
                                        <Picker.Item label="Activo" value="true"/>
                                        <Picker.Item label="Inactivo" value="false"/>
                                    </Picker>
                                </View>

                                <TouchableOpacity
                                    onPress={handleEditUser}
                                    className="bg-amber-700 py-3 rounded-lg"
                                >
                                    <Text className="text-white text-center font-bold">Actualizar</Text>
                                </TouchableOpacity>
                            </View>
                        </ScrollView>
                    </View>
                </Modal>
            )}
        </ScrollView>
    );
}