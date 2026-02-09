function Filters({ breeds, filters, onBreedChange, onOrderChange, onToggleMime, onReset, onApply }) {
  return (
    <div className="filters">
      <label>
        Filtrar por raza:
        <select value={filters.breedId} onChange={onBreedChange}>
          <option value="">Todas las razas</option>
          {breeds.map((breed) => (
            <option key={breed.id} value={breed.id}>
              {breed.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Orden:
        <select value={filters.order} onChange={onOrderChange}>
          <option value="DESC">Populares</option>
          <option value="ASC">Recientes</option>
          <option value="RANDOM">Aleatorio</option>
        </select>
      </label>
      <div className="filters-types">
        <span>Tipo:</span>
        {['jpg', 'png', 'gif'].map((type) => (
          <label key={type} className="filters-checkbox">
            <input
              type="checkbox"
              checked={filters.mimeTypes.includes(type)}
              onChange={() => onToggleMime(type)}
            />
            {type.toUpperCase()}
          </label>
        ))}
      </div>
      <div className="filters-actions">
        <button type="button" onClick={onReset}>
          Limpiar
        </button>
        <button type="button" className="primary" onClick={onApply}>
          Aplicar
        </button>
      </div>
    </div>
  )
}

export default Filters
