#HowTo:
# With this script you can automatically switch new reference photos for visual tests.
# It looks for current images in gemini-report folder that has failed 5 times, and replaces ui visual test images with those images.
# This script should reside in the same folder where gemini-report folder is.
# Your own path to ui visual tests is needed too. You can give it as an command line argument, default is "."


#! bin/bash

cd gemini-report
readarray -d '' array < <(find images/ -name "*diff_5*" -print0)
actual="~current_5"
png=".png"
PATH_TO_UI=${1:-"."}

cd ..
uipath="$PATH_TO_UI/test/visual-images/"
for i in "${array[@]}"
do :
   newPic=${i: 0:-11}$actual$png
   echo "$uipath${i: 7:-11}$png"
   mv gemini-report/$newPic $uipath${i: 7:-11}$png
done
