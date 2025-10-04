import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { Dashboard } from "./pages/Dashboard";
import { Leaderboard } from "./pages/Leaderboard";
import { Profile } from "./pages/Profile";
import { Submit } from "./pages/Submit";
import { Tournament } from "./pages/Tournament";
import Admin from "./pages/Admin";
import { Rules } from "./pages/Rules";
import { FAQ } from "./pages/FAQ";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import { MySubmissions } from "./pages/MySubmissions";
import { ForgotPassword } from "./pages/ForgotPassword";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/dashboard" element={
              <ProtectedRoute allowGuest>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/leaderboard" element={
              <ProtectedRoute allowGuest>
                <Leaderboard />
              </ProtectedRoute>
            } />
            <Route path="/submit" element={
              <ProtectedRoute>
                <Submit />
              </ProtectedRoute>
            } />
            <Route path="/my-submissions" element={
              <ProtectedRoute>
                <MySubmissions />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/tournament" element={
              <ProtectedRoute allowGuest>
                <Tournament />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin>
                <Admin />
              </ProtectedRoute>
            } />
            <Route path="/rules" element={<Rules />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;