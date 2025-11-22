import { useNavigate } from 'react-router-dom'
import { ROUTES, getGameRoute } from '../router/routes'

export const useNavigation = () => {
  const navigate = useNavigate()

  return {
    goHome: () => navigate(ROUTES.HOME),
    goMainMenu: () => navigate(ROUTES.HOME),
    goLevels: () => navigate(ROUTES.LEVELS),
    goLoading: () => navigate(ROUTES.LOADING),
    goGame: (levelId) => navigate(getGameRoute(levelId)),
    goCredits: () => navigate(ROUTES.CREDITS),
    navigate,
  }
}
