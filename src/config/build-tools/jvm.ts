import type { BuildTool } from "./types.ts";

export const JVM_TOOLS: BuildTool[] = [
	{
		name: "maven",
		languages: ["java", "kotlin", "scala"],
		commands: {
			build: ["mvn compile", "mvn package"],
			test: ["mvn test"],
			run: ["mvn exec:java", "java -jar target/*.jar"],
			install: ["mvn install"],
		},
		lockFiles: [],
		configFiles: ["pom.xml"],
		linters: ["checkstyle", "spotbugs", "pmd"],
		formatters: ["google-java-format", "spotless:apply"],
	},
	{
		name: "ant",
		languages: ["java", "kotlin", "scala", "groovy"],
		commands: {
			build: ["ant", "ant build", "ant compile"],
			test: ["ant test", "ant junit"],
			run: ["ant run", "java -jar target/*.jar"],
			install: ["ant install"],
		},
		lockFiles: [],
		configFiles: ["build.xml"],
		linters: ["checkstyle", "pmd"],
		formatters: [],
	},
	{
		name: "gradle",
		languages: ["java", "kotlin", "scala", "groovy"],
		commands: {
			build: ["gradle build", "./gradlew build"],
			test: ["gradle test", "./gradlew test"],
			run: ["gradle run", "gradle bootRun", "./gradlew run"],
			install: ["gradle install", "gradle assemble", "./gradlew install"],
		},
		lockFiles: ["gradle.lockfile"],
		configFiles: [
			"build.gradle",
			"build.gradle.kts",
			"settings.gradle",
			"settings.gradle.kts",
		],
		linters: ["checkstyle", "spotbugs", "spotlessCheck"],
		formatters: ["spotless:apply", "googleJavaFormat"],
	},
	{
		name: "gradle",
		languages: ["kotlin"],
		commands: {
			build: ["gradle compileKotlin", "./gradlew compileKotlin"],
			test: ["gradle test", "./gradlew test"],
			run: ["gradle run", "./gradlew run"],
			install: ["gradle assemble", "./gradlew assemble"],
		},
		lockFiles: ["gradle.lockfile"],
		configFiles: ["build.gradle.kts", "settings.gradle.kts"],
		linters: ["ktlint", "detekt"],
		formatters: ["ktlint", "spotless:apply"],
	},
	{
		name: "sbt",
		languages: ["scala"],
		commands: {
			build: ["sbt compile", "sbt assembly"],
			test: ["sbt test"],
			run: ["sbt run"],
			install: ["sbt update"],
		},
		lockFiles: ["build.sbt.lock"],
		configFiles: ["build.sbt", "project/*.scala"],
		linters: ["scalac -Xlint", "scalastyle"],
		formatters: ["scalafmt"],
	},
];
