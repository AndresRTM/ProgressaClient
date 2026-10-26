import { useEffect, useState } from 'react'

const pages = new Set([
  'settings',
  'settings/logging',
  'settings/sports',
  'settings/notifications',
  'settings/units',
])

function currentPage() {
  const page = window.location.hash.slice(2)
  return pages.has(page) ? page : 'home'
}

export default function useSettingsRoute() {
  const [page, setPage] = useState(currentPage)

  useEffect(() => {
    const syncPage = () => setPage(currentPage())
    window.addEventListener('hashchange', syncPage)
    window.addEventListener('popstate', syncPage)
    return () => {
      window.removeEventListener('hashchange', syncPage)
      window.removeEventListener('popstate', syncPage)
    }
  }, [])

  function navigate(nextPage) {
    if (nextPage === currentPage()) return
    const hash = nextPage === 'home' ? '#home' : `#/${nextPage}`
    window.history.pushState({ progressaSettings: true }, '', hash)
    setPage(nextPage)
  }

  function goBack() {
    if (window.history.state?.progressaSettings) {
      window.history.back()
    } else {
      const parent = page === 'settings' ? 'home' : 'settings'
      window.history.replaceState(null, '', parent === 'home' ? '#home' : `#/${parent}`)
      setPage(parent)
    }
  }

  return { page, navigate, goBack }
}
