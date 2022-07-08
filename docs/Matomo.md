# WiP: How-to include Matomo

- Install a Matomo instance
- Create the website in Matomo and remember the Site ID
- Go to "Tag Manager" and select the site and die default container (or create a new one)
- Go to "Versions"
- Import container settings (container settings > versions > import)
- Go To "Variables"
- Adjust container settings (Site ID in variable "MiH Matomo")
- Go to "Versions"
- Create new version and release this version
- Add the URL of the container in /app/configurations/config.XXXX.js
  - e.g. const MATOMO_URL = 'https://nutzung.bbnavi.de/js/container_EPPlG1eo.js';
  - The last part of the URL is the container ID
  - Make sure to not only define the const, but to also include it into the configMerger

| Frontent | Matomo Site ID | Matomo Container ID | Script-URL |
| <https://angermuende.bbnavi.de> | 2 | 4BRoKipH | <https://nutzung.bbnavi.de/js/container_4BRoKipH.js> |
| <https://bad-belzig.bbnavi.de> | 3 | OrGgJ17H | <https://nutzung.bbnavi.de/js/container_OrGgJ17H.js> |
| <https://bernau-bei-berlin.bbnavi.de> | 4 | yHcKbzwR | <https://nutzung.bbnavi.de/js/container_yHcKbzwR.js> |
| <https://dabb.bbnavi.de> | 5 | 2EO6l2Kg | <https://nutzung.bbnavi.de/js/container_2EO6l2Kg.js> |
| <https://fuerstenberg-havel.bbnavi.de> | 6 | M1eo1mXj | <https://nutzung.bbnavi.de/js/container_M1eo1mXj.js> |
| <https://herzberg-elster.bbnavi.de> | 7 | Nns2ABhr | <https://nutzung.bbnavi.de/js/container_Nns2ABhr.js> |
| <https://mitfahrenbb.de> | 8 | MlnEbkiT | <https://nutzung.bbnavi.de/js/container_MlnEbkiT.js> |
| <https://radverkehr.bbnavi.de> | 9 | vsBXzsHm | <https://nutzung.bbnavi.de/js/container_vsBXzsHm.js> |
| <https://th-brandenburg.bbnavi.d> | 10 | oVwbhfUS | <https://nutzung.bbnavi.de/js/container_oVwbhfUS.js> |
