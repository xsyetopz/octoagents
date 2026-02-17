import type { BuildTool } from "./types.ts";

export const RUST_TOOLS: BuildTool[] = [
	{
		name: "cargo",
		languages: ["rust"],
		commands: {
			build: ["cargo build", "cargo build --release"],
			test: ["cargo test", "cargo test --release"],
			run: ["cargo run", "cargo run --release"],
			install: ["cargo install", "cargo add"],
		},
		lockFiles: ["Cargo.lock"],
		configFiles: ["Cargo.toml", "rust-toolchain.toml"],
		linters: ["clippy", "cargo clippy"],
		formatters: ["rustfmt", "cargo fmt"],
	},
];
