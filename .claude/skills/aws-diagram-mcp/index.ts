import { callTool, close } from "./mcp-client.js";

interface DiagramResponse {
	content?: Array<{
		type: string;
		text?: string;
	}>;
}

interface GenerateResult {
	success: boolean;
	outputPath?: string;
	message: string;
}

interface ListIconsResult {
	category: string;
	icons: string[];
}

async function generateDiagram(
	code: string,
	outputDir: string,
): Promise<GenerateResult> {
	try {
		console.error(`Generating diagram to: ${outputDir}`);

		const result = (await callTool("generate_diagram", {
			code,
			output_path: outputDir,
		})) as DiagramResponse;

		const textContent = result.content?.find((c) => c.type === "text");
		const message = textContent?.text || "Diagram generated";

		return {
			success: true,
			outputPath: outputDir,
			message,
		};
	} finally {
		await close();
	}
}

async function listIcons(category?: string): Promise<ListIconsResult> {
	try {
		console.error(
			`Listing icons${category ? ` for category: ${category}` : ""}`,
		);

		const result = (await callTool("list_icons", {
			...(category && { category }),
		})) as DiagramResponse;

		const textContent = result.content?.find((c) => c.type === "text");
		const icons = textContent?.text?.split("\n").filter(Boolean) || [];

		return {
			category: category || "all",
			icons,
		};
	} finally {
		await close();
	}
}

async function getExamples(): Promise<{ examples: string }> {
	try {
		console.error("Getting diagram examples");

		const result = (await callTool(
			"get_diagram_examples",
			{},
		)) as DiagramResponse;

		const textContent = result.content?.find((c) => c.type === "text");

		return {
			examples: textContent?.text || "No examples available",
		};
	} finally {
		await close();
	}
}

const args = process.argv.slice(2);
if (args.length === 0) {
	console.error("Usage:");
	console.error('  tsx index.ts generate "<python_code>" <output_dir>');
	console.error("  tsx index.ts list-icons [category]");
	console.error("  tsx index.ts examples");
	process.exit(1);
}

const command = args[0];

switch (command) {
	case "generate": {
		if (args.length < 3) {
			console.error("Usage: tsx index.ts generate <python_code> <output_dir>");
			process.exit(1);
		}
		const code = args[1];
		const outputDir = args[2];
		generateDiagram(code, outputDir)
			.then((result) => {
				console.log(JSON.stringify(result, null, 2));
			})
			.catch((error) => {
				console.error("Error:", error instanceof Error ? error.message : error);
				process.exit(1);
			});
		break;
	}
	case "list-icons": {
		const category = args[1];
		listIcons(category)
			.then((result) => {
				console.log(JSON.stringify(result, null, 2));
			})
			.catch((error) => {
				console.error("Error:", error instanceof Error ? error.message : error);
				process.exit(1);
			});
		break;
	}
	case "examples": {
		getExamples()
			.then((result) => {
				console.log(JSON.stringify(result, null, 2));
			})
			.catch((error) => {
				console.error("Error:", error instanceof Error ? error.message : error);
				process.exit(1);
			});
		break;
	}
	default:
		console.error(`Unknown command: ${command}`);
		console.error("Available commands: generate, list-icons, examples");
		process.exit(1);
}
