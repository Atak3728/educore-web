import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useData } from '../context/DataContext';

const ProtectedRoute = () => {
    const { isAuthenticated } = useData();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
