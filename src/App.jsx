import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

const API_BASE = 'https://api.thecatapi.com/v1'
const LIMIT = 9
const FAVORITES_KEY = 'cat-gallery-favorites'

const mimeOptions = [
  { label: 'JPG', value: 'jpg' },
  { label: 'PNG', value: 'png' },
  { label: 'GIF', value: 'gif' },
]

const orderOptions = [
  { label: 'Populares', value: 'DESC' },
  { label: 'Recientes', value: 'ASC' },
  { label: 'Aleatorio', value: 'RANDOM' },
]

const getStoredFavorites = () => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    return []
  }
}

const getBreedDetails = (cat) => cat?.breeds?.[0]

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
    mimeTypes: ['jpg'],
    order: 'RANDOM',
  })

  const sentinelRef = useRef(null)

  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.id)), [favorites])

  useEffect(() => {
    setFavorites(getStoredFavorites())
  }, [])

  useEffect(() => {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
  }, [favorites])

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
        })

        if (filters.breedId) {
          params.set('breed_ids', filters.breedId)
        }

        if (filters.mimeTypes.length > 0) {
          params.set('mime_types', filters.mimeTypes.join(','))
        }

        const response = await fetch(`${API_BASE}/images/search?${params.toString()}`)
        if (!response.ok) {
          throw new Error('No pudimos cargar las imágenes. Intenta nuevamente.')
        }
        const data = await response.json()
        setCats((prev) => (reset ? data : [...prev, ...data]))
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    },
    [filters],
  )

  useEffect(() => {
    fetchCats({ reset: true, nextPage: 0 })
    setPage(0)
  }, [fetchCats])

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry.isIntersecting && !loading) {
          setPage((prev) => prev + 1)
        }
      },
      { threshold: 0.4 },
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
      mimeTypes: ['jpg'],
      order: 'RANDOM',
    })
  }

  const handleMimeToggle = (value) => {
    setFilters((prev) => {
      const exists = prev.mimeTypes.includes(value)
      return {
        ...prev,
        mimeTypes: exists ? prev.mimeTypes.filter((item) => item !== value) : [...prev.mimeTypes, value],
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-neutral-900 to-black text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6">
        <header className="flex flex-col items-center gap-4 text-center">
          <img
            src="/assets/favicon/cat-logo-128.svg"
            alt="Cat logo"
            className="h-16 w-16"
          />
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">CatGallery</h1>
            <p className="text-sm text-zinc-300">Explorador de gatos usando The Cat API</p>
          </div>
          <button
            className="flex items-center gap-3 rounded-full bg-rose-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/30 transition hover:bg-rose-400"
            onClick={() => setIsFavoritesOpen((prev) => !prev)}
          >
            <span className="text-lg">❤️</span>
            Mis favoritos
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{favorites.length}</span>
          </button>
        </header>

        <section className="glass-panel space-y-4 p-5 text-sm text-zinc-300">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold text-white">Filtros</p>
            <div className="flex gap-3">
              <button
                className="rounded-full border border-white/10 px-4 py-2 text-xs text-zinc-200 transition hover:border-rose-400"
                onClick={handleResetFilters}
              >
                Limpiar
              </button>
              <button
                className="rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-rose-400"
                onClick={handleApplyFilters}
              >
                Aplicar
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="flex flex-col gap-2 text-xs uppercase tracking-wide">
              Raza
              <select
                className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white"
                value={filters.breedId}
                onChange={(event) => setFilters((prev) => ({ ...prev, breedId: event.target.value }))}
              >
                <option value="">Todas las razas</option>
                {breeds.map((breed) => (
                  <option key={breed.id} value={breed.id}>
                    {breed.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-xs uppercase tracking-wide">
              Orden
              <select
                className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-2 text-sm text-white"
                value={filters.order}
                onChange={(event) => setFilters((prev) => ({ ...prev, order: event.target.value }))}
              >
                {orderOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-col gap-2 text-xs uppercase tracking-wide">
              Tipo
              <div className="flex flex-wrap gap-4 text-sm">
                {mimeOptions.map((option) => (
                  <label key={option.value} className="flex items-center gap-2 text-sm text-zinc-200">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-white/20 bg-zinc-900 text-rose-400 focus:ring-rose-400"
                      checked={filters.mimeTypes.includes(option.value)}
                      onChange={() => handleMimeToggle(option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Galería</h2>
              <p className="text-sm text-zinc-300">
                Haz clic en una foto para ver toda la información disponible de la raza.
              </p>
            </div>
            {loading && <span className="text-sm text-rose-200">Cargando...</span>}
          </div>

          {error && (
            <div className="glass-panel border border-rose-500/40 p-4 text-sm text-rose-200">
              {error}
            </div>
          )}

          {!loading && cats.length === 0 && !error && (
            <div className="glass-panel p-6 text-center text-sm text-zinc-300">
              No encontramos gatos con esos filtros. Prueba con otra combinación.
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cats.map((cat) => {
              const isFavorite = favoriteIds.has(cat.id)
              const breed = getBreedDetails(cat)

              return (
                <article
                  key={cat.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/60"
                >
                  <div className="relative">
                    <button
                      className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-lg text-white transition hover:border-rose-400"
                      onClick={() => handleToggleFavorite(cat)}
                      aria-label="Guardar en favoritos"
                    >
                      {isFavorite ? '❤️' : '🤍'}
                    </button>
                    <button
                      className="block w-full"
                      onClick={() => setSelectedCat(cat)}
                      aria-label="Ver detalle del gato"
                    >
                      <img
                        src={cat.url}
                        alt={breed?.name ? `Gato ${breed.name}` : 'Gato adorable'}
                        className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {breed?.name ?? 'Gato sin raza definida'}
                      </p>
                      <p className="text-xs text-zinc-400">
                        {breed?.temperament ?? 'Personalidad misteriosa'}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center justify-between text-xs text-zinc-300">
                      <span className="rounded-full border border-white/10 px-3 py-1">
                        {breed?.origin ?? 'Origen desconocido'}
                      </span>
                      <span className="rounded-full border border-white/10 px-3 py-1">
                        {breed?.life_span ? `${breed.life_span} años` : 'Edad promedio N/D'}
                      </span>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
          <div ref={sentinelRef} className="h-10" />
        </section>

        <section
          className={`glass-panel overflow-hidden transition-all ${
            isFavoritesOpen ? 'max-h-[40rem] p-5 opacity-100' : 'max-h-0 p-0 opacity-0'
          }`}
        >
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-lg font-semibold">Mis favoritos</h2>
            <button
              className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-200"
              onClick={() => setIsFavoritesOpen(false)}
            >
              Cerrar
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.length === 0 ? (
              <p className="text-sm text-zinc-300">Aún no hay favoritos guardados.</p>
            ) : (
              favorites.map((cat) => (
                <article
                  key={cat.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/70"
                >
                  <button
                    className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-rose-500 text-sm"
                    onClick={() => handleToggleFavorite(cat)}
                    aria-label="Quitar de favoritos"
                  >
                    ✕
                  </button>
                  <button
                    className="block w-full"
                    onClick={() => setSelectedCat(cat)}
                    aria-label="Ver detalle del gato favorito"
                  >
                    <img
                      src={cat.url}
                      alt="Gato favorito"
                      className="h-36 w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </button>
                  <div className="p-3 text-xs text-zinc-300">
                    <p className="text-sm font-semibold text-white">
                      {cat.breeds?.[0]?.name ?? 'Gato sin raza definida'}
                    </p>
                    <p>{cat.breeds?.[0]?.origin ?? 'Origen desconocido'}</p>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      {selectedCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 sm:px-6">
          <div className="glass-panel w-full max-w-2xl space-y-5 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-rose-200">Detalle completo</p>
                <h3 className="text-2xl font-semibold text-white">
                  {selectedCat.breeds?.[0]?.name ?? 'Sin información'}
                </h3>
              </div>
              <button
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-200"
                onClick={() => setSelectedCat(null)}
              >
                Cerrar
              </button>
            </div>
            <img
              src={selectedCat.url}
              alt="Gato en detalle"
              className="h-72 w-full rounded-2xl object-cover"
            />
            <div className="grid gap-3 text-sm text-zinc-200 md:grid-cols-2">
              <div>
                <p className="font-semibold text-white">Personalidad</p>
                <p>{selectedCat.breeds?.[0]?.temperament ?? 'No disponible'}</p>
              </div>
              <div>
                <p className="font-semibold text-white">Procedencia</p>
                <p>{selectedCat.breeds?.[0]?.origin ?? 'No disponible'}</p>
              </div>
              <div>
                <p className="font-semibold text-white">Peso</p>
                <p>{selectedCat.breeds?.[0]?.weight?.metric ?? 'No disponible'} kg</p>
              </div>
              <div>
                <p className="font-semibold text-white">Esperanza de vida</p>
                <p>{selectedCat.breeds?.[0]?.life_span ?? 'No disponible'} años</p>
              </div>
            </div>
            <p className="text-sm text-zinc-300">
              {selectedCat.breeds?.[0]?.description ??
                'Este gato no tiene información adicional registrada en la API.'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
