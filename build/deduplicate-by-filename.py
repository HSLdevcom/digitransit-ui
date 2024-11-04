#!/usr/bin/env python3

from sys import argv
from os.path import basename, isfile

icons_seen = {}
for path in argv[1:]:
	filename = basename(path)
	if not isfile(path):
		continue

	# ignore duplicates
	if filename in icons_seen.keys():
		continue
	icons_seen[filename] = path
	print(path)
