import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute } from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import AdminLayout from "./components/AdminLayout";
import Footer from "./components/Footer";
import WhatsAppFab from "./components/WhatsAppFab";
import ErrorBoundary from "./components/ErrorBoundary";

import Home from "./pages/Home";
import Article from "./pages/Article";
import AllNews from "./pages/AllNews";
import SearchResults from "./pages/SearchResults";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminPostList from "./pages/admin/PostList";
import AdminPostEditor from "./pages/admin/PostEditor";
import AdminComments from "./pages/admin/Comments";
import AdminBreakingNews from "./pages/admin/BreakingNews";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <AuthProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <Routes>
            {/* Public */}
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <Home />
                  <Footer />
                  <WhatsAppFab />
                </>
              }
            />
            <Route
              path="/news"
              element={
                <>
                  <Navbar />
                  <AllNews />
                  <Footer />
                  <WhatsAppFab />
                </>
              }
            />
            <Route
              path="/news/:slug"
              element={
                <>
                  <Navbar />
                  <Article />
                  <Footer />
                  <WhatsAppFab />
                </>
              }
            />
            <Route
              path="/search"
              element={
                <>
                  <Navbar />
                  <SearchResults />
                  <Footer />
                  <WhatsAppFab />
                </>
              }
            />
            <Route
              path="/login"
              element={
                <>
                  <Navbar />
                  <Login />
                  <Footer />
                  <WhatsAppFab />
                </>
              }
            />
            <Route
              path="/signup"
              element={
                <>
                  <Navbar />
                  <Signup />
                  <Footer />
                  <WhatsAppFab />
                </>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Navbar />
                  <Profile />
                  <Footer />
                  <WhatsAppFab />
                </ProtectedRoute>
              }
            />

            {/* Admin */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminDashboard />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/posts"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminPostList />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/posts/new"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminPostEditor />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/posts/edit/:id"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminPostEditor />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/comments"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminComments />
                  </AdminLayout>
                </AdminRoute>
              }
            />
            <Route
              path="/admin/breaking-news"
              element={
                <AdminRoute>
                  <AdminLayout>
                    <AdminBreakingNews />
                  </AdminLayout>
                </AdminRoute>
              }
            />
          </Routes>
            </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;