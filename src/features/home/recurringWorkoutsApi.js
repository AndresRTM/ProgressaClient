
import api from '../../services/api'

const BASE_URL = 'recurring-workouts'

// Skapa ett veckoschema
export async function createRecurringWorkout(workout) {
  const { data } = await api.post(BASE_URL, workout)
  return data
}

// Hämta alla veckoscheman
export async function getRecurringWorkouts(signal) {
  const { data } = await api.get(BASE_URL, { signal })
  return data
}

// Hämta ett specifikt veckoschema
export async function getRecurringWorkout(id) {
  const { data } = await api.get(`${BASE_URL}/${id}`)
  return data
}

// Uppdatera ett veckoschema
export async function updateRecurringWorkout(id, workout) {
  await api.put(`${BASE_URL}/${id}`, workout)
}

// Ta bort ett veckoschema
export async function deleteRecurringWorkout(id) {
  await api.delete(`${BASE_URL}/${id}`)
}

// Hämta beräknade träningstillfällen för ett datumintervall
export async function getRecurringOccurrences(from, to, signal) {
  const { data } = await api.get(`${BASE_URL}/occurrences`, {
    params: { from, to },
    signal,
  })

  return data
}
