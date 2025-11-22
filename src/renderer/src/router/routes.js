export const ROUTES = {
    LOADING: '/',
    HOME: '/home',
    LEVELS: '/levels',
    GAME: '/game/:levelId',
    CREDITS: '/credits',
}

export const getGameRoute = (levelId) => `/game/${levelId}`
