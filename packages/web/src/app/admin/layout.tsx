import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Package,
  Settings,
  LogOut,
  BarChart3,
} from 'lucide-react';

export const metadata = {
  title: 'Admin Panel - AgentFoundry',
  description: 'Administrative dashboard for AgentFoundry',
};

// This would be replaced with actual auth check
async function checkAdminAuth() {
  // TODO: Implement actual admin auth check
  // For now, return true for development
  return true;
}

export default async function AdminLayout({
  children,
}: {
  children: React.node;
}) {
  const isAdmin = await checkAdminAuth();

  if (!isAdmin) {
    redirect('/');
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
    },
    {
      name: 'Subscriptions',
      href: '/admin/subscriptions',
      icon: CreditCard,
    },
    {
      name: 'Skills',
      href: '/admin/skills',
      icon: Package,
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">AgentFoundry</h1>
          <span className="ml-2 px-2 py-0.5 text-xs font-medium text-purple-700 bg-purple-100 rounded">
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors group"
            >
              <item.icon className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-600" />
              {item.name}
            </Link>
          ))}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-sm font-medium text-purple-700">A</span>
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-900">Admin User</p>
              <p className="text-xs text-gray-500">admin@agentfoundry.dev</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-8">
            <div className="flex items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Admin Panel
              </h2>
            </div>
            <div className="flex items-center space-x-4">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900">
                Documentation
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                View Site
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
