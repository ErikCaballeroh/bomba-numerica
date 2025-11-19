import { useState } from 'react'
import { ModuleScaffold } from '../common/ModuleScaffold'

export const InterpolacionLinealModule = (props) => {
  const [puntos, setPuntos] = useState([
    { x: 1, y: 2 },
    { x: 3, y: 4 }
  ])
  const [nuevoPunto, setNuevoPunto] = useState({ x: '', y: '' })

  const handleChange = (field, value) => {
    setNuevoPunto((prev) => ({ ...prev, [field]: value }))
  }

  const handleAgregarPunto = () => {
    const x = Number(nuevoPunto.x)
    const y = Number(nuevoPunto.y)
    if (Number.isNaN(x) || Number.isNaN(y)) return
    setPuntos((prev) => [...prev, { x, y }])
    setNuevoPunto({ x: '', y: '' })
  }

  return (
    <ModuleScaffold
      {...props}
      topic="Interpolacion"
      title="Interpolacion Lineal"
      description="Prueba con diferentes puntos para construir una recta por interpolación lineal."
    >
      {/* A partir de aquí ya es TU minijuego */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-white/70">x</label>
            <input
              type="number"
              value={nuevoPunto.x}
              onChange={(e) => handleChange('x', e.target.value)}
              className="mt-1 w-24 rounded-md border border-white/20 bg-black/40 px-2 py-1 text-sm text-white outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70">y</label>
            <input
              type="number"
              value={nuevoPunto.y}
              onChange={(e) => handleChange('y', e.target.value)}
              className="mt-1 w-24 rounded-md border border-white/20 bg-black/40 px-2 py-1 text-sm text-white outline-none focus:border-emerald-400"
            />
          </div>
          <button
            type="button"
            onClick={handleAgregarPunto}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Agregar punto
          </button>
        </div>

        <div className="rounded-lg border border-white/10 bg-black/30 p-3 text-xs text-white/80">
          <p className="mb-2 font-semibold text-white">Puntos actuales</p>
          <ul className="space-y-1">
            {puntos.map((p, index) => (
              <li key={`${p.x}-${p.y}-${index}`}>
                ({p.x}, {p.y})
              </li>
            ))}
          </ul>
        </div>

        {/* Aquí luego puedes dibujar la recta, mostrar cálculos, etc. */}
      </div>
    </ModuleScaffold>
  )
}