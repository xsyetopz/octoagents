import type { BuildTool } from "./types.ts";

export const GO_TOOLS: BuildTool[] = [
	{
		name: "go",
		languages: ["go", "golang"],
		commands: {
			build: ["go build", "go build -o {output}"],
			test: ["go test", "go test ./...", "go test -v"],
			run: ["go run", "go run {main.go}"],
			install: ["go install", "go mod tidy", "go get"],
		},
		lockFiles: ["go.sum"],
		configFiles: ["go.mod", "go.work"],
		linters: ["golangci-lint", "golangci-lint run", "golint", "staticcheck"],
		formatters: ["gofmt", "go fmt"],
	},
];
