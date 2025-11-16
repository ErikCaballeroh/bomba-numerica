import { GLBViewer } from './components/GLBWiever'
import { LoadingScreen } from './scenes/LoadingScreen'
import MainMenu from './scenes/MainMenu'

function App() {
    return (
        <div className='w-[full]'>
            {/* <LoadingScreen /> */}
            <MainMenu />
        </div>

    )
}

export default App