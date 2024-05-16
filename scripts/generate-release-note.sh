# #!/bin/bash

current_tag=$(git describe --tags --abbrev=0)

IFS='.' read -r major minor patch <<< "${current_tag}"

current_base_tag="${major}.${minor}.0"

previous_minor=$((minor - 1))

previous_tag=$(git tag -l "${major}.${previous_minor}.*" --sort=-v:refname | head -n 1)

repo_url=https://github.com/fe-sailor/sevingu
output_file="release-note.md"

{
    if [ -n "$previous_tag" ]; then
        echo "### Release Notes"
        echo ""
        echo "#### Changes from $current_base_tag to $current_tag"
        echo ""

        git log --pretty=format:"* %s ([%h]($repo_url/commit/%H))" "$previous_tag..HEAD" | while read -r line; do
            # "chore"가 포함된 커밋 제외
            if echo "$line" | grep -q "chore"; then
                continue
            fi

            # PR 번호가 있는 경우 링크로 변경 (예: #1234)
            pr_number=$(echo "$line" | grep -oE "#[0-9]+")
            if [ -n "$pr_number" ]; then
                pr_number="${pr_number//#}"
                echo "$line ([PR #$pr_number]($repo_url/pull/$pr_number))"
            else
                echo "$line"
            fi
        done
    else
        echo "No previous tag found with one minor version lower."
    fi
} > "$output_file"
