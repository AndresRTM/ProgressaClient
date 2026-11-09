import HomePage from './features/home/HomePage'
import { SportsProvider } from './features/activities/SportsProvider'
import './App.css'

export default function App() {
  return (
    <SportsProvider>
      <HomePage />
    </SportsProvider>
  )
}
