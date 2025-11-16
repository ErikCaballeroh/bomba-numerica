export const ROUTES = {
    LOADING: '/',
    HOME: '/home',
    LEVELS: '/levels',
    GAME: '/game/:levelId',
}

export const getGameRoute = (levelId) => `/game/${levelId}`
