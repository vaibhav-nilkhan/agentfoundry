import { Users, DollarSign, Package, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';

// This would fetch from API in real implementation
async function getDashboardStats() {
  // TODO: Replace with actual API call
  return {
    overview: {
      totalUsers: 1247,
      newUsersLast30Days: 342,
      newUsersLast7Days: 89,
      userGrowthRate: '12.4%',
      activeSubscriptions: 156,
      totalSkills: 8,
      pendingSkills: 0,
      totalApiKeys: 289,
    },
    revenue: {
      mrr: 8964,
      arr: 107568,
      averageRevenuePerUser: '7.19',
    },
    usage: {
      totalExecutions: 45892,
      executionsPerUser: 37,
    },
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  const cards = [
    {
      title: 'Total Users',
      value: stats.overview.totalUsers.toLocaleString(),
      change: `+${stats.overview.newUsersLast7Days} this week`,
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.revenue.mrr.toLocaleString()}`,
      change: `$${stats.revenue.arr.toLocaleString()} ARR`,
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Active Subscriptions',
      value: stats.overview.activeSubscriptions.toLocaleString(),
      change: `Avg $${stats.revenue.averageRevenuePerUser}/user`,
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Skills',
      value: stats.overview.totalSkills.toLocaleString(),
      change: `${stats.overview.pendingSkills} pending`,
      trend: 'neutral',
      icon: Package,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your platform performance
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {card.value}
                </p>
                <div className="mt-2 flex items-center text-sm">
                  {card.trend === 'up' && (
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  )}
                  {card.trend === 'down' && (
                    <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className="text-gray-600">{card.change}</span>
                </div>
              </div>
              <div className={`${card.color} p-3 rounded-lg`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent users */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Users
          </h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">U{i}</span>
                  </div>
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    user{i}@example.com
                  </p>
                  <p className="text-xs text-gray-500">{i} hours ago</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">
                  Active
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <a
              href="/admin/users"
              className="text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              View all users →
            </a>
          </div>
        </div>

        {/* Pending skills */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Skill Moderation
          </h2>
          {stats.overview.pendingSkills === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No skills pending review</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Pending skills would be listed here */}
            </div>
          )}
          <div className="mt-4">
            <a
              href="/admin/skills"
              className="text-sm font-medium text-purple-600 hover:text-purple-700"
            >
              View all skills →
            </a>
          </div>
        </div>
      </div>

      {/* Revenue chart placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Revenue Trend (Last 30 Days)
        </h2>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-500">
            Chart implementation coming soon
          </p>
        </div>
      </div>
    </div>
  );
}
