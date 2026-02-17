import type { BuildTool } from "./types.ts";

export const C_CPP_TOOLS: BuildTool[] = [
	{
		name: "cmake",
		languages: ["c", "cpp"],
		commands: {
			build: ["cmake --build build", "cmake -B build"],
			test: ["ctest", "cmake --build build --target test"],
			run: ["./build/{executable}"],
			install: ["cmake --install build"],
		},
		lockFiles: [],
		configFiles: ["CMakeLists.txt", "CMakelists.txt"],
		linters: ["cppcheck", "clang-tidy", "cpplint"],
		formatters: ["clang-format"],
	},
	{
		name: "make",
		languages: ["c", "cpp", "fortran"],
		commands: {
			build: ["make", "make all"],
			test: ["make test", "make check"],
			run: ["make run", "./{executable}"],
			install: ["make install"],
		},
		lockFiles: [],
		configFiles: ["Makefile", "makefile", "GNUMakefile"],
		linters: ["cppcheck", "clang-tidy", "cpplint", "gfortran -Wall"],
		formatters: ["clang-format", "astyle", "clang-format"],
	},
	{
		name: "xmake",
		languages: ["c", "cpp"],
		commands: {
			build: ["xmake build"],
			test: ["xmake test"],
			run: ["xmake run"],
			install: ["xmake install"],
		},
		lockFiles: [],
		configFiles: ["xmake.lua"],
		linters: ["cppcheck", "clang-tidy", "cpplint"],
		formatters: ["clang-format", "astyle"],
	},
	{
		name: "ninja",
		languages: ["c", "cpp", "fortran"],
		commands: {
			build: ["ninja"],
			test: ["ninja test"],
			run: ["./{executable}"],
			install: ["ninja install"],
		},
		lockFiles: [],
		configFiles: ["build.ninja"],
		linters: ["cppcheck", "clang-tidy", "cpplint"],
		formatters: ["clang-format"],
	},
];
