import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { PATHS } from './paths';

// ----------------------------------------------------------------------

interface ProtectedRouteProps {
    children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    // Check for authentication token or flag in localStorage
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';

    if (!isAuthenticated) {
        return <Navigate to={PATHS.AUTH.LOGIN} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
