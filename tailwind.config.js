/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,tsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    boreal: "#5DFF78", // Verde Brillante
                    carbon: "#1A1A1A", // Negro Carbón
                    polar: "#A855F7",  // Violeta
                    slate: "#F8FAFC",  // Fondo claro
                }
            },
            fontFamily: {
                display: ['"Founders Grotesk"', 'sans-serif'],
                sans: ['"Open Sans"', 'sans-serif'],
            },
            backgroundImage: {
                'gradient-brand': 'linear-gradient(135deg, #5DFF78 0%, #A855F7 100%)',
            }
        },
    },
    plugins: [],
}
