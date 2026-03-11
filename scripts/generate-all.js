/* eslint-disable no-console */
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const dig = require("../dist/index.js");

const OUT_DIR = path.join(__dirname, "..", "generated");
const ASSET_1_PATH = path.join(__dirname, "..", "dist", "assets", "stonk.png");
const ASSET_2_PATH = path.join(__dirname, "..", "dist", "assets", "clown.png");
const HEAVY_CASES = new Set([
	"blink",
	"triggered",
	"sticker",
	"pixelate",
	"wave",
	"glitch",
	"confusedStonk",
	"bobross",
	"doubleStonk",
	"spank",
]);

function ensureDir(dir) {
	fs.mkdirSync(dir, { recursive: true });
}

function writeOutput(name, ext, data) {
	const filePath = path.join(OUT_DIR, `${name}.${ext}`);
	fs.writeFileSync(filePath, data);
}

async function runCase(name, ext, fn) {
	const started = Date.now();
	const output = await fn();
	if (!Buffer.isBuffer(output)) {
		throw new Error(`${name} did not return a Buffer`);
	}
	writeOutput(name, ext, output);
	const ms = Date.now() - started;
	console.log(`OK   ${name} (${ms}ms)`);
}

function getConcurrency() {
	const arg = process.argv.find((v) => v.startsWith("--concurrency="));
	const fromArg = arg ? Number.parseInt(arg.split("=")[1], 10) : undefined;
	const fromEnv = process.env.GEN_CONCURRENCY
		? Number.parseInt(process.env.GEN_CONCURRENCY, 10)
		: undefined;
	const value = fromArg || fromEnv || 4;
	if (!Number.isFinite(value) || value < 1) return 1;
	return Math.min(value, 8);
}

async function runPool(cases, concurrency, failures) {
	let cursor = 0;
	const workers = Array.from({ length: concurrency }, async () => {
		while (cursor < cases.length) {
			const index = cursor++;
			const [name, ext, fn] = cases[index];
			try {
				await runCase(name, ext, fn);
			} catch (error) {
				const message = error instanceof Error ? error.message : String(error);
				failures.push({ name, message });
				console.error(`FAIL ${name}: ${message}`);
			}
		}
	});
	await Promise.all(workers);
}

async function main() {
	const started = Date.now();
	ensureDir(OUT_DIR);
	const ASSET_1 = fs.readFileSync(ASSET_1_PATH);
	const ASSET_2 = fs.readFileSync(ASSET_2_PATH);
	const concurrency = getConcurrency();

	const cases = [
		// Filters
		["blur", "png", () => dig.blur(ASSET_1, 6)],
		["gay", "png", () => dig.gay(ASSET_1)],
		["greyscale", "png", () => dig.greyscale(ASSET_1)],
		["invert", "png", () => dig.invert(ASSET_1)],
		["sepia", "png", () => dig.sepia(ASSET_1)],
		["pixelate", "png", () => dig.pixelate(ASSET_1, 8)],
		["wave", "png", () => dig.wave(ASSET_1, 10, 5)],
		["glitch", "png", () => dig.glitch(ASSET_1, 6)],
		["sticker", "png", () => dig.sticker(ASSET_1, 14)],

		// GIF
		["blink", "gif", () => dig.blink(120, ASSET_1, ASSET_2)],
		["triggered", "gif", () => dig.triggered(ASSET_1, 20)],

		// Image templates
		["affect", "png", () => dig.affect(ASSET_1)],
		["wanted", "png", () => dig.wanted(ASSET_1, "$", 500000)],
		["tatoo", "png", () => dig.tatoo(ASSET_1)],
		["kiss", "png", () => dig.kiss(ASSET_1, ASSET_2)],
		["Batslap", "png", () => dig.Batslap(ASSET_1, ASSET_2)],
		["ad", "png", () => dig.ad(ASSET_1)],
		["beautiful", "png", () => dig.beautiful(ASSET_1)],
		["bed", "png", () => dig.bed(ASSET_1, ASSET_2)],
		["clown", "png", () => dig.clown(ASSET_1)],
		["hitler", "png", () => dig.hitler(ASSET_1)],
		["trash", "png", () => dig.trash(ASSET_1)],
		["stonk", "png", () => dig.stonk(ASSET_1)],
		["spank", "png", () => dig.spank(ASSET_1, ASSET_2)],
		["snyder", "png", () => dig.snyder(ASSET_1)],
		["rip", "png", () => dig.rip(ASSET_1)],
		["notStonk", "png", () => dig.notStonk(ASSET_1)],
		["partyHat", "png", () => dig.partyHat(ASSET_1)],
		["lisaPresentation", "png", () => dig.lisaPresentation("No bugs in prod")],
		["jail", "png", () => dig.jail(ASSET_1)],
		["heartbreaking", "png", () => dig.heartbreaking(ASSET_1)],
		["facepalm", "png", () => dig.facepalm(ASSET_1)],
		["securityCamera", "png", () => dig.securityCamera(ASSET_1, "CAM 03")],
		["doubleStonk", "png", () => dig.doubleStonk(ASSET_1, ASSET_2)],
		["confusedStonk", "png", () => dig.confusedStonk(ASSET_1)],
		["deepfry", "png", () => dig.deepfry(ASSET_1)],
		["bobross", "png", () => dig.bobross(ASSET_1)],
		["Delete", "png", () => dig.Delete(ASSET_1)],

		// Fun
		[
			"Music",
			"png",
			() =>
				dig.Music({
					title: "Never Gonna Give You Up",
					artist: "Rick Astley",
					image: ASSET_1,
					time: { currentTime: 42, totalTime: 213 },
				}),
		],
		[
			"Quote",
			"png",
			() =>
				dig.Quote({
					quote: "Simplicity is reliability.",
					author: "Edsger Dijkstra",
					gradient: {
						type: "linear",
						colors: ["#1f2937", "#3b82f6", "#93c5fd"],
					},
				}),
		],
		[
			"alwaysHasBeen",
			"png",
			() =>
				dig.alwaysHasBeen({
					planet: { text: "Every browser is" },
					reveal: { text: "Chromium" },
				}),
		],
		["drake", "png", () => dig.drake("Ship quick hacks", "Ship maintainable code")],
		[
			"distractedBoyfriend",
			"png",
			() => dig.distractedBoyfriend("legacy API", "me", "new API"),
		],
		[
			"twoButtons",
			"png",
			() =>
				dig.twoButtons(
					"Ship quick",
					"Ship clean",
					"When product wants both by Friday",
				),
		],
		[
			"level",
			"png",
			() =>
				dig.level({
					name: "grish",
					level: 15,
					avatar: ASSET_1,
					xp: 450,
					maxXp: 1000,
					layout: "classic",
					theme: "default",
				}),
		],
		[
			"welcomeCard",
			"png",
			() =>
				dig.welcomeCard({
					username: "grish",
					avatar: ASSET_1,
					servername: "discord-image-utils",
					memberCount: 101,
					theme: "tech",
					meta: [
						{ label: "Member Count", value: "#101" },
						{ label: "Theme", value: "tech" },
						{ label: "Server", value: "discord-image-utils" },
					],
				}),
		],
		[
			"welcomeCard_default",
			"png",
			() =>
				dig.welcomeCard({
					username: "grish",
					avatar: ASSET_1,
					servername: "discord-image-utils",
					memberCount: 101,
					theme: "default",
					meta: [
						{ label: "Member Count", value: "#101" },
						{ label: "Theme", value: "default" },
						{ label: "Server", value: "discord-image-utils" },
					],
				}),
		],
		[
			"welcomeCard_dark",
			"png",
			() =>
				dig.welcomeCard({
					username: "grish",
					avatar: ASSET_1,
					servername: "discord-image-utils",
					memberCount: 101,
					theme: "dark",
					meta: [
						{ label: "Member Count", value: "#101" },
						{ label: "Theme", value: "dark" },
						{ label: "Server", value: "discord-image-utils" },
					],
				}),
		],
		[
			"welcomeCard_light",
			"png",
			() =>
				dig.welcomeCard({
					username: "grish",
					avatar: ASSET_1,
					servername: "discord-image-utils",
					memberCount: 101,
					theme: "light",
					meta: [
						{ label: "Member Count", value: "#101" },
						{ label: "Theme", value: "light" },
						{ label: "Server", value: "discord-image-utils" },
					],
				}),
		],
		[
			"welcomeCard_colorful",
			"png",
			() =>
				dig.welcomeCard({
					username: "grish",
					avatar: ASSET_1,
					servername: "discord-image-utils",
					memberCount: 101,
					theme: "colorful",
					meta: [
						{ label: "Member Count", value: "#101" },
						{ label: "Theme", value: "colorful" },
						{ label: "Server", value: "discord-image-utils" },
					],
				}),
		],
		[
			"welcomeCard_minimal",
			"png",
			() =>
				dig.welcomeCard({
					username: "grish",
					avatar: ASSET_1,
					servername: "discord-image-utils",
					memberCount: 101,
					theme: "minimal",
					meta: [
						{ label: "Member Count", value: "#101" },
						{ label: "Theme", value: "minimal" },
						{ label: "Server", value: "discord-image-utils" },
					],
				}),
		],
		[
			"welcomeCard_tech",
			"png",
			() =>
				dig.welcomeCard({
					username: "grish",
					avatar: ASSET_1,
					servername: "discord-image-utils",
					memberCount: 101,
					theme: "tech",
					meta: [
						{ label: "Member Count", value: "#101" },
						{ label: "Theme", value: "tech" },
						{ label: "Server", value: "discord-image-utils" },
					],
				}),
		],
		[
			"WelcomeCardBuilder",
			"png",
			() =>
				new dig.WelcomeCardBuilder()
					.setUsername("builder-user")
					.setAvatar(ASSET_1)
					.setServerName("discord-image-utils")
					.setMemberCount(102)
					.setTheme("default")
					.setMessage("Welcome aboard")
					.setMeta([
						{ label: "Member Count", value: "#102" },
						{ label: "Theme", value: "default" },
						{ label: "Server", value: "discord-image-utils" },
					])
					.render(),
		],
	];

	const failures = [];
	const lightCases = cases.filter(([name]) => !HEAVY_CASES.has(name));
	const heavyCases = cases.filter(([name]) => HEAVY_CASES.has(name));

	// Run lighter cases in parallel for speed.
	await runPool(lightCases, concurrency, failures);

	// Keep heavier image operations sequential to avoid memory spikes.
	for (const [name, ext, fn] of heavyCases) {
		try {
			await runCase(name, ext, fn);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			failures.push({ name, message });
			console.error(`FAIL ${name}: ${message}`);
		}
	}

	console.log("");
	console.log(`Concurrency: ${concurrency}`);
	console.log(`Total time: ${Date.now() - started}ms`);
	console.log(`Generated outputs in: ${OUT_DIR}`);
	console.log(`Passed: ${cases.length - failures.length}/${cases.length}`);

	if (failures.length > 0) {
		console.log("Failures:");
		for (const failure of failures) {
			console.log(`- ${failure.name}: ${failure.message}`);
		}
		process.exitCode = 1;
	}
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
