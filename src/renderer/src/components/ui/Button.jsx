export const Button = ({ children, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className="w-full py-4 px-6 bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold text-xl rounded-lg transition-all transform hover:scale-105 shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-orange-300 cursor-pointer"
        >
            {children}
        </button>
    )
}
