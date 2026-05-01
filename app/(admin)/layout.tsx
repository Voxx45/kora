import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { DrawerProvider } from '@/lib/contexts/drawer-context'
import { ProspectDrawer } from '@/components/admin/ProspectDrawer'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <DrawerProvider>
      <div className="min-h-screen flex" style={{ background: '#0C0E16' }}>
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children}
        </div>
      </div>
      <ProspectDrawer />
    </DrawerProvider>
  )
}
