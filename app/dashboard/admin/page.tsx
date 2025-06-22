
export const dynamic = "force-dynamic";

import { redirect } from 'next/navigation'
import { getCurrentSession } from '@/lib/auth'
import { getUserRoles, userHasPermission } from '@/lib/roles'
import { DashboardLayout } from '@/components/dashboard/dashboard-layout'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export default async function AdminPage() {
  const session = await getCurrentSession()
  
  if (!session) {
    redirect('/login')
  }

  const roles = await getUserRoles(session.user.id)
  const hasAdminAccess = await userHasPermission(session.user.id, 'read:admin')

  if (!hasAdminAccess) {
    redirect('/dashboard')
  }

  return (
    <DashboardLayout user={session.user} roles={roles}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">
            System administration and management console.
          </p>
        </div>
        
        <AdminDashboard user={session.user} />
      </div>
    </DashboardLayout>
  )
}
