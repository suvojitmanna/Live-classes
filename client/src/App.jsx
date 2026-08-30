import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SessionProvider } from "./context/SessionContext";
import { ThemeProvider } from "./context/ThemeContext";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Home from "./pages/Home";
import Header from "./component/Header";
import Footer from "./component/Footer";
import Auth from "./pages/Auth";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import ProtectedRoute from "./component/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import MeetingRoom from "./pages/MeetingRoom";
import JoinSession from "./pages/JoinSession";
import PageNotFound from "./pages/PageNotFound";

import { ROUTES } from "./utils/constants";
import { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

// Standard Page Layout
function Layout({ children, showHeader = true, showFooter = true }) {
  return (
    <>
      {showHeader && <Header />}
      <motion.main
        className={`${
          showHeader ? "pt-16 px-4 sm:px-6 md:px-8" : "px-0"
        } max-w-7xl mx-auto w-full flex-1`}
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

// Page Transition Animation Wrapper
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      {children}
    </motion.div>
  );
};

// Animated App Routes
const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#1f1f1f] text-gray-900 dark:text-gray-100 transition-colors">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
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

          <Route
            path={ROUTES.VERIFY_EMAIL}
            element={
              <Layout showHeader={false} showFooter={false}>
                <PageWrapper>
                  <VerifyEmail />
                </PageWrapper>
              </Layout>
            }
          />

          <Route
            path={ROUTES.FORGOT_PASSWORD}
            element={
              <Layout showHeader={false} showFooter={false}>
                <PageWrapper>
                  <ForgotPassword />
                </PageWrapper>
              </Layout>
            }
          />

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

          <Route
            path={`${ROUTES.MEETING}/:roomId`}
            element={
              <ProtectedRoute>
                <MeetingRoom />
              </ProtectedRoute>
            }
          />

          <Route
            path={`${ROUTES.MEETING}/:roomId/lobby`}
            element={
              <ProtectedRoute>
                <MeetingRoom />
              </ProtectedRoute>
            }
          />

          <Route
            path={ROUTES.HOST}
            element={
              <ProtectedRoute>
                <MeetingRoom />
              </ProtectedRoute>
            }
          />

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

// Main App Entry
const App = () => {
  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID || "google_client_id_placeholder";

  return (
    <ThemeProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <AuthProvider>
          <SessionProvider>
            <BrowserRouter>
              <Toaster
                toastOptions={{
                  duration: 3500,
                  style: {
                    background: "rgba(30, 30, 30, 0.9)",
                    color: "#fff",
                    backdropFilter: "blur(12px)",
                    WebkitBackdropFilter: "blur(12px)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    borderRadius: "14px",
                    padding: "12px 16px",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
                    fontSize: "13px",
                  },
                  success: {
                    iconTheme: {
                      primary: "#22c55e",
                      secondary: "#fff",
                    },
                    style: {
                      border: "1px solid rgba(34,197,94,0.35)",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#ef4444",
                      secondary: "#fff",
                    },
                    style: {
                      border: "1px solid rgba(239,68,68,0.35)",
                    },
                  },
                }}
              />
              <AnimatedRoutes />
            </BrowserRouter>
          </SessionProvider>
        </AuthProvider>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
};

export default App;
