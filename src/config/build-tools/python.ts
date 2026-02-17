import type { BuildTool } from "./types.ts";

export const PYTHON_TOOLS: BuildTool[] = [
	{
		name: "pip",
		languages: ["python"],
		commands: {
			build: ["python -m build", "pip install -e ."],
			test: ["pytest", "python -m unittest discover"],
			run: ["python", "python3"],
			install: [
				"pip install -r requirements.txt",
				"pip install",
				"pipenv install",
				"poetry install",
			],
		},
		lockFiles: [
			"requirements.txt",
			"Pipfile.lock",
			"poetry.lock",
			"pyproject.toml",
		],
		configFiles: ["setup.py", "setup.cfg", "pyproject.toml", "Pipfile"],
		linters: ["pylint", "flake8", "mypy", "ruff", "pyright"],
		formatters: ["black", "autopep8", "yapf", "isort"],
	},
	{
		name: "conda",
		languages: ["python"],
		commands: {
			build: ["conda build"],
			test: ["pytest"],
			run: ["python", "conda run python"],
			install: ["conda install", "conda env create"],
		},
		lockFiles: ["environment.yml", "conda-lock.yml"],
		configFiles: ["environment.yml", "conda.yml"],
		linters: ["pylint", "flake8", "mypy", "ruff", "pyright"],
		formatters: ["black", "autopep8", "yapf"],
	},
];
