import Model3D from './components/Model3D'

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <h1 style={{
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 1,
        color: 'white',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
      }}>
        Mi Modelo 3D
      </h1>
      <Model3D />
    </div>
  )
}

export default App