# GeoJSON map layers

Contents of the front page background map can be expanded by defining GeoJson data sources in the configuration file.
Such additional geometry should be defined using WGS84 coordinate system.

The format of the geojson configuration entry is the following:

```
  geoJson: {
    layers: [ // an array of data sources
      {
        name: {
          // Displayed in UI. Should include supported languages
          fi: 'Lippuvyöhykkeet',
          sv: 'Resezoner',
          en: 'Ticket zones',
        },
        // web address of the data source
        url: '/hsl_zones.json',
        // metadata which describes how to render point features
        metadata: {
          name: 'nimi',
          popupContent: 'tiedot',
          textOnly: 'tekstielementti',
        },
      },
      // more geojson sources can follow. Each source gets a separate drawing/on off switch in the map layer selection list
    ]
  }
```

An external source for the layer configuration may also be used. The returned configuration must be valid JSON and its format must be equal to the format specified above.

The format for an external geojson configuration url is the following:

```
  geoJson: {
    layerConfigUrl: 'https://some.url/geojsonlayers',
  }
```

Note that these configuration methods are mutually exclusive meaning that only one method is supported at a time. Should both methods be used, the behaviour of the software is undefined.

## Feature handling and styling depending on type

If all the geojson features in the data retrieved from a single source are of type `Point`, they will be displayed on the map as if they were generic stops. When clicked, a popup appears on the map and the value of the `name` property is shown as the header and the values of the `address` and `city` properties are shown as the description.

Things to note when the custom component rendering method is used:

* The names of the fields (`name`, `address` and `city`) cannot be modified using metadata.
* Localization is supported for all fields (see [localization](#internationalization-and-localization-support)).
* Only the custom icon style option is available. The rest of the following styling options do not apply.

However, if the geojson features are not all of type `Point`, react-leaflet's default geojson handling and styling will be used. The default styling can be customized according to the following instructions.

## Line styling

Linestring features are rendered using primary theme color and a default style.
The style can be customized by including a style block of svg attributes:

```
    {
      "type": "Feature",
      "geometry": {
        "type": "LineString",
        "coordinates": [ ... ]
       },
       "properties": {
         // whatever props
       },
       "style": {
          // any or all of attributes below. Merged with the default style
          "color": "#00ff77",
          "weight": 6,
          "opacity": 0.6
        }
     }
```

## Point styling

Point features are rendered, by default, using a stop marker like disc symbol, which has theme colored edge and white interior.
The default marker style can be changed by including a svg style block in a feature:

```
  {
    "type": "Feature",
    "geometry": {
      "type": "Point",
      "coordinates": [24.9343, 60.18]
    },
    properties: {
      // props here
    },
    style: {
      // any or all of attributes below. Merged with default style
      "color": "#a07722",
      "fillColor": "white",
      "radius": 10,
      "opacity": 0.6,
      "fillOpacity": 1,
      "weight": 1
    }
  }
```

## Feature styling without data replication at source

Any of the feature types (at least Point, MultiPoint, LineString and MultiLineString) may be styled using a `styles` array instead of a single `style`. This is useful for displaying for example a two-tone area boundary line on the map.

This will duplicate the source feature's properties and geometries on the fly per each item in the `styles` array.

The following feature:

```
  {
    // properties and geometries
    "styles": [
      {
        // style 1
        "color": "black",
        "opacity": 1,
        "weight": 2
      },
      {
        // style 2
        "color": "black",
        "opacity": 0.2,
        "weight": 10
      }
    ]
  }
```

will end up being two similar features with different styles:

```
  {
    // cloned properties and geometries
    "style": {
      // style 1
      "color": "black",
      "opacity": 1,
      "weight": 2
    }
  },
  {
    // cloned properties and geometries
    "style": {
      // style 2
      "color": "black",
      "opacity": 0.2,
      "weight": 10
    }
  }
```

## Icon rendering

Points can be rendered with dynamically defined icons, too:

```
{
      "type": "Feature",
      "properties": {
        "icon": {
          "id": "somethingunique",
          "svg": "<svg xmlns='http://www.w3.org/2000/svg' > ... </svg>"
        }
      },
      // the rest of feature data
  }
```

All features do not need to repeat identical svg data; it is enough to define `icon.svg` once and the rest of the features can then set only the `icon.id` reference.

## Text rendering

A point feature can be rendered as a text label in primary theme color as follows:

```
    {
      "type": "Feature",
      "properties": {
        "textOnly": true,
        "name": "this-text-is-visible"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [24.63, 60.258]
      }
    }
```

In above, the default properties `'textOnly'` and `'name'` are used to control rendering. Other properties can be
used by adding a suitable metadata entry, which maps custom attributes into standard attributes,
into the configuration file (see the example configuration in the beginning of this document).

## Popups

A feature can include a popup menu which opens when the feature is clicked/tapped.
The content of the menu is defined as a html string in a property called `'popupContent'`. Alternatively,
another property can define the content and the name of the content attribute is defined in the metadata.

## Internationalization and localization support

Multiple language versions are supported for properties when the features are rendered using the custom components method (see [type-dependent handling](#feature-handling-and-styling-depending-on-type)). The localization tries to look for a matching property by the `_$locale` suffix first, falling back to the non-suffixed property.

For example, given the following feature:

```
  {
    "type": "Feature",
    "geometry": {
      "type": "Point"
    },
    "properties": {
      "name": "Test",
      "name_en": "Test",
      "name_fi": "Testi"
    }
  }
```

For the locale `fi` the `name_fi` property is used. For a non-matching locale the `name` property is used as a fallback.
