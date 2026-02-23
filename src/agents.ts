import type { AgentRole } from "./models.ts";
import type { AgentMode, AgentPermission } from "./types.ts";

export interface AgentMeta {
	mode: AgentMode;
	permission: AgentPermission;
}

const FULL_ACCESS_BASH: AgentPermission["bash"] = {
	"*": "allow",
	// Safety denials
	"rm -rf /": "deny",
	"rm -rf ~": "deny",
	// VCS
	"git*": "allow",
	// JS/TS runtimes & package managers
	"node*": "allow",
	"bun*": "allow",
	"deno*": "allow",
	"tsx*": "allow",
	"ts-node*": "allow",
	"npm*": "allow",
	"pnpm*": "allow",
	"yarn*": "allow",
	"npx*": "allow",
	"bunx*": "allow",
	// Python
	"python*": "allow",
	"python3*": "allow",
	"pip*": "allow",
	"pip3*": "allow",
	"uv*": "allow",
	"poetry*": "allow",
	"pdm*": "allow",
	"pipenv*": "allow",
	"rye*": "allow",
	"hatch*": "allow",
	// Rust
	"cargo*": "allow",
	"rustup*": "allow",
	"rustc*": "allow",
	// Go
	"go *": "allow",
	"go build*": "allow",
	"go run*": "allow",
	"go get*": "allow",
	"go test*": "allow",
	// C/C++ compilers & build tools
	"gcc*": "allow",
	"g++*": "allow",
	"clang*": "allow",
	"clang++*": "allow",
	"cc*": "allow",
	"c++*": "allow",
	"make*": "allow",
	"cmake*": "allow",
	"ninja*": "allow",
	"xmake*": "allow",
	"meson*": "allow",
	"bazel*": "allow",
	"bazelisk*": "allow",
	"scons*": "allow",
	"autoconf*": "allow",
	"automake*": "allow",
	"./configure*": "allow",
	// Java / JVM
	"java*": "allow",
	"javac*": "allow",
	"jar*": "allow",
	"gradle*": "allow",
	"gradlew*": "allow",
	"mvn*": "allow",
	"mvnw*": "allow",
	"ant*": "allow",
	// Kotlin
	"kotlin*": "allow",
	"kotlinc*": "allow",
	// Scala
	"scala*": "allow",
	"scalac*": "allow",
	"sbt*": "allow",
	// .NET / C#
	"dotnet*": "allow",
	"msbuild*": "allow",
	"nuget*": "allow",
	// Ruby
	"ruby*": "allow",
	"gem*": "allow",
	"bundle*": "allow",
	"bundler*": "allow",
	"rake*": "allow",
	"rails*": "allow",
	// PHP
	"php*": "allow",
	"composer*": "allow",
	// Swift
	"swift*": "allow",
	"swiftc*": "allow",
	"xcodebuild*": "allow",
	// Zig
	"zig*": "allow",
	// Lua
	"lua*": "allow",
	"luarocks*": "allow",
	// Elixir / Erlang / BEAM
	"elixir*": "allow",
	"elixirc*": "allow",
	"mix*": "allow",
	"iex*": "allow",
	"erl*": "allow",
	"erlc*": "allow",
	"rebar3*": "allow",
	// Haskell
	"ghc*": "allow",
	"runghc*": "allow",
	"cabal*": "allow",
	"stack*": "allow",
	// Clojure
	"clj*": "allow",
	"clojure*": "allow",
	"lein*": "allow",
	"boot*": "allow",
	// OCaml
	"ocaml*": "allow",
	"ocamlfind*": "allow",
	"opam*": "allow",
	"dune*": "allow",
	// F#
	"fsharp*": "allow",
	"dotnet fsi*": "allow",
	// Nix
	"nix*": "allow",
	"nix-env*": "allow",
	"nix-shell*": "allow",
	// R
	"Rscript*": "allow",
	// Julia
	"julia*": "allow",
	// D language
	"dmd*": "allow",
	"dub*": "allow",
	// Crystal
	"crystal*": "allow",
	"shards*": "allow",
	// Nim
	"nim*": "allow",
	"nimble*": "allow",
	// V language
	"v *": "allow",
	// Shell
	"bash*": "allow",
	"sh*": "allow",
	"zsh*": "allow",
	"fish*": "allow",
	// Standard Unix tools
	"echo*": "allow",
	"printf*": "allow",
	"cat*": "allow",
	"ls*": "allow",
	"cp*": "allow",
	"mv*": "allow",
	"mkdir*": "allow",
	"touch*": "allow",
	"chmod*": "allow",
	"chown*": "allow",
	"ln*": "allow",
	"find*": "allow",
	"grep*": "allow",
	"sed*": "allow",
	"awk*": "allow",
	"sort*": "allow",
	"uniq*": "allow",
	"head*": "allow",
	"tail*": "allow",
	"wc*": "allow",
	"tr*": "allow",
	"cut*": "allow",
	"tee*": "allow",
	"xargs*": "allow",
	"which*": "allow",
	"type*": "allow",
	"env*": "allow",
	"export*": "allow",
	"source*": "allow",
	". *": "allow",
	// JSON / YAML tools
	"jq*": "allow",
	"yq*": "allow",
	// HTTP
	"curl*": "allow",
	"wget*": "allow",
	// Archives
	"tar*": "allow",
	"zip*": "allow",
	"unzip*": "allow",
	"gzip*": "allow",
	"gunzip*": "allow",
	"bzip2*": "allow",
	"xz*": "allow",
	// Containers / orchestration
	"docker*": "allow",
	"podman*": "allow",
	"docker-compose*": "allow",
	"kubectl*": "allow",
	"helm*": "allow",
	// GitHub CLI
	"gh*": "allow",
};

const TEST_RUNNER_BASH: AgentPermission["bash"] = {
	// Node.js / Bun / Deno
	"npm test*": "allow",
	"npm run test*": "allow",
	"pnpm test*": "allow",
	"pnpm run test*": "allow",
	"yarn test*": "allow",
	"bun test*": "allow",
	"bun run test*": "allow",
	"npx jest*": "allow",
	"npx vitest*": "allow",
	"npx mocha*": "allow",
	"npx ava*": "allow",
	"npx tap*": "allow",
	"npx tape*": "allow",
	"npx cypress*": "allow",
	"npx playwright*": "allow",
	"npx jasmine*": "allow",
	"bunx jest*": "allow",
	"bunx vitest*": "allow",
	"bunx mocha*": "allow",
	"bunx ava*": "allow",
	"bunx tap*": "allow",
	"bunx tape*": "allow",
	"bunx cypress*": "allow",
	"bunx playwright*": "allow",
	"bunx jasmine*": "allow",
	"deno test*": "allow",
	// Python
	"pytest*": "allow",
	"python -m pytest*": "allow",
	"python3 -m pytest*": "allow",
	"python -m unittest*": "allow",
	"python3 -m unittest*": "allow",
	"uv run pytest*": "allow",
	"poetry run pytest*": "allow",
	"tox*": "allow",
	// Rust
	"cargo test*": "allow",
	"cargo nextest*": "allow",
	// Go
	"go test*": "allow",
	// C/C++ (ctest, make test targets)
	"ctest*": "allow",
	"make test*": "allow",
	"make check*": "allow",
	"ninja test*": "allow",
	"cmake --build*": "allow",
	"xmake* test*": "allow",
	// Java / JVM
	"gradle test*": "allow",
	"gradlew test*": "allow",
	"./gradlew test*": "allow",
	"mvn test*": "allow",
	"mvnw test*": "allow",
	"./mvnw test*": "allow",
	"mvn verify*": "allow",
	"ant test*": "allow",
	// Kotlin / Scala
	"sbt test*": "allow",
	// .NET
	"dotnet test*": "allow",
	// Ruby
	"bundle exec rspec*": "allow",
	"bundle exec minitest*": "allow",
	"rake test*": "allow",
	"rails test*": "allow",
	"ruby -Itest*": "allow",
	// Swift
	"swift test*": "allow",
	"xcodebuild test*": "allow",
	// Zig
	"zig test*": "allow",
	"zig build test*": "allow",
	// Elixir
	"mix test*": "allow",
	// Haskell
	"cabal test*": "allow",
	"stack test*": "allow",
	// OCaml
	"dune test*": "allow",
	"dune runtest*": "allow",
	// Julia
	"julia --project -e 'using Pkg; Pkg.test()'": "allow",
	// D
	"dub test*": "allow",
	// Crystal
	"crystal spec*": "allow",
	// Nim
	"nimble test*": "allow",
	// Default: deny
	"*": "deny",
};

const FULL_ACCESS_PERMISSION: AgentPermission = {
	read: "allow",
	edit: "allow",
	bash: FULL_ACCESS_BASH,
	task: "allow",
	skill: "allow",
	lsp: "allow",
	webfetch: "allow",
	websearch: "allow",
	codesearch: "allow",
	todoread: "allow",
	todowrite: "allow",
};

const READ_PLAN_PERMISSION: AgentPermission = {
	read: "allow",
	grep: "allow",
	glob: "allow",
	list: "allow",
	edit: "ask",
	bash: "ask",
	task: "allow",
	skill: "allow",
	lsp: "allow",
	webfetch: "allow",
	websearch: "allow",
	codesearch: "allow",
	todoread: "allow",
	todowrite: "allow",
};

const READ_ONLY_PERMISSION: AgentPermission = {
	read: "allow",
	grep: "allow",
	glob: "allow",
	list: "allow",
	lsp: "allow",
	edit: "deny",
	bash: "deny",
};

const DOCS_SCOPED_PERMISSION: AgentPermission = {
	read: "allow",
	grep: "allow",
	glob: "allow",
	list: "allow",
	lsp: "allow",
	edit: {
		"docs/**": "allow",
		"*.md": "allow",
		"*": "ask",
	},
	bash: "deny",
};

const TEST_RUNNER_PERMISSION: AgentPermission = {
	read: "allow",
	grep: "allow",
	glob: "allow",
	list: "allow",
	lsp: "allow",
	edit: "deny",
	bash: TEST_RUNNER_BASH,
};

const HOUSEKEEPING_PERMISSION: AgentPermission = {
	read: "allow",
	edit: "deny",
	bash: "deny",
	task: "deny",
};

export const AGENT_META: Record<AgentRole, AgentMeta> = {
	build: { mode: "primary", permission: FULL_ACCESS_PERMISSION },
	plan: { mode: "primary", permission: READ_PLAN_PERMISSION },
	general: { mode: "subagent", permission: FULL_ACCESS_PERMISSION },
	explore: { mode: "subagent", permission: READ_ONLY_PERMISSION },
	compaction: { mode: "subagent", permission: HOUSEKEEPING_PERMISSION },
	summary: { mode: "subagent", permission: HOUSEKEEPING_PERMISSION },
	title: { mode: "subagent", permission: HOUSEKEEPING_PERMISSION },
	review: { mode: "subagent", permission: READ_ONLY_PERMISSION },
	implement: { mode: "subagent", permission: FULL_ACCESS_PERMISSION },
	document: { mode: "subagent", permission: DOCS_SCOPED_PERMISSION },
	test: { mode: "subagent", permission: TEST_RUNNER_PERMISSION },
};

export const BUILT_IN_OVERRIDE_ROLES: AgentRole[] = [
	"build",
	"plan",
	"general",
	"explore",
	"compaction",
	"summary",
	"title",
];

export const CUSTOM_SUBAGENT_ROLES: AgentRole[] = [
	"review",
	"implement",
	"document",
	"test",
];

export const ALL_AGENT_ROLES: AgentRole[] = [
	...BUILT_IN_OVERRIDE_ROLES,
	...CUSTOM_SUBAGENT_ROLES,
];
