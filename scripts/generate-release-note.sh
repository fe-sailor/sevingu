#!/bin/bash

# 최신 태그를 가져옴
LAST_TAG=$(git describe --tags --abbrev=0)
CURRENT_VERSION=$(node -p "require('./package.json').version")

# 커밋 메시지를 가져옴
COMMITS=$(git log $LAST_TAG..HEAD --pretty=format:"- %s")

# 릴리스 노트를 작성함
echo "## Changes for version $CURRENT_VERSION" > release-notes.md
echo "" >> release-notes.md
echo "$COMMITS" >> release-notes.md
