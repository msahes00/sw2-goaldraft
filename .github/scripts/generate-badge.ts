import { readFile, writeFile } from "node:fs/promises";
import { makeBadge } from "npm:badge-maker";
import { lcovParser } from "npm:@friedemannsommer/lcov-parser";

async function parseLcov(path: string): Promise<number> {

	// Parse the lcov file
	const data = await readFile(path, "utf-8");
	const files = await lcovParser({
		from: data,
	});

	// Count the lines executed and found
	let linesExecuted = 0;
	let linesFound = 0;

	for (const file of files) {
		linesExecuted += file.lines.hit;
		linesFound += file.lines.instrumented;
	}

	// Return the coverage as a percentage (or 0 if no lines were found)
	return linesFound > 0 ? (linesExecuted / linesFound) * 100 : 0;
}

async function createBadge(coverage: number, svgPath:  string) {

	// Pick a color based on coverage percentage
	const color = 
		coverage >= 90 ? "brightgreen":
		coverage >= 75 ? "green"      :
		coverage >= 60 ? "yellowgreen":
		coverage >= 50 ? "yellow"     :
		coverage >= 40 ? "orange"     :
		"red";

	// Generate the badge SVG and write it to a file
	const svg = makeBadge({
		label: "coverage",
		message: `${coverage.toFixed(1)}%`,
		color: color,
	});

	await writeFile(svgPath, svg);
	console.log(`Badge generated successfully: ${svgPath}`);
}


// Main program entry point
async function main() {
	try {
		const lcovPath = Deno.args[0] || "coverage/lcov.info";
		const outputFile = Deno.args[1] || "coverage.svg";

		const coverage = await parseLcov(lcovPath);
		await createBadge(coverage, outputFile);

	} catch (err) {

		// Handle any errors
		console.error(err);
		Deno.exit(1);
	}
}

// Run the main function if the script is executed
if (import.meta.main) {
	main();
}


