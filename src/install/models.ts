export function getResolvedModel(
	primaryProvider: string,
	primaryModel: string,
	fallbackProvider: string,
	fallbackModel: string,
	availableModels: string[],
): string {
	const fullPrimary = `${primaryProvider}/${primaryModel}`;
	if (availableModels.includes(fullPrimary)) {
		return fullPrimary;
	}

	const fullFallback = `${fallbackProvider}/${fallbackModel}`;
	if (availableModels.includes(fullFallback)) {
		return fullFallback;
	}

	console.warn(`Neither ${fullPrimary} nor ${fullFallback} available`);
	return fullFallback;
}
