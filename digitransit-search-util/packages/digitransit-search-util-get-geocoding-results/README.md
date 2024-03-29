# @digitransit-search-util/digitransit-search-util-get-geocoding-results

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## getGeocodingResults

<DESCRIPTION>

### Parameters

-   `searchString` **[String][1]** 
-   `searchParams` **[String][1]** (Optional) Parameters appended to url, basically box / polygon to restrict search area
-   `lang` **[String][1]** (Optional) search language
-   `focusPoint` **[Object][2]** (Optional) Own Position (PELIAS API)
-   `sources` **[String][1]** (Optional) search sources (e.g OSM, GTFS..)
-   `minimalRegexp` **[Object][2]** (Optional) Regexp for testing

### Examples

```javascript
digitransit-search-util.getGeocodingResults("result");
//= e.g. {text:"result"}
```

Returns **[String][1]** Results in JSON form

[1]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

[2]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

<!-- This file is automatically generated. Please don't edit it directly:
if you find an error, edit the source file (likely index.js), and re-run
./scripts/generate-readmes in the digitransit-util project. -->

---

This module is part of the Digitransit-ui project. It is maintained in the
[HSLdevcom/digitransit-ui](https://github.com/HSLdevcom/digitransit-ui) repository, where you can create
PRs and issues.

### Installation

Install this module individually:

```sh
$ npm install @digitransit-search-util/digitransit-search-util-get-geocoding-results
```

Or install the Digitransit-util module that includes it as a function:

```sh
$ npm install @digitransit-util/digitransit-util
```
