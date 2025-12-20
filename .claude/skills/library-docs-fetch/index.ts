import { callTool, close } from "./mcp-client.js";

interface LibraryDocsResponse {
	content: Array<{
		type: string;
		text?: string;
	}>;
}

interface CompactDocsResult {
	library: string;
	topic?: string;
	sections: number;
	preview: string;
	fullDocUrl?: string;
}

async function getLibraryDocs(
	library: string,
	topic?: string,
): Promise<CompactDocsResult> {
	try {
		console.error(
			`Fetching documentation for: ${library}${topic ? ` (topic: ${topic})` : ""}`,
		);

		const resolveResult = (await callTool("resolve-library-id", {
			libraryName: library,
		})) as LibraryDocsResponse;

		// テキストから最初のContext7-compatible library IDを抽出
		let libraryId = library;
		for (const content of resolveResult.content) {
			if (content.type === "text" && content.text) {
				// "Context7-compatible library ID: /xxx/yyy" のパターンを検索
				const match = content.text.match(
					/Context7-compatible library ID:\s*(\/[\w-]+\/[\w.-]+(?:\/[\w.-]+)?)/,
				);
				if (match?.[1]) {
					libraryId = match[1];
					break;
				}
			}
		}

		const docsResult = (await callTool("get-library-docs", {
			context7CompatibleLibraryID: libraryId,
			...(topic && { topic }),
		})) as LibraryDocsResponse;

		let docsText = "";
		for (const content of docsResult.content) {
			if (content.type === "text" && content.text) {
				docsText += content.text;
			}
		}

		const sectionMatches = docsText.match(/^#+\s+/gm) || [];
		const sections = sectionMatches.length;

		return {
			library,
			topic,
			sections,
			preview: docsText.slice(0, 300).trim(),
			fullDocUrl: `https://context7.dev/docs/${libraryId}`,
		};
	} finally {
		await close();
	}
}

const args = process.argv.slice(2);
if (args.length === 0) {
	console.error("Usage: tsx index.ts <library> [topic]");
	console.error("");
	console.error("Examples:");
	console.error('  tsx index.ts "react"');
	console.error('  tsx index.ts "aws-cdk" "lambda"');
	console.error('  tsx index.ts "boto3" "s3"');
	process.exit(1);
}

const library = args[0];
const topic = args[1];

getLibraryDocs(library, topic)
	.then((result) => {
		console.log(JSON.stringify(result, null, 2));
	})
	.catch((error) => {
		console.error("Error:", error instanceof Error ? error.message : error);
		process.exit(1);
	});
