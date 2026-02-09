function Gallery({ cats, favoriteIds, onToggleFavorite, onSelectCat, wrapperRef, sentinelRef, loading, error }) {
  return (
    <section className="gallery-section">
      <h2>Galería</h2>
      <div className="gallery-wrapper" ref={wrapperRef}>
        {loading && <div className="loader" />}
        {error && <p className="gallery-empty">{error}</p>}
        <div className="gallery">
          {!loading && cats.length === 0 && !error && (
            <div className="gallery-empty">No encontramos gatos con esos filtros.</div>
          )}
          {cats.map((cat) => {
            const isFavorite = favoriteIds.has(cat.id)
            const breed = cat.breeds?.[0]

            return (
              <article key={cat.id} className="cat-card">
                <button
                  className={`favorite ${isFavorite ? 'active' : ''}`}
                  onClick={(event) => {
                    event.stopPropagation()
                    onToggleFavorite(cat)
                  }}
                  aria-label="Guardar en favoritos"
                >
                  {isFavorite ? '❤️' : '🤍'}
                </button>
                <button className="card-button" onClick={() => onSelectCat(cat)}>
                  <img src={cat.url} alt={breed?.name ? `Gato ${breed.name}` : 'Gato adorable'} />
                </button>
                <div className="cat-info">
                  <h3>{breed?.name ?? 'Gato sin raza definida'}</h3>
                  <p>{breed?.temperament ?? 'Personalidad misteriosa'}</p>
                  <span>{breed?.origin ?? 'Origen desconocido'}</span>
                </div>
              </article>
            )
          })}
        </div>
        <div id="scrollSentinel" ref={sentinelRef} />
      </div>
    </section>
  )
}

export default Gallery
