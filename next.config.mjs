import nextPWA from 'next-pwa';
import { join } from 'path';

const isDev = process.env.NODE_ENV === 'development';

const nextConfig = {
	reactStrictMode: true,
	experimental: {
		appDir: true,
	},
};

export default nextPWA({
	dest: 'public',
	register: true,
	skipWaiting: true,
	disable: isDev,
})(nextConfig);
