import os, sys
from svgpathtools import svg2paths

# Update the caresteouvert repo.
if not os.path.isdir('caresteouvert'):
    os.system('git clone git@github.com:osmontrouge/caresteouvert.git')
else:
    os.chdir('caresteouvert')
    os.system('git pull')
    os.chdir('..')

# List the icon filenames.
icons = os.listdir('caresteouvert/icons')
new_code = ''

# Get the paths from each svg file and build info as needed.
for icon in icons:
    attributes = svg2paths('caresteouvert/icons/'+icon)

    id = 'poi_' + icon.split('.')[0]

    path_string = ''
    for path in attributes[1]:
        path_string += '<path d="' + path['d'] + '" />'

    new_icon = '\t<symbol id="' + id + '" viewBox="0 0 18 18">\n\t\t' + path_string + '\n\t</symbol>\n'

    new_code += new_icon

source = 'static/assets/svg-sprite.hb.svg'
tmp = 'static/assets/tmp.svg'

# For this solution Covid POI icons should be between two specific comment lines!
# Remove old version of icons, create a new, temporary file.
keep = 1
with open(source) as infile, open(tmp, "w") as outfile:
    for line in infile:
        if line.__contains__("COVID POI ICONS START"):
            outfile.write(line)
            keep = 0
        if keep:
            outfile.write(line)
        if line.__contains__("COVID POI ICONS END"):
            outfile.write(line)
            keep = 1

# Find first comment line in the temporary file.
f = open(tmp, "r")
contents = f.readlines()
f.close()

for num, line in enumerate(contents, 1):
    if 'COVID POI ICONS START' in line:
        start = num
        break

# Insert new icons into the temporary file, after the comment line.
contents.insert(start, new_code)

# Overwrite the original file with the new data.
f = open(source, "w")
contents = "".join(contents)
f.write(contents)
f.close()

# Remove the temporary file.
os.remove(tmp)