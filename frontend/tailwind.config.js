/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                prime: '#0F172A', // Slate 900
                accent: '#3B82F6', // Blue 500
                surface: '#F8FAFC', // Slate 50
            },
        },
    },
    plugins: [],
}
