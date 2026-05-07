import type { Config } from 'tailwindcss';
export default { content: ['./app/**/*.{ts,tsx}','./components/**/*.{ts,tsx}'], theme: { extend: { colors: { background:'#090909', panel:'#121212', line:'#262626' } } }, plugins: [] } satisfies Config;
