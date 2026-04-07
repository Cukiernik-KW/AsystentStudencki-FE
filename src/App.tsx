import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import "./lib/i18n/index";
import AppShell from "./components/AppShell";
import AuthInitializer from "./components/AuthInitializer";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import DeanOfficePage from "./pages/DeanOfficePage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import NewsPage from "./pages/NewsPage";
import NotFoundPage from "./pages/NotFoundPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentsPage from "./pages/PaymentsPage";
import RecruitmentPage from "./pages/RecruitmentPage";
import RegisterPage from "./pages/RegisterPage";
import SchedulePage from "./pages/SchedulePage";

export default function App() {
  return (
    <>
      <AuthInitializer />

      <Routes>
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<AppShell />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/aktualnosci" element={<NewsPage />} />
          <Route path="/dziekanat" element={<DeanOfficePage />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/cancel" element={<PaymentCancelPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/rekrutacja" element={<RecruitmentPage />} />
            <Route path="/oplaty" element={<PaymentsPage />} />
            <Route path="/plan-zajec" element={<SchedulePage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}
