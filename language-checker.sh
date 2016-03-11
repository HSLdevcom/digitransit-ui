#!/bin/bash

# Find which bundle ids are in use
usedBundleIds=$(grep -hor "id=.*" app/* | cut -d " " -f 1 | grep -v "props" | grep -hor "['|\"].*['|\"]" | sed "s/['|\"]//g")

# Then expect to find 4 instances for alle
for id in $usedBundleIds; do
  echo "CHECK $id:"
  grep "'$id'" app/translations.coffee
done;
