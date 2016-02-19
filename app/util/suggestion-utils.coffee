getNumberIfNotZero = (number) ->
  if number and not (number is "0") then " " + number else ""

getLocality = (suggestion) ->
  if suggestion.locality
    suggestion.locality
  else ''

getLabel =  (suggestion) ->
  name = switch suggestion.layer
    when 'address'
      suggestion.street + getNumberIfNotZero suggestion.housenumber + ', ' + getLocality suggestion
    when 'locality'
      suggestion.name + ', ' + getLocality suggestion
    when 'neighbourhood'
      suggestion.name + ', ' + getLocality suggestion
    when 'venue'
      suggestion.name + ', ' + getLocality suggestion

  if name == undefined
    name = suggestion.label

  name

module.exports =
  'getLabel': getLabel
