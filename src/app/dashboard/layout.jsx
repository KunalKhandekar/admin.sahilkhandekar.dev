// app/dashboard/layout.jsx
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardLayout({ children }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}