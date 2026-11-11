import { useEffect, useState } from 'react'

const pages = new Set([
  'plan',
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

function hashFor(page) {
  return page === 'home' ? '#home' : `#/${page}`
}

export default function useRoute() {
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
    window.history.pushState({ progressaRoute: true }, '', hashFor(nextPage))
    setPage(nextPage)
  }

  function goBack() {
    if (window.history.state?.progressaRoute) {
      window.history.back()
    } else {
      const parent = page.startsWith('settings/') ? 'settings' : 'home'
      window.history.replaceState(null, '', hashFor(parent))
      setPage(parent)
    }
  }

  return { page, navigate, goBack }
}
