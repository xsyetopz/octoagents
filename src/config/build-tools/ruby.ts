import type { BuildTool } from "./types.ts";

export const RUBY_TOOLS: BuildTool[] = [
	{
		name: "bundler",
		languages: ["ruby"],
		commands: {
			build: ["bundle exec rake build", "gem build"],
			test: ["rspec", "bundle exec rspec", "ruby -I test"],
			run: ["ruby", "bundle exec ruby"],
			install: ["bundle install", "bundle add"],
		},
		lockFiles: ["Gemfile.lock"],
		configFiles: ["Gemfile", "Rakefile", "*.gemspec"],
		linters: ["rubocop", "reek", "brakeman"],
		formatters: ["rubocop -a"],
	},
	{
		name: "gem",
		languages: ["ruby"],
		commands: {
			build: ["gem build", "rake build"],
			test: ["rake test", "ruby -I test"],
			run: ["ruby"],
			install: ["gem install"],
		},
		lockFiles: [],
		configFiles: ["*.gemspec", "Rakefile"],
		linters: ["rubocop", "reek"],
		formatters: ["rubocop -a"],
	},
];
