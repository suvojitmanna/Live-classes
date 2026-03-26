import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Header from "./component/Header";
import Footer from "./component/Footer";
import Auth from "./pages/Auth";
import ProtectedRoute from "./component/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import HotSession from "./pages/HotSession";
import JoinSession from "./pages/JoinSession";
import PageNotFound from "./pages/PageNotFound";
import { ROUTES } from "./uttils/constants";
import { SessionProvider } from "./context/SessionContext";
import { Toaster } from "react-hot-toast";

function Layout({ children, showHeader = true, showFooter = true }) {
  return (
    <>
      {showHeader && <Header />}

      <main className={showHeader ? "pt-16" : ""}>{children}</main>

      {showFooter && <Footer />}
    </>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <SessionProvider>
        <BrowserRouter>
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
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Routes>
              <Route
                path="/"
                element={
                  <Layout>
                    <Home />
                  </Layout>
                }
              />
              <Route
                path={ROUTES.LOGIN}
                element={
                  <Layout showHeader={false} showFooter={false}>
                    <Auth />
                  </Layout>
                }
              />

              <Route
                path={ROUTES.REGISTER}
                element={
                  <Layout showHeader={false} showFooter={false}>
                    <Auth />
                  </Layout>
                }
              />

              <Route
                path={ROUTES.DASHBOARD}
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Dashboard />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path={ROUTES.HOST}
                element={
                  <ProtectedRoute>
                    <Layout>
                      <HotSession />
                    </Layout>
                  </ProtectedRoute>
                }
              />

              <Route
                path={ROUTES.JOIN}
                element={
                  <Layout>
                    <JoinSession />
                  </Layout>
                }
              />

              <Route
                path="*"
                element={
                  <Layout showHeader={false} showFooter={false}>
                    <PageNotFound />
                  </Layout>
                }
              />
            </Routes>
          </div>
        </BrowserRouter>
      </SessionProvider>
    </AuthProvider>
  );
};

export default App;
