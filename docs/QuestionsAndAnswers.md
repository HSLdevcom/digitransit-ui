# Questions and Answers
## Address search
### The geocoder does not show results from my area. Why?
Probably the geocoder is called with a bounding box area that restricts the returned addresses. Check, if boundary.rect.* properties are set correctly. 

## Configuration
### Why should I define searchArea in the config?
The searchArea setting specifies the region your services has reliable data for. If a user's route starts/ends outside this area, you may have Digitransit show a link to an higher level (e.g. national) itineray planner (defined via config.nationalServiceLink)

Additionaly, if config.useSearchPolygon is true, the polygon will be passed as boundary.polygon parameter to the pelias search engine. Note: if you use the photon-pelias-adapter, set config.useSearchPolygon to false, as only a bounding box parameter is supported.

