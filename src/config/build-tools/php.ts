import type { BuildTool } from "./types.ts";

export const PHP_TOOLS: BuildTool[] = [
	{
		name: "composer",
		languages: ["php"],
		commands: {
			build: ["composer build"],
			test: ["phpunit", "vendor/bin/phpunit", "pest"],
			run: ["php", "artisan", "symfony"],
			install: ["composer install", "composer require"],
		},
		lockFiles: ["composer.lock"],
		configFiles: ["composer.json"],
		linters: ["phpcs", "phpstan", "php-cs-fixer"],
		formatters: ["php-cs-fixer fix", "phpcbf"],
	},
];
