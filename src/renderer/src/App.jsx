import { Routes, Route } from 'react-router-dom'
import { ROUTES } from './router/routes'
import { LoadingScreen } from './scenes/LoadingScreen'
import MainMenu from './scenes/MainMenu'
import LevelSelection from './scenes/LevelSelection'
import { BombScene } from './scenes/BombScene'
import Credits from './scenes/Credits'

function App() {
    return (
        <div className='w-full h-screen'>
            <Routes>
                <Route path={ROUTES.LOADING} element={<LoadingScreen />} />
                <Route path={ROUTES.HOME} element={<MainMenu />} />
                <Route path={ROUTES.LEVELS} element={<LevelSelection />} />
                <Route path={ROUTES.GAME} element={<BombScene />} />
                <Route path={ROUTES.CREDITS} element={<Credits />} />
            </Routes>
        </div>
    )
}

export default App