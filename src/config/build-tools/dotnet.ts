import type { BuildTool } from "./types.ts";

export const DOTNET_TOOLS: BuildTool[] = [
	{
		name: "dotnet",
		languages: ["csharp", "fsharp", "vb"],
		commands: {
			build: ["dotnet build", "MSBuild"],
			test: ["dotnet test", "vstest.console.exe"],
			run: ["dotnet run"],
			install: ["dotnet restore", "dotnet add package"],
		},
		lockFiles: ["packages.lock.json", "*.csproj"],
		configFiles: [
			"*.csproj",
			"*.fsproj",
			"*.vbproj",
			"*.sln",
			"Directory.Build.props",
		],
		linters: ["dotnet format", "StyleCop", "Roslyn analyzers"],
		formatters: ["dotnet format"],
	},
	{
		name: "msbuild",
		languages: ["csharp", "fsharp", "vb", "cpp"],
		commands: {
			build: ["MSBuild", "MSBuild /p:Configuration=Release"],
			test: ["vstest.console.exe", "MSTest"],
			run: [],
			install: ["MSBuild /t:Install"],
		},
		lockFiles: [],
		configFiles: ["*.sln", "*.csproj", "*.fsproj", "*.vcxproj", "*.vbproj"],
		linters: ["StyleCop", "Roslyn analyzers", "FXCop"],
		formatters: [],
	},
];
