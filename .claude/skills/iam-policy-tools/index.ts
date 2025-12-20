import { resolve } from "path";
import { callTool, close } from "./mcp-client.js";

interface PolicyResponse {
	content: Array<{
		type: string;
		text?: string;
	}>;
}

interface AnalysisResult {
	action: string;
	summary: string;
	policyPreview?: string;
}

async function generatePolicies(
	sourcePaths: string[],
): Promise<AnalysisResult> {
	try {
		console.error(`Analyzing source files: ${sourcePaths.join(", ")}`);

		const absolutePaths = sourcePaths.map((path) => resolve(path));

		const result = (await callTool("generate_application_policies", {
			SourceFiles: absolutePaths,
		})) as PolicyResponse;

		let policyText = "";
		for (const content of result.content) {
			if (content.type === "text" && content.text) {
				policyText += content.text;
			}
		}

		return {
			action: "generate_policies",
			summary: `Generated IAM policies for ${sourcePaths.length} file(s)`,
			policyPreview: policyText.slice(0, 500),
		};
	} finally {
		await close();
	}
}

async function fixAccessDenied(
	errorMessage: string,
	context?: string,
): Promise<AnalysisResult> {
	try {
		console.error("Analyzing AccessDenied error...");

		const result = (await callTool("generate_policy_for_access_denied", {
			error_message: errorMessage,
			context: context || "AWS CLI or SDK operation",
		})) as PolicyResponse;

		let policyText = "";
		for (const content of result.content) {
			if (content.type === "text" && content.text) {
				policyText += content.text;
			}
		}

		return {
			action: "fix_access_denied",
			summary: "Generated policy to fix AccessDenied error",
			policyPreview: policyText.slice(0, 500),
		};
	} finally {
		await close();
	}
}

const args = process.argv.slice(2);
const command = args[0];

if (!command) {
	console.error("Usage:");
	console.error("  tsx index.ts generate <file1> [file2] ...");
	console.error('  tsx index.ts fix-denied "<error_message>" [context]');
	console.error("");
	console.error("Examples:");
	console.error("  tsx index.ts generate ./lambda/handler.py");
	console.error(
		'  tsx index.ts fix-denied "AccessDenied: s3:GetObject" "Lambda function"',
	);
	process.exit(1);
}

if (command === "generate") {
	const sourcePaths = args.slice(1);
	if (sourcePaths.length === 0) {
		console.error("Error: Please provide at least one source file path");
		process.exit(1);
	}

	generatePolicies(sourcePaths)
		.then((result) => {
			console.log(JSON.stringify(result, null, 2));
		})
		.catch((error) => {
			console.error("Error:", error instanceof Error ? error.message : error);
			process.exit(1);
		});
} else if (command === "fix-denied") {
	const errorMessage = args[1];
	const context = args[2];

	if (!errorMessage) {
		console.error("Error: Please provide an error message");
		process.exit(1);
	}

	fixAccessDenied(errorMessage, context)
		.then((result) => {
			console.log(JSON.stringify(result, null, 2));
		})
		.catch((error) => {
			console.error("Error:", error instanceof Error ? error.message : error);
			process.exit(1);
		});
} else {
	console.error(`Unknown command: ${command}`);
	console.error("Available commands: generate, fix-denied");
	process.exit(1);
}
