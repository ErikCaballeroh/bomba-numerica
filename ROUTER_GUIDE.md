# Guía de React Router - Bomba Numérica

## Estructura de Rutas

El proyecto ahora utiliza React Router para manejar la navegación entre las diferentes pantallas del juego.

### Rutas disponibles:
- **`/`** - Menú principal (MainMenu)
- **`/levels`** - Selección de niveles (LevelSelection)
- **`/loading`** - Pantalla de carga (LoadingScreen)
- **`/game/:levelId`** - Pantalla del juego (Game Screen)

## Cómo usar el sistema de navegación

### 1. Usar el hook `useNavigation`

El hook `useNavigation` proporciona métodos convenientes para navegar entre pantallas:

```jsx
import { useNavigation } from '../hooks/useNavigation'

export default function MyComponent() {
  const { goHome, goLevels, goGame, navigate } = useNavigation()

  return (
    <div>
      <button onClick={goHome}>Ir al menú</button>
      <button onClick={goLevels}>Ver niveles</button>
      <button onClick={() => goGame(1)}>Jugar nivel 1</button>
    </div>
  )
}
```

### 2. Métodos disponibles en `useNavigation`:

- **`goHome()`** - Navega al menú principal
- **`goLevels()`** - Navega a la selección de niveles
- **`goLoading()`** - Navega a la pantalla de carga
- **`goGame(levelId)`** - Navega a la pantalla del juego con un nivel específico
- **`navigate(path)`** - Navega a una ruta personalizada

### 3. Usar directamente las constantes de rutas

```jsx
import { ROUTES, getGameRoute } from '../router/routes'
import { useNavigate } from 'react-router-dom'

export default function MyComponent() {
  const navigate = useNavigate()

  return (
    <button onClick={() => navigate(ROUTES.HOME)}>
      Ir a inicio
    </button>
  )
}
```

## Próximos pasos

1. Implementar la lógica de selección de niveles en `LevelSelection.jsx`
2. Crear el componente `GameScreen` completo con la lógica del juego
3. Agregar parámetros adicionales si es necesario (dificultad, puntuación, etc.)
4. Implementar navegación hacia atrás/cancelar en las pantallas del juego
