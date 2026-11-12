import api from '../../services/api'

export async function deletePlannedSession(id) {
    await api.delete(`activity-sessions/${id}`)
}