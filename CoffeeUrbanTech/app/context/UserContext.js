import React, { createContext, useState, useContext, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfigWeb';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

const SPECIAL_USER = {
    email: 'admin@urbantech.com',
    password: 'UrbanTech2025!',
    userData: {
        id: 'special-admin',
        email: 'admin@urbantech.com',
        name: 'Administrador Especial',
        role: 'super-admin',
        isActive: true,
        isSpecialUser: true,
        permissions: ['create-users', 'manage-system', 'full-access'],
        createdAt: new Date().toISOString(),
    }
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            console.log('Checking auth status...'); // Debug log
            const userData = await AsyncStorage.getItem('userData');

            if (userData) {
                const parsedUser = JSON.parse(userData);
                console.log('User found in storage:', parsedUser.email); // Debug log
                setUser(parsedUser);
                setIsAuthenticated(true);
            } else {
                console.log('No user found in storage'); // Debug log
            }
        } catch (error) {
            console.error('Error checking auth status:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            console.log('Attempting login for:', email); // Debug log

            if (email === SPECIAL_USER.email && password === SPECIAL_USER.password) {

                await AsyncStorage.setItem('userData', JSON.stringify(SPECIAL_USER.userData));
                console.log('Special user data saved to storage'); // Debug log

                setUser(SPECIAL_USER.userData);
                setIsAuthenticated(true);

                return SPECIAL_USER.userData;
            }

            const usersQuery = query(
                collection(db, "users"),
                where("email", "==", email)
            );

            const querySnapshot = await getDocs(usersQuery);

            if (querySnapshot.empty) {
                throw new Error("Usuario no encontrado");
            }

            const userDoc = querySnapshot.docs[0];
            const userData = userDoc.data();

            if (userData.password !== password) {
                throw new Error("Contraseña incorrecta");
            }

            if (!userData.isActive) {
                throw new Error("Usuario inactivo");
            }

            const userWithId = {
                ...userData,
                id: userDoc.id,
                isSpecialUser: false
            };

            await AsyncStorage.setItem('userData', JSON.stringify(userWithId));

            setUser(userWithId);
            setIsAuthenticated(true);

            return userWithId;

        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            console.log('Starting logout process...');

            const userData = await AsyncStorage.getItem('userData');
            console.log('Current user data before logout:', userData ? 'exists' : 'not found');

            await AsyncStorage.removeItem('userData');
            console.log('User data removed from storage');

            const checkData = await AsyncStorage.getItem('userData');
            console.log('Data after removal:', checkData ? 'still exists' : 'successfully removed');

            setUser(null);
            setIsAuthenticated(false);

            console.log('Logout completed successfully');

        } catch (error) {
            console.error('Error during logout:', error);
            setUser(null);
            setIsAuthenticated(false);
            throw error;
        }
    };

    const isSpecialUser = () => {
        return user?.isSpecialUser === true;
    };

    const hasPermission = (permission) => {
        if (isSpecialUser()) {
            return true;
        }
        return user?.permissions?.includes(permission) || false;
    };

    const contextValue = {
        user,
        login,
        logout,
        loading,
        isAuthenticated,
        isSpecialUser,
        hasPermission,
        specialUserInfo: {
            email: SPECIAL_USER.email,
            name: SPECIAL_USER.userData.name,
            role: SPECIAL_USER.userData.role
        }
    };

    return (
        <UserContext.Provider value={contextValue}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within UserProvider');
    }
    return context;
};