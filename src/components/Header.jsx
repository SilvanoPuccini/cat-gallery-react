import catLogo from '/assets/favicon/cat-logo-128.svg'

function Header({ favoritesCount, onToggleFavorites }) {
  return (
    <header className="header">
      <div className="header-content">
        <img src={catLogo} alt="Cat logo" className="header-logo" />
        <div>
          <h1>CatGallery</h1>
          <p>Explorador de gatos usando The Cat API</p>
        </div>
      </div>
      <button className="favorites-btn" onClick={onToggleFavorites}>
        <span className="heart-icon">❤️</span>
        <span className="favorites-label">Mis favoritos</span>
        <span className="badge">{favoritesCount}</span>
      </button>
    </header>
  )
}

export default Header
