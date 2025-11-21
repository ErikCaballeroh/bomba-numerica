import PropTypes from 'prop-types'

export const ModuleScaffold = ({
  topic,
  title,
  description = 'Define aqui la dinamica del modulo.',
  onComplete,
  onError,
  onClose,
  children
}) => {
  const trigger = (fn) => {
    if (typeof fn === 'function') {
      fn()
    }
  }

  return (
    <div className="space-y-5">
      <div>
        {topic && <p className="text-xs uppercase tracking-[0.2em] text-white/60">{topic}</p>}
        <h2 className="text-2xl font-bold text-white">{title}</h2>
      </div>

      <div className="min-h-[220px] rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/80">
        <p className="mb-4">{description}</p>
        {children}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* <button
          type="button"
          onClick={() => trigger(onError)}
          className="rounded-xl border border-rose-400/60 px-4 py-2 text-sm font-semibold text-rose-200 transition hover:bg-rose-400/10"
        >
          Reportar error
        </button> */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => trigger(onClose)}
            className="rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Cerrar
          </button>
          {/* <button
            type="button"
            onClick={() => trigger(onComplete)}
            className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
          >
            Marcar completado
          </button> */}
        </div>
      </div>
    </div>
  )
}

ModuleScaffold.propTypes = {
  topic: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  onComplete: PropTypes.func,
  onError: PropTypes.func,
  onClose: PropTypes.func,
  children: PropTypes.node
}
