const NPM_COMMANDS = [
	"npm install",
	"npm run build",
	"npm run dev",
	"npm run serve",
	"npm test",
	"npm run test",
	"npm run lint",
	"npm run typecheck",
] as const;

const YARN_COMMANDS = [
	"yarn install",
	"yarn build",
	"yarn test",
	"yarn lint",
] as const;

const PNPM_COMMANDS = ["pnpm install", "pnpm build", "pnpm test"] as const;

const BUN_COMMANDS = [
	"bun install",
	"bun run build",
	"bun run dev",
	"bun test",
	"bun run test",
] as const;

const DENO_COMMANDS = [
	"deno install",
	"deno task build",
	"deno task test",
	"deno task fmt",
	"deno lint",
] as const;

const PYTHON_COMMANDS = [
	"python -m build",
	"pip install",
	"pytest",
	"python -m pytest",
	"ruff check",
	"python -m unittest",
] as const;

const RUST_COMMANDS = [
	"cargo build",
	"cargo test",
	"cargo run",
	"cargo clippy",
	"rustc",
] as const;

const GO_COMMANDS = ["go build", "go test", "go run", "golangci-lint"] as const;

const JAVA_COMMANDS = [
	"mvn compile",
	"mvn package",
	"mvn test",
	"ant build",
	"ant test",
	"gradle build",
	"gradle test",
	"./gradlew build",
	"./gradlew test",
] as const;

const DOTNET_COMMANDS = ["dotnet build", "dotnet test", "dotnet run"] as const;

const CMAKE_COMMANDS = ["cmake --build build"] as const;
const MAKE_COMMANDS = ["make", "make build", "make test"] as const;
const XMAKE_COMMANDS = ["xmake build", "xmake test"] as const;

const SWIFT_COMMANDS = ["swift build", "swift test"] as const;

const RUBY_COMMANDS = [
	"gem install",
	"bundle install",
	"bundle exec rspec",
] as const;

const PHP_COMMANDS = ["composer install", "phpunit"] as const;

export const SHARED_BASH_ALLOWLIST_COMMANDS = [
	...NPM_COMMANDS,
	...YARN_COMMANDS,
	...PNPM_COMMANDS,
	...BUN_COMMANDS,
	...DENO_COMMANDS,
	...PYTHON_COMMANDS,
	...RUST_COMMANDS,
	...GO_COMMANDS,
	...JAVA_COMMANDS,
	...DOTNET_COMMANDS,
	...CMAKE_COMMANDS,
	...MAKE_COMMANDS,
	...XMAKE_COMMANDS,
	...SWIFT_COMMANDS,
	...RUBY_COMMANDS,
	...PHP_COMMANDS,
] as const;

const NPM_PUBLISH = ["npm publish"] as const;
const YARN_PUBLISH = ["yarn publish"] as const;
const PNPM_PUBLISH = ["pnpm publish"] as const;
const RUST_PUBLISH = ["cargo publish"] as const;

const GIT_COMMANDS = [
	"git commit",
	"git push",
	"git merge",
	"git rebase",
	"git cherry-pick",
	"git tag",
	"git add",
] as const;

const GITHUB_COMMANDS = ["gh pr merge", "gh repo create"] as const;

const CONTAINER_COMMANDS = ["docker push"] as const;

const INFRA_COMMANDS = [
	"kubectl",
	"helm",
	"terraform apply",
	"serverless deploy",
] as const;

const UNSAFE_TEXT_COMMANDS = ["sed", "awk", "perl -pi"] as const;

export const SHARED_BASH_DENYLIST_COMMANDS = [
	...GIT_COMMANDS,
	...GITHUB_COMMANDS,
	...NPM_PUBLISH,
	...YARN_PUBLISH,
	...PNPM_PUBLISH,
	...RUST_PUBLISH,
	...CONTAINER_COMMANDS,
	...INFRA_COMMANDS,
	...UNSAFE_TEXT_COMMANDS,
] as const;
