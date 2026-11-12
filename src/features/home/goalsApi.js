import api from '../../services/api'

export async function getGoals(signal) {
  const { data } = await api.get('goals', { signal })
  return data
}

export async function deleteGoalFromApi(id) {
  await api.delete(`goals/${id}`)
}

export async function createGoalInApi(goal) {
  const { data } = await api.post('goals', goal)
  return data
}

export async function updateGoalInApi(id, goal) {
  const { data } = await api.put(`goals/${id}`, goal)
  return data
}

export async function getGoalActivities(signal) {
  const { data } = await api.get('activity-sessions/categories', { signal })
  return data
}

export async function createGoalActivity(name) {
  const { data } = await api.post('activity-sessions/categories', {
    name: name.trim(),
  })
  return data
}