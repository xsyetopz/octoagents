import type { CommandDefinition } from "./types.ts";

export const COMMAND_DEFINITIONS: CommandDefinition[] = [
	{
		name: "octo-review",
		description: "Perform code review on a file or path",
		agent: "argus",
		promptTemplate: `对以下文件或路径进行全面的代码审查。检查正确性、安全漏洞、性能问题和风格问题。

目标:`,
	},
	{
		name: "octo-test",
		description: "Execute test suite, analyze results",
		agent: "orion",
		promptTemplate: `运行测试套件并分析结果。如果测试失败，找出根本原因并提出修复建议。

范围:`,
	},
	{
		name: "octo-implement",
		description: "Implement a feature from a spec",
		agent: "hephaestus",
		promptTemplate: `根据规范实现以下功能或变更。先阅读现有代码，遵循项目约定。

规范:`,
	},
	{
		name: "octo-docs",
		description: "Generate or update documentation",
		agent: "calliope",
		promptTemplate: `为以下内容生成或更新文档。

目标:`,
	},
	{
		name: "octo-deps",
		description: "Analyze dependencies of a module",
		agent: "hermes",
		promptTemplate: `分析以下模块的依赖关系。报告直接导入、消费者、循环依赖。

模块:`,
	},
	{
		name: "octo-explain",
		description: "Explain architecture or code structure",
		agent: "hermes",
		promptTemplate: `解释以下架构和代码结构。描述工作原理、关键抽象、数据流。

目标:`,
	},
	{
		name: "octo-plan-feature",
		description: "Break down a feature into tasks",
		agent: "athena",
		promptTemplate: `将以下功能分解为具体的实现任务。包含依赖关系、风险和工作量考虑。

功能:`,
	},
	{
		name: "octo-plan-refactor",
		description: "Plan a refactoring with impact analysis",
		agent: "athena",
		promptTemplate: `规划以下重构。分析影响，识别受影响文件，概述迁移路径。

重构:`,
	},
	{
		name: "octo-ship",
		description: "End-to-end: implement, test, review, document",
		agent: "odysseus",
		promptTemplate: `端到端交付以下功能：
1. 使用 @hephaestus 实现
2. 使用 @orion 运行测试
3. 使用 @argus 审查代码
4. 使用 @calliope 更新文档
5. 提醒用户手动提交（禁止自动提交）

功能:`,
	},
];
