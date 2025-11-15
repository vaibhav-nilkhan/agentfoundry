import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100';

async function getSubscriptions(params: {
  page?: number;
  limit?: number;
  tier?: string;
  status?: string;
} = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.tier) queryParams.set('tier', params.tier);
    if (params.status) queryParams.set('status', params.status);

    const response = await fetch(
      `${API_BASE_URL}/api/admin/subscriptions?${queryParams.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication header
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch subscriptions:', response.statusText);
      return {
        subscriptions: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 0,
        },
      };
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return {
      subscriptions: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
    };
  }
}

export default async function SubscriptionsPage() {
  const data = await getSubscriptions();

  const tierPrices = {
    FREE: 0,
    CREATOR: 39,
    PRO: 99,
    ENTERPRISE: 499,
  };

  const getTierBadge = (tier: string) => {
    const styles = {
      FREE: 'bg-gray-100 text-gray-700',
      CREATOR: 'bg-blue-100 text-blue-700',
      PRO: 'bg-purple-100 text-purple-700',
      ENTERPRISE: 'bg-orange-100 text-orange-700',
    };
    return styles[tier] || styles.FREE;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-700',
      PAST_DUE: 'bg-red-100 text-red-700',
      CANCELED: 'bg-gray-100 text-gray-700',
      TRIALING: 'bg-yellow-100 text-yellow-700',
      INCOMPLETE: 'bg-orange-100 text-orange-700',
    };
    return styles[status] || styles.ACTIVE;
  };

  const totalMRR = data.subscriptions.reduce((sum, sub) => {
    return sum + (tierPrices[sub.tier] || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscriptions</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage user subscriptions and billing
          </p>
        </div>
        <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
          Export Revenue Data
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Monthly Revenue
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${totalMRR.toLocaleString()}
              </p>
              <p className="mt-1 text-sm text-green-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12.3% from last month
              </p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Active Subscriptions</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">156</p>
              <p className="mt-1 text-sm text-gray-600">
                2 pending payment
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Churn Rate</p>
              <p className="mt-2 text-3xl font-bold text-gray-900">3.2%</p>
              <p className="mt-1 text-sm text-gray-600">
                5 cancellations this month
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option value="">All Tiers</option>
            <option value="CREATOR">Creator</option>
            <option value="PRO">Pro</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>

          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option value="">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="PAST_DUE">Past Due</option>
            <option value="CANCELED">Canceled</option>
            <option value="TRIALING">Trialing</option>
          </select>

          <div className="flex-1"></div>

          <input
            type="text"
            placeholder="Search by email..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Subscriptions table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tier
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Billing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  MRR
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.subscriptions.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {sub.user.displayName}
                    </div>
                    <div className="text-sm text-gray-500">{sub.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getTierBadge(sub.tier)}`}
                    >
                      {sub.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded ${getStatusBadge(sub.status)}`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sub.usageCount.toLocaleString()}
                    {sub.monthlyLimit && (
                      <span className="text-gray-500">
                        {' '}/ {sub.monthlyLimit.toLocaleString()}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${tierPrices[sub.tier]}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-purple-600 hover:text-purple-900 mr-4">
                      View
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">1-{data.subscriptions.length}</span> of{' '}
              <span className="font-medium">{data.pagination.total}</span> subscriptions
            </div>
            <div className="flex space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Previous
              </button>
              <button className="px-3 py-1 bg-purple-600 border border-purple-600 rounded-md text-sm font-medium text-white">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
