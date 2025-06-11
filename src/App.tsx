import { Route, Routes, Navigate } from "react-router-dom";
import { Home } from "./pages/Home";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { useAuthStore } from "./store/aurhStore";
import { useEffect } from "react";
import { Profile } from "./pages/Profile";
import { ForgotPassword } from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  const { token, authCheckout } = useAuthStore();

  useEffect(() => {
    authCheckout();
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={token ? <Home /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/register"
        element={!token ? <Register /> : <Navigate to="/" replace />}
      />
      <Route
        path="/login"
        element={!token ? <Login /> : <Navigate to="/" replace />}
      />
      <Route
        path="/profile"
        element={token ? <Profile /> : <Navigate to="/" replace />}
      />
      <Route
        path="/forgot-password"
        element={!token ? <ForgotPassword /> : <Navigate to="/" replace />}
      />
      <Route
        path="/reset-password"
        element={!token ? <ResetPassword /> : <Navigate to="/" replace />}
      />
    </Routes>
  );
}

export default App;
