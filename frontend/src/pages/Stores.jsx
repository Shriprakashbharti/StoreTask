import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, MapPin, Star } from 'lucide-react'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import RatingStars from '../components/RatingStars'
import api from '../lib/api'

const Stores = () => {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data: storesData, isLoading } = useQuery({
    queryKey: ['stores', search, page],
    queryFn: async () => {
      const response = await api.get('/stores', {
        params: { q: search, page, limit: 9 },
      })
      return response.data
    },
  })

  const rateMutation = useMutation({
    mutationFn: async ({ storeId, value }) => {
      const response = await api.post(`/stores/${storeId}/ratings`, { value })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['stores'])
    },
  })

  const handleRate = (storeId, value) => {
    rateMutation.mutate({ storeId, value })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Stores</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {storesData?.stores.map((store) => (
              <Card key={store.id} className="hover:shadow-xl transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {store.name}
                </h3>
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{store.address}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <RatingStars rating={store.overallRating} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({store.ratingsCount})
                    </span>
                  </div>
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">
                    {store.overallRating.toFixed(1)}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your rating: {store.userRating || 'Not rated'}
                  </p>
                  <div className="flex items-center justify-between">
                    <RatingStars
                      rating={store.userRating || 0}
                      interactive
                      onRatingChange={(value) => handleRate(store.id, value)}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleRate(store.id, 0)}
                      disabled={!store.userRating}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {storesData && storesData.pagination.total > 9 && (
            <div className="flex justify-center space-x-4">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="flex items-center text-gray-600 dark:text-gray-400">
                Page {page} of {Math.ceil(storesData.pagination.total / 9)}
              </span>
              <Button
                variant="secondary"
                onClick={() => setPage((p) => p + 1)}
                disabled={page * 9 >= storesData.pagination.total}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Stores