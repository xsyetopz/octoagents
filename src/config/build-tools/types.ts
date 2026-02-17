export interface BuildTool {
	name: string;
	languages: string[];
	commands: {
		build: string[];
		test: string[];
		run: string[];
		install?: string[];
	};
	lockFiles: string[];
	configFiles: string[];
	linters: string[];
	formatters: string[];
}
