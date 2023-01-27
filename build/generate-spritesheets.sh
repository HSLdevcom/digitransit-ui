#!/bin/bash

set -e -u -o pipefail

cd $(dirname $(dirname $(realpath $0)))

function deduplicate_by_filename () {
	for file in $*; do
		echo -e "$(basename "$file")\t$file"
	done | sort -u -t$'\t' -k1,1 | awk -F'\t' '{print $2}'
}

build_dir="$(dirname $(realpath $0))"
spritesheets_into_assets="--defs --defs-dest _static/assets"
with_root_attrs="--svg-rootattrs $build_dir/svg-sprite-root-attrs.json"

echo -e "\ngenerating svg-sprite.default.svg"
yarn exec -- \
	svg-sprite -l info $spritesheets_into_assets $with_root_attrs \
	--ds svg-sprite.default.svg \
	static/svg-icons/default/*.svg

echo -e "\ngenerating svg-sprite.hsl.svg"
yarn exec -- \
	svg-sprite -l info $spritesheets_into_assets $with_root_attrs \
	--ds svg-sprite.hsl.svg \
	$(deduplicate_by_filename static/svg-icons/{hsl,default}/*.svg)
