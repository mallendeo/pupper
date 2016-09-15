import { post } from './fetch'

export const getValidToken = async () => {
  const res = await post('/token/renew', { password: 'admin' })
  const data = await res.json()
  return data.token
}
