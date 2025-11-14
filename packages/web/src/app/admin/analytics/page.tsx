import { TrendingUp, Users, DollarSign, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
          <p className="mt-1 text-sm text-gray-500">
            Detailed insights into your platform performance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            title: 'Revenue Growth',
            value: '+23.5%',
            subtitle: 'vs last month',
            icon: DollarSign,
            color: 'bg-green-500',
          },
          {
            title: 'User Growth',
            value: '+12.4%',
            subtitle: '342 new users',
            icon: Users,
            color: 'bg-blue-500',
          },
          {
            title: 'Conversion Rate',
            value: '5.8%',
            subtitle: '89 conversions',
            icon: TrendingUp,
            color: 'bg-purple-500',
          },
          {
            title: 'Skill Executions',
            value: '45.8K',
            subtitle: '+8.3% vs last month',
            icon: Activity,
            color: 'bg-orange-500',
          },
        ].map((metric) => (
          <div
            key={metric.title}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{metric.value}</p>
                <p className="mt-2 text-sm text-gray-600">{metric.subtitle}</p>
              </div>
              <div className={`${metric.color} p-3 rounded-lg`}>
                <metric.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Revenue trend */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Revenue Trend
          </h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <DollarSign className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Chart implementation with Chart.js or Recharts
              </p>
            </div>
          </div>
        </div>

        {/* User growth */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            User Growth
          </h2>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                Chart implementation coming soon
              </p>
            </div>
          </div>
        </div>

        {/* Skill usage */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top Skills by Usage
          </h2>
          <div className="space-y-4">
            {[
              { name: 'Viral Content Predictor', usage: 15432, percent: 34 },
              { name: 'Code Security Audit', usage: 12891, percent: 28 },
              { name: 'API Contract Guardian', usage: 8754, percent: 19 },
              { name: 'GitHub PR Analyzer', usage: 6543, percent: 14 },
              { name: 'Technical Debt Quantifier', usage: 2272, percent: 5 },
            ].map((skill) => (
              <div key={skill.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-900">{skill.name}</span>
                  <span className="text-gray-500">{skill.usage.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${skill.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription distribution */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Subscription Distribution
          </h2>
          <div className="space-y-4">
            {[
              { tier: 'Free', count: 1091, color: 'bg-gray-400' },
              { tier: 'Creator', count: 98, color: 'bg-blue-500' },
              { tier: 'Pro', count: 45, color: 'bg-purple-600' },
              { tier: 'Enterprise', count: 13, color: 'bg-orange-500' },
            ].map((tier) => (
              <div key={tier.tier} className="flex items-center space-x-4">
                <div className={`w-12 h-12 ${tier.color} rounded-lg flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">{tier.count}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{tier.tier}</p>
                  <p className="text-xs text-gray-500">
                    {((tier.count / 1247) * 100).toFixed(1)}% of total users
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed tables */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Revenue by Tier (Last 30 Days)
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Subscribers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  MRR
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Growth
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Churn
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { tier: 'Creator', price: 39, subs: 98, growth: '+12%', churn: '2.1%' },
                { tier: 'Pro', price: 99, subs: 45, growth: '+18%', churn: '3.5%' },
                { tier: 'Enterprise', price: 499, subs: 13, growth: '+8%', churn: '0%' },
              ].map((row) => (
                <tr key={row.tier}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {row.tier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {row.subs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${(row.price * row.subs).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                    {row.growth}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {row.churn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
