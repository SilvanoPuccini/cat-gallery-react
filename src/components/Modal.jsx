function Modal({ cat, onClose }) {
  if (!cat) return null

  const breed = cat.breeds?.[0]

  return (
    <div className="modal">
      <div className="modal-overlay" onClick={onClose} />
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Cerrar modal">
          ×
        </button>
        <img src={cat.url} alt="Gato en detalle" />
        <div className="modal-info">
          <h2>{breed?.name ?? 'Sin información'}</h2>
          <p>
            <strong>Personalidad:</strong> {breed?.temperament ?? 'No disponible'}
          </p>
          <p>
            <strong>Procedencia:</strong> {breed?.origin ?? 'No disponible'}
          </p>
          <p>
            <strong>Peso:</strong> {breed?.weight?.metric ?? 'No disponible'} kg
          </p>
          <p>
            <strong>Esperanza de vida:</strong> {breed?.life_span ?? 'No disponible'} años
          </p>
          <p>{breed?.description ?? 'Este gato no tiene información adicional registrada en la API.'}</p>
        </div>
      </div>
    </div>
  )
}

export default Modal
