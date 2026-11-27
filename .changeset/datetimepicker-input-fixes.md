---
'@digitransit-component/digitransit-component-datetimepicker': patch
---

Fix a crash when the colon is deleted from the typed time or four digits are pasted. Four typed digits are now formatted as a time, e.g. 1211 becomes 12:11. The desktop time field now consistently ignores characters other than digits and the colon, also when they replace the selected text. Give the mobile time picker dialog an accessible name. Keep the time choices in order when "now" is selected close to midnight. Keep the date and time lists of the desktop picker up to date when the picker is open over midnight, while "now" is selected, or when serviceTimeRange changes.
