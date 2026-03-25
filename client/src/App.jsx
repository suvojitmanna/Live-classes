import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./context/authcontext";
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
      <BrowserRouter>
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
    </AuthProvider>
  );
};

export default App;
