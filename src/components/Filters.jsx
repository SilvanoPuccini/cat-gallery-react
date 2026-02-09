function Filters({ breeds, filters, onBreedChange, onOrderChange, onReset, onApply }) {
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
