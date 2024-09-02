'use client';

import { useCallback, useEffect, useRef } from 'react';
import createGlobe, { COBEOptions } from 'cobe';
import { useSpring } from 'react-spring';

import { cn } from '@/lib/utils';

const GLOBE_CONFIG: COBEOptions = {
	width: 800,
	height: 800,
	onRender: () => {},
	devicePixelRatio: 2,
	phi: 0,
	theta: 0.1,
	dark: 0,
	diffuse: 0.4,
	mapSamples: 16000,
	mapBrightness: 1.6,
	baseColor: [1, 1, 1],
	markerColor: [251 / 255, 100 / 255, 21 / 255],
	glowColor: [1, 1, 1],
	markers: [{ location: [35.6892, 51.389], size: 0.1 }],
};

export default function Globe({
	className,
	config = GLOBE_CONFIG,
}: {
	className?: string;
	config?: COBEOptions;
}) {
	let phi = 0;
	let width = 0;
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const pointerInteracting = useRef(null);
	const pointerInteractionMovement = useRef(0);
	const [{ r }, api] = useSpring(() => ({
		r: 0,
		config: {
			mass: 1,
			tension: 280,
			friction: 40,
			precision: 0.001,
		},
	}));

	const updatePointerInteraction = (value: any) => {
		pointerInteracting.current = value;
		// canvasRef.current!.style.cursor = value ? 'grabbing' : 'grab';
	};

	const updateMovement = (clientX: any) => {
		if (pointerInteracting.current !== null) {
			const delta = clientX - pointerInteracting.current;
			pointerInteractionMovement.current = delta;
			api.start({ r: delta / 200 });
		}
	};

	const onRender = useCallback(
		(state: Record<string, any>) => {
			if (!pointerInteracting.current) phi += 0.005;
			state.phi = phi + r.get();
			state.width = width * 2;
			state.height = width * 2;
		},
		[pointerInteracting, phi, r]
	);

	const onResize = () => {
		if (canvasRef.current) {
			width = canvasRef.current.offsetWidth;
		}
	};

	useEffect(() => {
		window.addEventListener('resize', onResize);
		onResize();

		const globe = createGlobe(canvasRef.current!, {
			...config,
			width: width * 2,
			height: width * 2,
			onRender,
		});

		setTimeout(() => (canvasRef.current!.style.opacity = '1'));
		return () => globe.destroy();
	}, []);

	return (
		<div className={cn('mx-auto aspect-[1/1] w-full max-w-[650px]', className)}>
			<canvas
				className={cn(
					'h-full w-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]'
				)}
				ref={canvasRef}
				onPointerDown={(e) =>
					updatePointerInteraction(
						e.clientX - pointerInteractionMovement.current
					)
				}
				onPointerUp={() => updatePointerInteraction(null)}
				onPointerOut={() => updatePointerInteraction(null)}
				onMouseMove={(e) => updateMovement(e.clientX)}
				onTouchMove={(e) =>
					e.touches[0] && updateMovement(e.touches[0].clientX)
				}
			/>
		</div>
	);
}
