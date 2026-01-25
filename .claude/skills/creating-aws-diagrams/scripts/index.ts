import { callTool, close, listTools } from "./mcp-client.js";

interface McpResponse {
	content?: Array<{
		type: string;
		text?: string;
	}>;
}

interface IconsResult {
	provider?: string;
	service?: string;
	icons: Record<string, unknown>;
}

interface ExamplesResult {
	type: string;
	examples: Record<string, unknown>;
}

interface GenerateResult {
	success: boolean;
	path?: string;
	error?: string;
}

function extractTextContent(response: McpResponse): string {
	const textContent = response.content?.find((c) => c.type === "text")?.text;
	return textContent || JSON.stringify(response);
}

async function listIcons(
	provider?: string,
	service?: string,
): Promise<IconsResult> {
	console.error(
		`Listing icons${provider ? ` for provider: ${provider}` : ""}${service ? `, service: ${service}` : ""}`,
	);

	const args: Record<string, unknown> = {};
	if (provider) args.provider_filter = provider;
	if (service) args.service_filter = service;

	const result = (await callTool("list_icons", args)) as McpResponse;
	const content = extractTextContent(result);

	try {
		const parsed = JSON.parse(content);
		return {
			provider,
			service,
			icons: parsed,
		};
	} catch {
		return {
			provider,
			service,
			icons: { raw: content },
		};
	}
}

async function getExamples(diagramType = "all"): Promise<ExamplesResult> {
	console.error(`Getting diagram examples for type: ${diagramType}`);

	const result = (await callTool("get_diagram_examples", {
		diagram_type: diagramType,
	})) as McpResponse;
	const content = extractTextContent(result);

	try {
		const parsed = JSON.parse(content);
		return {
			type: diagramType,
			examples: parsed,
		};
	} catch {
		return {
			type: diagramType,
			examples: { raw: content },
		};
	}
}

async function readStdin(): Promise<string> {
	const chunks: Buffer[] = [];
	for await (const chunk of process.stdin) {
		chunks.push(chunk);
	}
	return Buffer.concat(chunks).toString("utf-8");
}

async function generateDiagram(
	code: string,
	filename?: string,
	workspaceDir?: string,
): Promise<GenerateResult> {
	console.error(`Generating diagram${filename ? `: ${filename}` : ""}`);

	const args: Record<string, unknown> = { code };
	if (filename) args.filename = filename;
	if (workspaceDir) args.workspace_dir = workspaceDir;

	try {
		const result = (await callTool("generate_diagram", args)) as McpResponse;
		const content = extractTextContent(result);

		try {
			const parsed = JSON.parse(content);
			return {
				success: true,
				path: parsed.path || parsed.output_path || content,
			};
		} catch {
			// If not JSON, treat as path or success message
			return {
				success: true,
				path: content,
			};
		}
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

async function showTools(): Promise<void> {
	console.error("Fetching available tools from Diagram MCP Server...");
	const tools = await listTools();
	console.log(JSON.stringify({ availableTools: tools }, null, 2));
}

function printUsage(): void {
	console.error("Usage:");
	console.error("  tsx scripts/index.ts icons [provider] [service]");
	console.error("  tsx scripts/index.ts examples [type]");
	console.error(
		"  tsx scripts/index.ts generate [filename] [workspace_dir] < code.py",
	);
	console.error("  tsx scripts/index.ts tools");
	console.error("");
	console.error("Commands:");
	console.error("  icons     - List available diagram icons");
	console.error("              provider: aws, gcp, k8s, onprem, etc.");
	console.error("              service: compute, database, network, etc.");
	console.error("  examples  - Get example diagram code");
	console.error(
		"              type: aws, sequence, flow, class, k8s, onprem, custom, all",
	);
	console.error("  generate  - Generate a diagram from Python code (stdin)");
	console.error("              filename: output filename (without extension)");
	console.error("              workspace_dir: directory for output");
	console.error("  tools     - List available MCP tools");
	console.error("");
	console.error("Examples:");
	console.error("  tsx scripts/index.ts icons aws compute");
	console.error("  tsx scripts/index.ts examples aws");
	console.error(
		"  cat diagram.py | tsx scripts/index.ts generate arch /path/to/project",
	);
	console.error("");
	console.error("  # Or with heredoc:");
	console.error(
		"  tsx scripts/index.ts generate arch /path/to/project << 'EOF'",
	);
	console.error('  with Diagram("Test", show=False):');
	console.error('      S3("bucket") >> Lambda("fn")');
	console.error("  EOF");
}

async function main(): Promise<void> {
	const args = process.argv.slice(2);

	if (args.length === 0) {
		printUsage();
		process.exit(1);
	}

	const command = args[0];

	try {
		switch (command) {
			case "icons": {
				const provider = args[1];
				const service = args[2];
				const result = await listIcons(provider, service);
				console.log(JSON.stringify(result, null, 2));
				break;
			}
			case "examples": {
				const diagramType = args[1] || "all";
				const result = await getExamples(diagramType);
				console.log(JSON.stringify(result, null, 2));
				break;
			}
			case "generate": {
				const filename = args[1];
				const workspaceDir = args[2];

				// Read code from stdin
				const code = await readStdin();
				if (!code.trim()) {
					console.error("Error: No code provided via stdin");
					console.error(
						"Usage: cat diagram.py | tsx scripts/index.ts generate [filename] [workspace_dir]",
					);
					process.exit(1);
				}

				const result = await generateDiagram(code, filename, workspaceDir);
				console.log(JSON.stringify(result, null, 2));
				break;
			}
			case "tools": {
				await showTools();
				break;
			}
			default:
				console.error(`Unknown command: ${command}`);
				printUsage();
				process.exit(1);
		}
	} finally {
		await close();
	}
}

main().catch((error) => {
	console.error("Error:", error instanceof Error ? error.message : error);
	process.exit(1);
});
