export const Button = ({ children, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={
                `
                    inline-flex items-center justify-center px-5 py-5 rounded-lg text-2xl font-medium text-white
                    bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:opacity-50
                    focus:outline-none focus:ring-2 focus:ring-amber-300 transition-transform
                    cursor-pointer
                 `
            }
        >
            {children}
        </button>
    )
}
