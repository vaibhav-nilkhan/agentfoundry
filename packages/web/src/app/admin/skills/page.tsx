import { Package, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4100';

async function getSkills(params: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
} = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.limit) queryParams.set('limit', params.limit.toString());
    if (params.status) queryParams.set('status', params.status);
    if (params.search) queryParams.set('search', params.search);

    const response = await fetch(
      `${API_BASE_URL}/api/admin/skills?${queryParams.toString()}`,
      {
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication header
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch skills:', response.statusText);
      return {
        skills: [],
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
    console.error('Error fetching skills:', error);
    return {
      skills: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      },
    };
  }
}

export default async function SkillsPage() {
  const data = await getSkills();

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-100', text: 'text-red-700', icon: XCircle },
      DEPRECATED: { bg: 'bg-gray-100', text: 'text-gray-700', icon: AlertTriangle },
    };
    return styles[status] || styles.PENDING;
  };

  const getPricingBadge = (pricing: string) => {
    const styles = {
      FREE: 'bg-gray-100 text-gray-700',
      PAID: 'bg-green-100 text-green-700',
      FREEMIUM: 'bg-purple-100 text-purple-700',
    };
    return styles[pricing] || styles.FREE;
  };

  const pendingCount = data.skills.filter((s) => s.status === 'PENDING').length;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Skills</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and moderate skill submissions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {pendingCount > 0 && (
            <span className="px-3 py-1 text-sm font-medium text-orange-700 bg-orange-100 rounded-full">
              {pendingCount} pending review
            </span>
          )}
          <button className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
            Bulk Actions
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500">Total Skills</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{data.pagination.total}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500">Pending Review</p>
          <p className="mt-2 text-3xl font-bold text-yellow-600">{pendingCount}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500">Total Downloads</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {data.skills.reduce((sum, s) => sum + s.downloads, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-500">Avg Rating</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">4.7</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="DEPRECATED">Deprecated</option>
          </select>

          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
            <option value="">All Pricing</option>
            <option value="FREE">Free</option>
            <option value="PAID">Paid</option>
            <option value="FREEMIUM">Freemium</option>
          </select>

          <div className="flex-1"></div>

          <input
            type="text"
            placeholder="Search skills..."
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Skills table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Skill
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Author
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Downloads
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data.skills.map((skill) => {
                const StatusIcon = getStatusBadge(skill.status).icon;
                const statusStyle = getStatusBadge(skill.status);

                return (
                  <tr key={skill.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {skill.name}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {skill.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {skill.author.displayName}
                      </div>
                      <div className="text-sm text-gray-500">{skill.author.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${statusStyle.bg} ${statusStyle.text}`}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {skill.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${getPricingBadge(skill.pricingType)}`}
                      >
                        {skill.pricingType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {skill.downloads.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-gray-900">
                          {skill.rating > 0 ? skill.rating.toFixed(1) : '-'}
                        </span>
                        {skill.reviewCount > 0 && (
                          <span className="ml-1 text-sm text-gray-500">
                            ({skill.reviewCount})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {skill.status === 'PENDING' && (
                        <>
                          <button className="text-green-600 hover:text-green-900 mr-4">
                            Approve
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            Reject
                          </button>
                        </>
                      )}
                      {skill.status !== 'PENDING' && (
                        <button className="text-purple-600 hover:text-purple-900">
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
