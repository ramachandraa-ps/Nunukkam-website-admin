import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { PATHS } from './paths';

// ----------------------------------------------------------------------

interface ProtectedRouteProps {
    children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    // TODO: Replace with actual auth check using your store or context
    // Example: const { isAuthenticated } = useAuth();
    const isAuthenticated = true; // Temporary bypass for demonstration, set to correct logic

    if (!isAuthenticated) {
        return <Navigate to={PATHS.AUTH.LOGIN} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
