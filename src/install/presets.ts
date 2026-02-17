type PresetInfo = {
	name: string;
	description: string;
};

export function selectPreset(
	presets: PresetInfo[],
	presetArg: string | undefined,
): string {
	if (presetArg) {
		return presetArg;
	}

	console.log("\nSelect preset:");
	presets.forEach((preset, index) => {
		console.log(
			`  ${index + 1}) ${preset.name.padEnd(10)} - ${preset.description}`,
		);
	});

	const input = prompt("Enter preset number (1-6):");
	const index = Number.parseInt(input || "1", 10) - 1;

	if (Number.isNaN(index) || index < 0 || index >= presets.length) {
		console.log("Invalid selection. Using 'stock' preset.");
		return "stock";
	}

	const selectedPreset = presets[index];
	return selectedPreset?.name || "stock";
}
