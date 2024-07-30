import {
	toGamut as _toGamut,
	Color,
	Oklch,
	converter,
	differenceEuclidean,
} from 'culori';

import { shades, makeVariable } from './common.ts';

const toGamut = _toGamut as (...args: unknown[]) => (color: string) => Color;

export function getVariables({
	baseName,
	hue,
	mode = 'consistent',
	chroma = undefined,
	dark = false,
}: {
	baseName: string;
	hue: number;
	mode?: 'bright' | 'consistent';
	chroma?: number;
	dark?: boolean;
}): string[][] {
	const calculator =
		chroma !== undefined
			? fixedChroma(chroma)
			: mode === 'bright'
			? highestChroma
			: consistentChroma;
	const revertedShades = [...shades].reverse();
	const usedShades = dark ? revertedShades : shades;
	const colorShadesEntries = usedShades.map((shade, shadeIndex) => [
		makeVariable({ name: baseName, shade }),
		calculator(shadeIndex, hue),
	]);
	return dark ? colorShadesEntries.reverse() : colorShadesEntries;
}

export function updateVariables(variables: string[][], el?: HTMLElement) {
	const target = el ?? document.documentElement;
	for (const [varName, value] of variables) {
		target.style.setProperty(varName, value + '');
	}
}

const lightnessForShade = (shade: number) => {
	const highestL = 89;
	const lowestL = 13;
	const diffL = highestL - lowestL;

	const shadeDiff = shades[shades.length - 1] - shades[0];

	// Maintaining the proximity of colors with a step of 50 and 100
	const multiplier = shade / shadeDiff;

	return (lowestL + (highestL - diffL * multiplier)) / 100;
};
const lightness = shades.map(lightnessForShade);

export const highestChroma = (shadeIndex: number, hue: number) => {
	const oklch = converter('oklch');

	// Setting an obsurdly high chroma
	const color = `oklch(${lightness[shadeIndex]} 0.18 ${hue})`;

	// Clamping it to the highest chroma possible
	return serializeColor(
		oklch(toGamut('p3', 'oklch', differenceEuclidean('oklch'), 0)(color))
	);
};

export const consistentChroma = (i: number, hue: number) => {
	const oklch = converter('oklch');

	// Using a pinned chroma
	const color = `oklch(${lightness[i]} ${chromaData[i]} ${hue})`;

	return serializeColor(
		oklch(toGamut('p3', 'oklch', differenceEuclidean('oklch'), 0)(color))
	);
};

export const fixedChroma = (chroma: number) => {
	return (i: number, hue: number) => {
		const oklch = converter('oklch');

		// Using a pinned chroma
		const color = `oklch(${lightness[i]} ${chroma} ${hue})`;

		return serializeColor(
			oklch(toGamut('p3', 'oklch', differenceEuclidean('oklch'), 0)(color))
		);
	};
};

const chromaData: Record<number, number> = {
	0: 0.0114,
	1: 0.0331,
	2: 0.0774,
	3: 0.1275,
	4: 0.1547,
	5: 0.1355,
	6: 0.1164,
	7: 0.0974,
	8: 0.0782,
	9: 0.0588,
	10: 0.0491,
};

export const foregroundLightnessData: Record<number, number> = {
	0: 0.25,
	1: 0.2,
	2: 0.15,
	3: 1,
	4: 1,
	5: 1,
	6: 1,
	7: 1,
	8: 1,
	9: 1,
	10: 1,
};

export const foregroundChromaData: Record<number, number> = {
	0: 0.18,
	1: 0.18,
	2: 0.18,
	3: 0.02,
	4: 0.08,
	5: 0.08,
	6: 0.08,
	7: 0.08,
	8: 0.08,
	9: 0.08,
	10: 0.08,
};

export const serializeColor = (c: Oklch): string =>
	`${c.l.toFixed(3)} ${c.c.toFixed(3)} ${c.h?.toFixed(3)}`;
