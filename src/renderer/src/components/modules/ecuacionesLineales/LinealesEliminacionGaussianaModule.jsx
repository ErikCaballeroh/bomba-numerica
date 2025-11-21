import React, { useState } from 'react';
import { ModuleScaffold } from '../common/ModuleScaffold';

export const LinealesEliminacionGaussianaModule = (props) => {
  const [matrix, setMatrix] = useState([
    [1, 1, 1, 6],    // Ejemplo: x + y + z = 6
    [2, 1, -1, 1],   // 2x + y - z = 1
    [1, -1, 2, 8]    // x - y + 2z = 8
  ]);
  
  const [steps, setSteps] = useState([]);
  const [solutions, setSolutions] = useState({ x: null, y: null, z: null });
  const [cableColor, setCableColor] = useState('');

  const performGaussianElimination = () => {
    const newSteps = [];
    const currentMatrix = JSON.parse(JSON.stringify(matrix));
    
    newSteps.push({
      title: "Matriz Inicial",
      matrix: JSON.parse(JSON.stringify(currentMatrix)),
      description: "Matriz aumentada del sistema de ecuaciones"
    });

    // Paso 1: Pivote a11
    const a11 = currentMatrix[0][0];
    
    // Fila 2: R2 ← R2 - (a21/a11)R1
    const factor21 = currentMatrix[1][0] / a11;
    for (let j = 0; j < 4; j++) {
      currentMatrix[1][j] -= factor21 * currentMatrix[0][j];
    }
    
    // Fila 3: R3 ← R3 - (a31/a11)R1
    const factor31 = currentMatrix[2][0] / a11;
    for (let j = 0; j < 4; j++) {
      currentMatrix[2][j] -= factor31 * currentMatrix[0][j];
    }
    
    newSteps.push({
      title: "Después del primer pivote (a11)",
      matrix: JSON.parse(JSON.stringify(currentMatrix)),
      description: `Se crearon ceros debajo del pivote a11 = ${a11}`
    });

    // Paso 2: Pivote a'22
    const a22_prime = currentMatrix[1][1];
    
    // Fila 3: R3 ← R3 - (a'32/a'22)R2
    const factor32 = currentMatrix[2][1] / a22_prime;
    for (let j = 0; j < 4; j++) {
      currentMatrix[2][j] -= factor32 * currentMatrix[1][j];
    }
    
    newSteps.push({
      title: "Matriz Triangular Superior",
      matrix: JSON.parse(JSON.stringify(currentMatrix)),
      description: `Se creó cero debajo del pivote a'22 = ${a22_prime.toFixed(2)}`
    });

    // Sustitución hacia atrás
    const z = currentMatrix[2][3] / currentMatrix[2][2];
    const y = (currentMatrix[1][3] - currentMatrix[1][2] * z) / currentMatrix[1][1];
    const x = (currentMatrix[0][3] - currentMatrix[0][2] * z - currentMatrix[0][1] * y) / currentMatrix[0][0];

    const solution = { x, y, z };
    setSolutions(solution);

    // Determinar color del cable
    const negativeCount = [x, y, z].filter(val => val < 0).length;
    let color = '';
    if (negativeCount === 0) color = 'rojo';
    else if (negativeCount === 1) color = 'azul';
    else color = 'verde';
    
    setCableColor(color);

    newSteps.push({
      title: "Solución",
      matrix: JSON.parse(JSON.stringify(currentMatrix)),
      description: `x = ${x.toFixed(2)}, y = ${y.toFixed(2)}, z = ${z.toFixed(2)} - Cortar cable ${color}`
    });

    setSteps(newSteps);
  };

  const updateMatrixValue = (row, col, value) => {
    const newMatrix = [...matrix];
    newMatrix[row][col] = parseFloat(value) || 0;
    setMatrix(newMatrix);
    setSteps([]);
    setSolutions({ x: null, y: null, z: null });
    setCableColor('');
  };

  return (
    <ModuleScaffold
      {...props}
      topic="Ecuaciones lineales"
      title="Eliminación Gaussiana"
      description="Lienzo para la eliminación gaussiana."
    >
      <div className="p-6">
        {/* Entrada de matriz */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3">Matriz del Sistema (3x3 + términos independientes)</h3>
          <div className="grid grid-cols-4 gap-2 w-64">
            {matrix.map((row, i) => (
              row.map((value, j) => (
                <input
                  key={`${i}-${j}`}
                  type="number"
                  value={value}
                  onChange={(e) => updateMatrixValue(i, j, e.target.value)}
                  className="w-12 p-1 border rounded text-center"
                />
              ))
            ))}
          </div>
        </div>

        {/* Botón para resolver */}
        <button
          onClick={performGaussianElimination}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6"
        >
          Resolver por Eliminación Gaussiana
        </button>

        {/* Pasos de la solución */}
        {steps.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3">Proceso de Solución:</h3>
            {steps.map((step, index) => (
              <div key={index} className="mb-4 p-3 border rounded">
                <h4 className="font-bold">{step.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{step.description}</p>
                <div className="flex space-x-2">
                  {step.matrix.map((row, i) => (
                    <div key={i} className="flex flex-col">
                      {row.map((val, j) => (
                        <div key={j} className="w-12 h-8 border flex items-center justify-center">
                          {val.toFixed(2)}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Resultados finales */}
        {solutions.x !== null && (
          <div className="p-4 bg-gray-100 rounded">
            <h3 className="text-lg font-bold mb-2">Resultados:</h3>
            <p>x = {solutions.x.toFixed(2)}</p>
            <p>y = {solutions.y.toFixed(2)}</p>
            <p>z = {solutions.z.toFixed(2)}</p>
            
            <div className="mt-4 p-3 bg-yellow-100 rounded">
              <h4 className="font-bold">Decisión del cable:</h4>
              <p>
                {cableColor === 'rojo' && '✅ Ninguna variable es negativa - CORTAR CABLE ROJO'}
                {cableColor === 'azul' && '🔵 Una variable es negativa - CORTAR CABLE AZUL'}
                {cableColor === 'verde' && '🟢 Dos o más variables son negativas - CORTAR CABLE VERDE'}
              </p>
            </div>
          </div>
        )}

        {/* Instrucciones del manual */}
        <div className="mt-6 p-4 bg-blue-50 rounded">
          <h3 className="text-lg font-bold mb-2">Instrucciones del Manual:</h3>
          <ul className="list-disc list-inside text-sm">
            <li>Crear matriz aumentada e identificar diagonal principal</li>
            <li>Pivote inicial: a₁₁ - crear ceros debajo</li>
            <li>Siguiente pivote: a₂₂ - crear cero en fila 3</li>
            <li>Sustitución hacia atrás para encontrar x, y, z</li>
            <li>0 negativos → Cable ROJO | 1 negativo → Cable AZUL | 2+ negativos → Cable VERDE</li>
          </ul>
        </div>
      </div>
    </ModuleScaffold>
  );
};