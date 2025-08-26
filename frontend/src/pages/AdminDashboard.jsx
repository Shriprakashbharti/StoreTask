import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, Store, Star, Search } from 'lucide-react'
import Card from '../components/Card'
import Input from '../components/Input'
import Table from '../components/Table'
import RatingStars from '../components/RatingStars'
import api from '../lib/api'

const AdminDashboard = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const { data: metrics } = useQuery({
    queryKey: ['admin-metrics'],
    queryFn: async () => {
      const response = await api.get('/admin/metrics')
      return response.data
    },
  })

  const { data: storesData, isLoading } = useQuery({
    queryKey: ['admin-stores', search, page],
    queryFn: async () => {
      const response = await api.get('/admin/stores', {
        params: { search, page, limit: 10 },
      })
      return response.data
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl mr-4">
                <Users className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.totalUsers}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/50 rounded-xl mr-4">
                <Store className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Stores</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.totalStores}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/50 rounded-xl mr-4">
                <Star className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Ratings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {metrics.totalRatings}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Stores</h2>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search stores..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
            ))}
          </div>
        ) : (
          <>
            <Table headers={['Name', 'Address', 'Owner', 'Rating', 'Reviews']}>
              {storesData?.stores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {store.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {store.address}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {store.owner?.name || 'No owner'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <RatingStars rating={store.avgRating} size="sm" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        ({store.avgRating.toFixed(1)})
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {store.ratingsCount}
                  </td>
                </tr>
              ))}
            </Table>

            {storesData && storesData.pagination.total > 10 && (
              <div className="flex justify-between items-center mt-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, storesData.pagination.total)} of{' '}
                  {storesData.pagination.total} stores
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={page * 10 >= storesData.pagination.total}
                    className="px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}

export default AdminDashboard