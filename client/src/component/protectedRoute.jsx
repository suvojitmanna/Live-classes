import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { ROUTES } from "../uttils/constants";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  //  Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated → redirect
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  //  Authenticated → show protected content
  return children;
}

export default ProtectedRoute;
