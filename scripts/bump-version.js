#!/usr/bin/env node
const fs = require('fs');
const { spawnSync } = require('child_process');

function saveVersion(packageJson) {
	const { version } = packageJson;

	fs.writeFile(
		'./package.json',
		Buffer.from(JSON.stringify(packageJson, null, 4)),
		{ encoding: 'utf8' },
		err => {
			if (err) {
				return console.log('Error!', err);
			}

			console.log(`Successfully updated package.json to version ${version}`);
		}
	);
}

function getLatestVersion(packageJson) {
	let latestVersion;
	const latestPublishedVersion = spawnSync('npm', [
		'show',
		packageJson.name,
		'version',
	]);

	if (latestPublishedVersion.stderr.toString()) {
		latestVersion = packageJson.version;
	} else {
		latestVersion = latestPublishedVersion.stdout.toString().trim();
	}

	return latestVersion;
}

function incrementVersion(incrementer) {
	const rawPackage = fs.readFileSync('./package.json');
	const parsedPackage = JSON.parse(rawPackage);

	const latestVersion = getLatestVersion(parsedPackage);
	parsedPackage.version = incrementer(latestVersion);
	saveVersion(parsedPackage);
}

function incPatchVersion(version) {
	const [major, minor, patch] = version.split('.');
	if (isNaN(Number(patch)))
		throw Error(`Version is not made up of numbers! "${version}"`);
	const newPatch = String(Number(patch) + 1);
	return [major, minor, newPatch].join('.');
}

function incMinorVersion(version) {
	const [major, minor, patch] = version.split('.');
	if (isNaN(Number(minor)))
		throw Error(`Version is not made up of numbers! "${version}"`);
	const newMinor = String(Number(minor) + 1);
	return [major, newMinor, '0'].join('.');
}

function incMajorVersion(version) {
	const [major, minor, patch] = version.split('.');
	if (isNaN(Number(major)))
		throw Error(`Version is not made up of numbers! "${version}"`);
	const newMajor = String(Number(major) + 1);
	return [newMajor, '0', '0'].join('.');
}

const versionType = process.argv[2];

switch (versionType) {
	case 'patch':
		incrementVersion(incPatchVersion);
		break;
	case 'minor':
		incrementVersion(incMinorVersion);
		break;
	case 'major':
		incrementVersion(incMajorVersion);
		break;
	default:
		console.log('Invalid version bump type specified.');
}
