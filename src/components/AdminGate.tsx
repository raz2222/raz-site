import { useAuth } from "@/hooks/useAuth"
import { AdminLogin } from "@/pages/AdminLogin"
import { SignedContractCelebration } from "@/components/admin/SignedContractCelebration"
import { AdminToaster } from "@/components/admin/AdminToaster"

/** The gate is also where the admin's skin is applied. Every admin screen goes
 * through here, so `.admin-shell` is set once and the styling in index.css
 * cannot leak onto the public site. */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <AdminLogin />
  return (
    <div className="admin-shell">
      <SignedContractCelebration />
      <AdminToaster />
      {children}
    </div>
  )
}
