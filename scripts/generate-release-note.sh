# #!/bin/bash

current_tag=$(git describe --tags --abbrev=0)

if [[ $current_tag == v* ]]; then
    v_prefix="v"
    version=${current_tag#v}
else
    v_prefix=""
    version=${current_tag}
fi

IFS='.' read -r major minor patch <<< "${version}"
current_base_tag="${v_prefix}${major}.${minor}.0"
if [ "$minor" -eq 0 ]; then
    previous_major=$((major - 1))
    if [ "$previous_major" -lt 0 ]; then
        echo "No previous version available."
        exit 1
    fi

    # 이전 major 버전의 모든 태그를 가져와서 minor의 최대값 찾기
    previous_minor=$(git tag -l "${v_prefix}${previous_major}.*" | grep -oE "${previous_major}\.[0-9]+" | sed "s/${previous_major}\.//" | sort -nr | head -n 1)
else
    previous_major=$major
    previous_minor=$((minor - 1))
fi

previous_tag=$(git tag -l "${v_prefix}${previous_major}.${previous_minor}.*" --sort=-v:refname | head -n 2 | tail -n 1)

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
            echo "$line" 
        done
    else
        echo "No previous tag found with one minor version lower."
    fi
} > "$output_file"
