#!/bin/bash

# Build SamplePlugin for TiddlyWiki5

tiddlywiki \
	./*wiki \
	--verbose \
	--build \
	|| exit 1

cp *wiki/output/readme.md readme.md
cp *wiki/output/license.md license.md
