export const shades = [
	50,
	...Array.from({ length: 9 }).map((_, i) => (i + 1) * 100),
	950,
];

type MakeVariableProps = {
	fallbackValue?: string;
	name: string;
	shade: number;
	withVar?: boolean;
};

export const makeVariable = ({
	name,
	shade,
	fallbackValue,
	withVar = false,
}: MakeVariableProps) => {
	const variable = `--${name}-${shade}`;
	const value = fallbackValue ? variable + ', ' + fallbackValue : variable;
	return withVar ? `var(${value})` : variable;
};
