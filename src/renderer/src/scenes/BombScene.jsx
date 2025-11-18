import { useState } from 'react'
import { useNavigation } from '../hooks/useNavigation'
import { useGLBScene } from '../hooks/useGLBScene'
import { GradientOverlays } from '../components/glbViewer/GradientOverlays'
import { BackButton } from '../components/glbViewer/BackButton'
import { LoadingOverlay } from '../components/glbViewer/LoadingOverlay'
import { ErrorBanner } from '../components/glbViewer/ErrorBanner'
import { ResetRotationButton } from '../components/glbViewer/ResetRotationButton'
import { ExitConfirmationModal } from '../components/glbViewer/ExitConfirmationModal'
import { PdfViewerButton } from '../components/glbViewer/PdfViewerButton'

export const BombScene = () => {
    const [showExitConfirm, setShowExitConfirm] = useState(false)
    const { goLevels } = useNavigation()
    const { mountRef, loading, error, resetRotation, retry } = useGLBScene()

    const handleBackClick = () => {
        setShowExitConfirm(true)
    }

    const confirmExit = () => {
        setShowExitConfirm(false)
        goLevels()
    }

    const cancelExit = () => {
        setShowExitConfirm(false)
    }

    return (
        <div className="relative h-screen w-screen overflow-hidden bg-[#000000]">
            <div
                ref={mountRef}
                className="h-full w-full cursor-grab"
                style={{ cursor: loading ? 'wait' : 'grab' }}
            />

            <GradientOverlays />
            <BackButton onClick={handleBackClick} />
            <LoadingOverlay visible={loading} />
            <ErrorBanner message={error} onRetry={retry} />
            <ResetRotationButton visible={!loading && !error} onReset={resetRotation} />
            <PdfViewerButton />
            <ExitConfirmationModal
                visible={showExitConfirm}
                onConfirm={confirmExit}
                onCancel={cancelExit}
            />
        </div>
    )
}