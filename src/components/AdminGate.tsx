import { useAuth } from "@/hooks/useAuth"
import { AdminLogin } from "@/pages/AdminLogin"

export function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return user ? <>{children}</> : <AdminLogin />
}
