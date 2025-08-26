import { useQuery } from '@tanstack/react-query'
import { Star, Users, Calendar } from 'lucide-react'
import Card from '../components/Card'
import Table from '../components/Table'
import RatingStars from '../components/RatingStars'
import api from '../lib/api'

const OwnerDashboard = () => {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['owner-dashboard'],
    queryFn: async () => {
      const response = await api.get('/owner/dashboard')
      return response.data
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
        </Card>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <Card>
        <p className="text-gray-600 dark:text-gray-400">No store data available</p>
      </Card>
    )
  }

  const { store, raters } = dashboardData

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Owner Dashboard</h1>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-indigo-50 dark:bg-indigo-900/50 rounded-2xl">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-full mb-4">
              <Star className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {store.avgRating.toFixed(1)}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Average Rating</p>
          </div>

          <div className="text-center p-6 bg-green-50 dark:bg-green-900/50 rounded-2xl">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-full mb-4">
              <Users className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {store.ratingsCount}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Total Ratings</p>
          </div>

          <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/50 rounded-2xl">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-full mb-4">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              {store.name}
            </h3>
            <p className="text-gray-600 dark:text-gray-400">Your Store</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Recent Ratings</h2>
        {raters.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400">No ratings yet</p>
        ) : (
          <Table headers={['Customer', 'Rating', 'Date']}>
            {raters.map((rater) => (
              <tr key={rater.email} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {rater.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {rater.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RatingStars rating={rater.value} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                  {new Date(rater.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  )
}

export default OwnerDashboard