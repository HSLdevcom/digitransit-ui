#!/bin/bash

# This script compiles all svg files from directories in static/svg-icons
# into one sprite file per directory. The sprite file 
# generated into _static/assets/svg-sprite.$dir$.svg will contain all icons
# from the static/svg-icons/<dir>/ merged with those from static/svg-icons/default/.
set -e -u -o pipefail

cd $(dirname $(dirname $(realpath $0)))

# todo: `--defs-inline` ?
# todo: `--defs-example --defs-example-dest svg-sprite.$CONFIG.svg.html` ?
# todo: it woul be helpful, if a theme could inherit not only from default

icons_dir=static/svg-icons
build_dir="$(dirname $(realpath $0))"
spritesheets_into_assets="--defs --defs-dest _static/assets"
with_root_attrs="--svg-rootattrs $build_dir/svg-sprite-root-attrs.json"

# other themes depend on default, so we generate this explicitly before all others
echo -e "\ngenerating svg-sprite.default.svg"
yarn exec -- \
	svg-sprite -l info $spritesheets_into_assets $with_root_attrs \
	--ds svg-sprite.default.svg \
	$icons_dir/default/*.svg

# collect all subdirs of icons_dir
shopt -s nullglob
themes=( "$icons_dir"/*/ )
themes=( "${themes[@]#$icons_dir/}" )
themes=( "${themes[@]%/}" )

for theme in "${themes[@]}"
do
	# for all but subdirs - default excluded - generate sprite
	if [ "$theme" != "default" ]; then
		echo -e "\ngenerating svg-sprite.$theme.svg"
		yarn exec -- \
			svg-sprite -l info $spritesheets_into_assets $with_root_attrs \
			--ds svg-sprite.$theme.svg \
			$(./build/deduplicate-by-filename.py $icons_dir/{$theme,default}/*.svg)
	fi
done
