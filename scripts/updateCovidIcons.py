import os
from svgpathtools import svg2paths
# import fileinput

isDownloaded = os.path.isdir('../caresteouvert')
if not isDownloaded:
    os.system('git clone git@github.com:osmontrouge/caresteouvert.git')
else:
    os.system('cd ../caresteouvert')
    os.system('git pull')
    os.system('cd ..')

# Move to the icons dir.
icons = os.listdir('../caresteouvert/icons')
new_code = ''

for icon in icons:
    attributes = svg2paths('../caresteouvert/icons/'+icon)

    id = 'poi_' + icon.split('.')[0]

    path_string = ''
    for path in attributes[1]:
        path_string += '<path d="' + path['d'] + '" />'

    new_icon = '\t<symbol id="' + id + '" viewBox="0 0 18 18">\n\t\t' + path_string + '\n\t</symbol>\n'

    new_code += new_icon

sprite = 'static/assets/svg-sprite.hb.svg'

# For this solution Covid POI icons should be the last group of icons in the sprite file.
f = open(sprite, "r")
contents = f.readlines()
f.close()

# TODO: remove old icons

contents.insert(-3, new_code)

f = open(sprite, "w")
contents = "".join(contents)
f.write(contents)
f.close()

""" # Another solution could be
for line in fileinput.FileInput(sprite, inplace=1):
    if 'COVID POI ICONS START' in line:
        line.replace(line, line + '\n' + new_code)
    print(line, end="")
"""

