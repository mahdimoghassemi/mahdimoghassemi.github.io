import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import CustomCursor from '@/components/custom-cursor/custom-cursor';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
	title: 'Mahdi Moghassemi',
	description: 'Mahdi Moghassemi portfolio',
	manifest: '/manifest.json',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<body className={inter.className}>
				<CustomCursor />
				{children}
			</body>
		</html>
	);
}
