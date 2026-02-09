function FavoritesPanel({ favorites, onToggleFavorite, onSelectCat, onClose }) {
  return (
    <aside className="favorites-panel">
      <div className="favorites-panel-header">
        <h2>Mis Favoritos</h2>
        <button className="close-btn" onClick={onClose} aria-label="Cerrar favoritos">
          ×
        </button>
      </div>
      <div className="favorites-container">
        {favorites.length === 0 ? (
          <div className="favorites-empty">Aún no hay favoritos guardados.</div>
        ) : (
          <div className="favorites-gallery">
            {favorites.map((cat) => (
              <article key={cat.id} className="cat-card" onClick={() => onSelectCat(cat)}>
                <button
                  className="favorite active"
                  onClick={(event) => {
                    event.stopPropagation()
                    onToggleFavorite(cat)
                  }}
                  aria-label="Quitar de favoritos"
                >
                  ✕
                </button>
                <img src={cat.url} alt="Gato favorito" />
              </article>
            ))}
          </div>
        )}
      </div>
    </aside>
  )
}

export default FavoritesPanel
