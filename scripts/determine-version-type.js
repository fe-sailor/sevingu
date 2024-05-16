#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

const keywords = JSON.parse(
	fs.readFileSync('version-bump-keywords.json', 'utf8')
);

const commitMessage = execSync('git log -1 --pretty=%B').toString().trim();

let versionType = '';

for (const [type, words] of Object.entries(keywords)) {
	for (const word of words) {
		const regex =
			type === 'major' ? new RegExp(`\\b${word}\\b`) : new RegExp(word, 'i');
		if (regex.test(commitMessage)) {
			versionType = type;
			break;
		}
	}
	if (versionType) break;
}

if (!versionType) {
	console.error('No version bump keyword found in the commit message.');
	process.exit(1);
}

console.log(versionType);
