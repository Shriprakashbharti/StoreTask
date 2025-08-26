import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Store, LogIn } from 'lucide-react'
import Card from '../components/Card'
import Input from '../components/Input'
import Button from '../components/Button'
import api from '../lib/api'
import { setToken, setUser } from '../lib/auth'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const Login = ({ setUser }) => {
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    try {
      setError('')
      const response = await api.post('/auth/login', data)
      setToken(response.data.accessToken)
      setUser(response.data.user)
      setUser(response.data.user)
      navigate('/stores')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h1>
          <p className="text-gray-600 dark:text-gray-400">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-xl">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register('password')}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <LogIn className="w-5 h-5 mr-2" />
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign up
          </Link>
        </p>

        <div className="mt-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <h3 className="font-medium text-gray-900 dark:text-white mb-2">Demo Accounts</h3>
          <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <p>Admin: admin@example.com / Admin@123!</p>
            <p>Owner: owner@example.com / Owner@123!</p>
            <p>User: user@example.com / User@123!</p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Login