import { useUser } from '../../context/UserContext';
import { router } from 'expo-router';
import React, { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: 'admin' | 'cajero';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { isAuthenticated, user, loading } = useUser();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.replace('/login');
        }
    }, [isAuthenticated, loading]);

    if (requiredRole && user?.role !== requiredRole) {
        return (
            <div style={{ padding: 20, textAlign: 'center' }}>
                <h2>Acceso Denegado</h2>
                <p>No tienes permisos para acceder a esta sección.</p>
            </div>
        );
    }

    if (loading) {
        return null;
    }

    return isAuthenticated ? <>{children}</> : null;
}