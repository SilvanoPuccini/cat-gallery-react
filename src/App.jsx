import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Filters from './components/Filters.jsx'
import FavoritesPanel from './components/FavoritesPanel.jsx'
import Gallery from './components/Gallery.jsx'
import Header from './components/Header.jsx'
import Modal from './components/Modal.jsx'

const API_BASE = 'https://api.thecatapi.com/v1'
const LIMIT = 9
const FAVORITES_KEY = 'cat-gallery-favorites'

const getStoredFavorites = () => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    return []
  }
}

function App() {
  const [cats, setCats] = useState([])
  const [favorites, setFavorites] = useState([])
  const [breeds, setBreeds] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [selectedCat, setSelectedCat] = useState(null)
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)
  const [filters, setFilters] = useState({
    breedId: '',
    order: 'RANDOM',
  })

  const sentinelRef = useRef(null)
  const wrapperRef = useRef(null)

  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.id)), [favorites])
  const breedMap = useMemo(() => new Map(breeds.map((breed) => [breed.id, breed])), [breeds])

  useEffect(() => {
    setFavorites(getStoredFavorites())
  }, [])

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    document.body.classList.toggle('favorites-open', isFavoritesOpen)
  }, [isFavoritesOpen])

  useEffect(() => {
    const fetchBreeds = async () => {
      try {
        const response = await fetch(`${API_BASE}/breeds`)
        if (!response.ok) {
          throw new Error('No se pudieron cargar las razas')
        }
        const data = await response.json()
        setBreeds(data)
      } catch (error) {
        setError(error.message)
      }
    }

    fetchBreeds()
  }, [])

  const fetchCats = useCallback(
    async ({ reset = false, nextPage = 0 } = {}) => {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams({
          limit: LIMIT.toString(),
          page: nextPage.toString(),
          order: filters.order,
          has_breeds: '1',
        })

        if (filters.breedId) {
          params.set('breed_ids', filters.breedId)
        }

        const response = await fetch(`${API_BASE}/images/search?${params.toString()}`)
        if (!response.ok) {
          throw new Error('No pudimos cargar las imágenes. Intenta nuevamente.')
        }
        const data = await response.json()
        const enriched = data.map((cat) => {
          if (cat.breeds?.length) {
            return cat
          }
          if (filters.breedId && breedMap.has(filters.breedId)) {
            return { ...cat, breeds: [breedMap.get(filters.breedId)] }
          }
          return cat
        })
        setCats((prev) => (reset ? enriched : [...prev, ...enriched]))
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    },
    [filters, breedMap],
  )

  useEffect(() => {
    fetchCats({ reset: true, nextPage: 0 })
    setPage(0)
  }, [fetchCats])

  useEffect(() => {
    const sentinel = sentinelRef.current
    const wrapper = wrapperRef.current
    if (!sentinel || !wrapper) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && !loading) {
          setPage((prev) => prev + 1)
        }
      },
      { threshold: 0.4, root: wrapper },
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [loading])

  useEffect(() => {
    if (page === 0) return
    fetchCats({ reset: false, nextPage: page })
  }, [page, fetchCats])

  const handleToggleFavorite = (cat) => {
    setFavorites((prev) => {
      if (prev.some((item) => item.id === cat.id)) {
        return prev.filter((item) => item.id !== cat.id)
      }
      return [
        {
          id: cat.id,
          url: cat.url,
          breeds: cat.breeds ?? [],
        },
        ...prev,
      ]
    })
  }

  const handleApplyFilters = () => {
    fetchCats({ reset: true, nextPage: 0 })
    setPage(0)
  }

  const handleResetFilters = () => {
    setFilters({
      breedId: '',
      order: 'RANDOM',
    })
  }

  return (
    <div>
      <Header favoritesCount={favorites.length} onToggleFavorites={() => setIsFavoritesOpen((prev) => !prev)} />
      <div className="container">
        <div className="gallery-section">
          <Filters
            breeds={breeds}
            filters={filters}
            onBreedChange={(event) => setFilters((prev) => ({ ...prev, breedId: event.target.value }))}
            onOrderChange={(event) => setFilters((prev) => ({ ...prev, order: event.target.value }))}
            onReset={handleResetFilters}
            onApply={handleApplyFilters}
          />
          <Gallery
            cats={cats}
            favoriteIds={favoriteIds}
            onToggleFavorite={handleToggleFavorite}
            onSelectCat={setSelectedCat}
            wrapperRef={wrapperRef}
            sentinelRef={sentinelRef}
            loading={loading}
            error={error}
          />
        </div>
        <FavoritesPanel
          favorites={favorites}
          onToggleFavorite={handleToggleFavorite}
          onSelectCat={setSelectedCat}
          onClose={() => setIsFavoritesOpen(false)}
        />
      </div>
      <Modal cat={selectedCat} onClose={() => setSelectedCat(null)} />
    </div>
  )
}

export default App
