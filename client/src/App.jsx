import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SessionProvider } from "./context/SessionContext";

import Home from "./pages/Home";
import Header from "./component/Header";
import Footer from "./component/Footer";
import Auth from "./pages/Auth";
import ProtectedRoute from "./component/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import HotSession from "./pages/HotSession";
import JoinSession from "./pages/JoinSession";
import PageNotFound from "./pages/PageNotFound";

import { ROUTES } from "./utils/constants";
import { Toaster } from "react-hot-toast";

import { motion, AnimatePresence } from "framer-motion";

//  Layout Component (Responsive + Animated)
function Layout({ children, showHeader = true, showFooter = true }) {
  return (
    <>
      {showHeader && <Header />}

      <motion.main
        className={`${
          showHeader ? "pt-16 px-4 sm:px-6 md:px-8" : "px-4 sm:px-6 md:px-8"
        } max-w-7xl mx-auto w-full`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {children}
      </motion.main>

      {showFooter && <Footer />}
    </>
  );
}

//  Page Animation Wrapper
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -25 }}
      transition={{ duration: 0.35 }}
    >
      {children}
    </motion.div>
  );
};

//  Animated Routes Component
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Home */}
          <Route
            path="/"
            element={
              <Layout>
                <PageWrapper>
                  <Home />
                </PageWrapper>
              </Layout>
            }
          />

          {/* Login */}
          <Route
            path={ROUTES.LOGIN}
            element={
              <Layout showHeader={false} showFooter={false}>
                <PageWrapper>
                  <Auth />
                </PageWrapper>
              </Layout>
            }
          />

          {/* Register */}
          <Route
            path={ROUTES.REGISTER}
            element={
              <Layout showHeader={false} showFooter={false}>
                <PageWrapper>
                  <Auth />
                </PageWrapper>
              </Layout>
            }
          />

          {/* Dashboard */}
          <Route
            path={ROUTES.DASHBOARD}
            element={
              <ProtectedRoute>
                <Layout>
                  <PageWrapper>
                    <Dashboard />
                  </PageWrapper>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Host Session */}
          <Route
            path={ROUTES.HOST}
            element={
              <ProtectedRoute>
                <Layout>
                  <PageWrapper>
                    <HotSession />
                  </PageWrapper>
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Join Session */}
          <Route
            path={ROUTES.JOIN}
            element={
              <Layout>
                <PageWrapper>
                  <JoinSession />
                </PageWrapper>
              </Layout>
            }
          />

          {/* 404 */}
          <Route
            path="*"
            element={
              <Layout showHeader={false} showFooter={false}>
                <PageWrapper>
                  <PageNotFound />
                </PageWrapper>
              </Layout>
            }
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
};

//  Main App
const App = () => {
  return (
    <AuthProvider>
      <SessionProvider>
        <BrowserRouter>
          {/*  Toaster UI */}
          <Toaster
            toastOptions={{
              duration: 3500,
              style: {
                background: "rgba(30, 30, 30, 0.6)",
                color: "#fff",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "14px",
                padding: "12px 16px",
                boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                fontSize: "14px",
              },

              success: {
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#fff",
                },
                style: {
                  border: "1px solid rgba(34,197,94,0.3)",
                },
              },

              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
                style: {
                  border: "1px solid rgba(239,68,68,0.3)",
                },
              },

              loading: {
                style: {
                  border: "1px solid rgba(255,255,255,0.2)",
                },
              },
            }}
          />

          {/*  Animated Routes */}
          <AnimatedRoutes />
        </BrowserRouter>
      </SessionProvider>
    </AuthProvider>
  );
};

export default App;
