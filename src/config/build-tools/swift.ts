import type { BuildTool } from "./types.ts";

export const SWIFT_TOOLS: BuildTool[] = [
	{
		name: "swift",
		languages: ["swift"],
		commands: {
			build: ["swift build", "xcodebuild"],
			test: ["swift test", "xcodebuild test"],
			run: ["swift run"],
			install: ["swift package install", "spm"],
		},
		lockFiles: ["Package.resolved"],
		configFiles: ["Package.swift", "Package.resolved", "*.xcodeproj"],
		linters: ["swiftlint", "swift-format"],
		formatters: ["swift-format", "swiftformat"],
	},
];
