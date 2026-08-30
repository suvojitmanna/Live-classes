import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { FaSpinner } from "react-icons/fa";
import { ROUTES } from "../utils/constants";

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1f1f1f] text-gray-900 dark:text-white transition-colors">
        <div className="text-center">
          <FaSpinner className="animate-spin h-12 w-12 text-blue-600 dark:text-[#8ab4f8] mx-auto" />
          <p className="mt-4 text-xs font-semibold text-gray-600 dark:text-gray-400">Loading your session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return children;
}

export default ProtectedRoute;
