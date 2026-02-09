import { useCallback, useEffect, useMemo, useState } from 'react'

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

function App() {
  const [cats, setCats] = useState([])
  const [favorites, setFavorites] = useState([])
  const [breeds, setBreeds] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [page, setPage] = useState(0)
  const [selectedCat, setSelectedCat] = useState(null)
  const [filters, setFilters] = useState({
    breedId: '',
    mimeTypes: ['jpg'],
    order: 'RANDOM',
  })

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

  const handleLoadMore = async () => {
    const nextPage = page + 1
    setPage(nextPage)
    await fetchCats({ reset: false, nextPage })
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

  const heroStat = `${cats.length} gatos listos para enamorarte`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-teal-300">CatGallery</p>
              <h1 className="text-4xl font-semibold text-white md:text-5xl">
                Tu galería moderna de gatos favoritos
              </h1>
              <p className="max-w-2xl text-base text-slate-300 md:text-lg">
                Explora imágenes de The Cat API, guarda tus favoritas y descubre datos de cada
                raza en un solo lugar.
              </p>
            </div>
            <div className="glass-panel flex flex-col gap-2 px-6 py-4 shadow-[0_0_30px_rgba(45,212,191,0.25)]">
              <span className="text-sm text-teal-200">Estado actual</span>
              <span className="text-xl font-semibold text-white">{heroStat}</span>
              <span className="text-xs text-slate-400">Se sincroniza con tu almacenamiento local.</span>
            </div>
          </div>
        </header>

        <section className="glass-panel space-y-6 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Filtros inteligentes</h2>
              <p className="text-sm text-slate-300">
                Filtra por raza, tipo de imagen y orden para una experiencia personalizada.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-200 transition hover:border-teal-400 hover:text-teal-200"
                onClick={handleResetFilters}
              >
                Restaurar
              </button>
              <button
                className="rounded-full bg-teal-400 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-teal-300"
                onClick={handleApplyFilters}
              >
                Aplicar filtros
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Raza
              <select
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
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
            <label className="flex flex-col gap-2 text-sm text-slate-300">
              Orden
              <select
                className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white"
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
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <span className="text-sm text-slate-300">Tipo de imagen</span>
            {mimeOptions.map((option) => (
              <label key={option.value} className="flex items-center gap-2 text-sm text-slate-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/20 bg-slate-900 text-teal-400 focus:ring-teal-400"
                  checked={filters.mimeTypes.includes(option.value)}
                  onChange={() => handleMimeToggle(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Favoritos</h2>
              <p className="text-sm text-slate-300">
                Tus gatos marcados se guardan automáticamente en tu dispositivo.
              </p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
              {favorites.length} guardados
            </span>
          </div>

          {favorites.length === 0 ? (
            <div className="glass-panel p-6 text-center text-sm text-slate-300">
              Aún no hay favoritos. Empieza a guardar tus gatos preferidos.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-3">
              {favorites.map((cat) => (
                <article
                  key={cat.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/60"
                >
                  <img
                    src={cat.url}
                    alt="Gato favorito"
                    className="h-48 w-full object-cover transition group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div>
                      <p className="text-base font-semibold text-white">
                        {cat.breeds?.[0]?.name ?? 'Gato sin raza definida'}
                      </p>
                      <p className="text-xs text-slate-400">{cat.breeds?.[0]?.origin ?? 'Origen desconocido'}</p>
                    </div>
                    <button
                      className="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-200 transition hover:border-rose-400 hover:text-rose-200"
                      onClick={() => handleToggleFavorite(cat)}
                    >
                      Quitar de favoritos
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-white">Galería principal</h2>
              <p className="text-sm text-slate-300">
                Descubre nuevas imágenes y encuentra el gato ideal para ti.
              </p>
            </div>
            {loading && <span className="text-sm text-teal-200">Cargando...</span>}
          </div>

          {error && (
            <div className="glass-panel border border-rose-500/40 p-4 text-sm text-rose-200">
              {error}
            </div>
          )}

          {!loading && cats.length === 0 && !error && (
            <div className="glass-panel p-6 text-center text-sm text-slate-300">
              No encontramos gatos con esos filtros. Prueba con otra combinación.
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-3">
            {cats.map((cat) => {
              const isFavorite = favoriteIds.has(cat.id)
              const breed = cat.breeds?.[0]

              return (
                <article
                  key={cat.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-slate-900/70"
                >
                  <div className="relative">
                    <img
                      src={cat.url}
                      alt={breed?.name ? `Gato ${breed.name}` : 'Gato adorable'}
                      className="h-56 w-full object-cover transition group-hover:scale-105"
                      loading="lazy"
                    />
                    <button
                      className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold transition ${
                        isFavorite
                          ? 'bg-rose-500 text-white'
                          : 'bg-white/10 text-slate-100 hover:bg-white/20'
                      }`}
                      onClick={() => handleToggleFavorite(cat)}
                    >
                      {isFavorite ? 'Favorito' : 'Guardar'}
                    </button>
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <div>
                      <p className="text-lg font-semibold text-white">
                        {breed?.name ?? 'Gato sin raza definida'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {breed?.temperament ?? 'Personalidad misteriosa'}
                      </p>
                    </div>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-300">
                        {breed?.origin ?? 'Origen desconocido'}
                      </span>
                      <button
                        className="text-xs font-semibold text-teal-300 transition hover:text-teal-200"
                        onClick={() => setSelectedCat(cat)}
                      >
                        Ver detalles
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>

          <div className="flex justify-center">
            <button
              className="rounded-full bg-white/10 px-6 py-3 text-sm text-slate-100 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleLoadMore}
              disabled={loading}
            >
              Cargar más gatos
            </button>
          </div>
        </section>
      </div>

      {selectedCat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-6">
          <div className="glass-panel max-w-xl space-y-4 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-teal-200">Detalle de la raza</p>
                <h3 className="text-2xl font-semibold text-white">
                  {selectedCat.breeds?.[0]?.name ?? 'Sin información'}
                </h3>
              </div>
              <button
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200"
                onClick={() => setSelectedCat(null)}
              >
                Cerrar
              </button>
            </div>
            <img
              src={selectedCat.url}
              alt="Gato en detalle"
              className="h-64 w-full rounded-2xl object-cover"
            />
            <div className="space-y-2 text-sm text-slate-200">
              <p>
                <span className="font-semibold text-white">Temperamento:</span>{' '}
                {selectedCat.breeds?.[0]?.temperament ?? 'No disponible'}
              </p>
              <p>
                <span className="font-semibold text-white">Origen:</span>{' '}
                {selectedCat.breeds?.[0]?.origin ?? 'No disponible'}
              </p>
              <p className="text-slate-300">
                {selectedCat.breeds?.[0]?.description ??
                  'Este gato no tiene información adicional registrada.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
