export const setToken = (token) => {
  localStorage.setItem('accessToken', token)
}

export const getToken = () => {
  return localStorage.getItem('accessToken')
}

export const setUser = (user) => {
  localStorage.setItem('user', JSON.stringify(user))
}

export const getUser = () => {
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const clearAuth = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('user')
}