import type { ParticipantType, RegisterType, LoginType, VoteType } from '@/@types'
import axios from 'axios'

export const api = axios.create({
    baseURL: 'http://localhost:4000',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const ParticipantService = {
    create: async ({ name, imageUrl }: ParticipantType) => await api.post('/create-votes', { name, imageUrl }),
    list: async () => await api.get('/list-votes'),
    delete: async (id: string) => await api.delete(`/delete-participant/${id}`)
}

export const AuthService = {
    register: async ({ name, email, password }: RegisterType) => {
        const response = await api.post('/users', { name, email, password })

        localStorage.setItem('token', response.data.token)

        return response.data
    },

    login: async ({ email, password }: LoginType) => {
      const response = await api.post('/sessions', { email, password })

      return response.data
    }
}

export const VoteService = {
  create: async ({ title, participantIds }: VoteType) => {
    console.log('chegou aqui')

    const response = await api.post('/create-vote', { title, participantIds })
    console.log('chegou aqui')

    return response.data
  },

  delete: async () => {
    await api.delete('/delete-votes')
  },

  list: async () => await api.get('/list-votes'),

  listById: async (id: string) => await api.get(`/vote/${id}`)
}