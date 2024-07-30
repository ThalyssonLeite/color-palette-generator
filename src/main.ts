import { apcach, crToBg, apcachToCss, calcContrast } from 'apcach';
import {
	getVariables,
	updateVariables,
	serializeColor,
	foregroundChromaData,
	foregroundLightnessData,
} from './runtime';
import { converter } from 'culori';

(window as any).dark = false;

function getForeground([name, value]: [string, string], i) {
	const foregroundName = `${name}-foreground`;
	const oklchValue = `oklch(${value})`;
	const [_, valueChroma, valueHue] = value.split(' ');
	const foregroundChroma =
		Number(valueChroma) === 0 ? 0 : foregroundChromaData[i];
	const foregroundLightness = foregroundLightnessData[i];
	if (name.includes('default')) console.log(valueHue);
	return [
		foregroundName,
		`${foregroundLightness} ${foregroundChroma} ${valueHue}`,
	];
}
function renderColorShades(data: any, dark = false) {
	const variables = getVariables({ ...data, dark });
	const foregroundVariables = variables.map(getForeground);
	updateVariables([...variables, ...foregroundVariables]);
	const divs = variables.map(([name], i) => {
		const [foregroundName] = foregroundVariables[i];
		return `
		<div
			style="
				display: flex;
				justify-content: center;
				align-items: center;
				font-size: 20px;
				height: 20px;
				flex: 1;
				min-width: max-content;
				min-width: 150px;
				padding: 16px;
				outline-offset: -5px;
				background: oklch(var(${name}));
				outline: 3px dashed transparent;
				transition: .15s ease;"
				onMouseOver="(() => {
					this.style.outline='4px dashed oklch(var(${foregroundName}))';
				})()"
				onMouseOut="(() => {
					this.style.outline='3px dashed transparent';
				})()"
				onClick="window.changeDarkMode()";
		>
			<div style="
				flex-shrink: 0;
				color: oklch(var(${foregroundName}));
				font-weight: 600"
			>
				${name}
			</div>
		</div>
		`;
	});
	const colorDiv = `
		<div
			class="${data.baseName}"
			style="
				display: flex;
				align-items: center;
				flex-direction: column;
				flex-shrink: 0;
				min-width: fit-content;
				gap: 0px;
			"
		>
			<h1>${data.baseName}</h1>
			${divs.join('\n')}
		</div>
	`;
	document.body.querySelector('#app').innerHTML += colorDiv;
}
function cleanApp() {
	document.querySelector('#app')!.innerHTML = '';
}
function renderApp(colors: any) {
	colors.forEach((data: any) => renderColorShades(data, (window as any).dark));
}

async function startPlayingThemes() {
	//Padrão do Sistema
	const success = { baseName: 'success', hue: 130.85 };
	const warning = { baseName: 'warning', hue: 64.05 };
	const danger = { baseName: 'danger', hue: 28.81 };
	const info = { baseName: 'info', hue: 248.81 };
	const sleep = (ms: number = 99999999999) => {
		return new Promise((resolve) => setTimeout(() => resolve(ms), ms));
	};
	const THEME_HUES = {
		dev: { primary: 181.91, accent: 354.31 },
		// local: { primary: 292.72, accent: 130.85 },
		// ponsse: { primary: 101.52, accent: 163.23 },
		// smartfleet: { primary: 50.69, accent: 248.81 },
		// timberflorest: { primary: 80.95, accent: 248.81 },
		// 'theme-default': { primary: 154.16, accent: 248.81 },
	};
	//--menu-foreground: 0.923 0.015 232.070;
	//--menu: 38.04% 0.015 232.07;

	const themes = Object.keys(THEME_HUES);

	let count = 0;
	while (true) {
		const theme = themes[count % themes.length];
		const hues = THEME_HUES[theme as keyof typeof THEME_HUES];
		// Dinâmico
		const primary = { baseName: 'primary', hue: hues.primary };
		const accent = { baseName: 'accent', hue: hues.accent };
		const _default = { baseName: 'default', hue: 0, chroma: 0 };
		const menu = { baseName: 'menu', hue: 232.07, chroma: 0.015 };
		const colors = [
			primary,
			accent,
			_default,
			menu,
			success,
			warning,
			danger,
			info,
		];
		cleanApp();
		renderApp(colors);
		count++;
		await sleep();
	}
}

function changeDarkMode() {
	(window as any).dark = !(window as any).dark;
}

(window as any).changeDarkMode = changeDarkMode;

await startPlayingThemes();
