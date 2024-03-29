# @digitransit-component/digitransit-component-datetimepicker

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## Datetimepicker

This component renders an input to choose a date and time. Renders separate input fields for date and time selection. Values for timestamp and arriveBy correspond to Digitransit query params time and arriveBy. This component will display a native date input on mobile and a custom one for desktop. Mobile detection is done by parsing user agent.

### Parameters

-   `props` **[Object][1]** 
    -   `props.realtime` **[boolean][2]** Determine if selected time should be updated in realtime when 'now' is selected.
    -   `props.initialArriveBy` **[boolean][2]** Initial value for arriveBy. Determines if picker is in arrival mode (true) or departure mode (false). Correct value is kept in component state even if this is not updated. Changing this will also trigger change in the component.
    -   `props.initialTimestamp` **[Number][3]** Initial value for selected time. Unix timestamp in seconds. Updating this will change timepicker value but the correct value is kept in component state even if this is not updated.
    -   `props.onDepartureClick` **[function][4]** Called with (time) when "departure" button is clicked. time is current input value in seconds
    -   `props.onArrivalClick` **[function][4]** Called with (time) when "arrival" button is clicked. time is current input value in seconds
    -   `props.onTimeChange` **[function][4]** Called with (time, arriveBy) when time input changes. time is number timestamp in seconds, arriveBy is boolean
    -   `props.onDateChange` **[function][4]** Called with (time, arriveBy) when date input changes. time is number timestamp in seconds, arriveBy is boolean
    -   `props.onNowClick` **[function][4]** Called when "depart now" button is clicked. time is current input value in seconds
    -   `props.embedWhenClosed` **[node][5]** JSX element to render in the corner when input is closed
    -   `props.embedWhenOpen` **[node][5]** JSX element to render when input is open
    -   `props.lang` **[string][6]** Language selection. Default 'en'
    -   `props.color`  
    -   `props.timeZone`  
    -   `props.fontWeights`  

### Examples

```javascript
<Datetimepicker
  realtime={true}
  initialTimestamp={1590133823}
  initialArriveBy={false}
  onTimeChange={(time, arriveBy) => changeUrl(time, arriveBy)}
  onDateChange={(time, arriveBy) => changeUrl(time, arriveBy)}
  onNowClick={(time) => changeUrl(undefined, undefined)}
  onDepartureClick={(time) => changeUrl(time, 'true')}
  onArrivalClick={(time) => changeUrl(time, undefined)}
  embedWhenClosed={<button />}
  lang={'en'}
/>
```

[1]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object

[2]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean

[3]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number

[4]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Statements/function

[5]: https://developer.mozilla.org/docs/Web/API/Node/nextSibling

[6]: https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String

<!-- This file is automatically generated. Please don't edit it directly:
if you find an error, edit the source file (likely index.js), and re-run
./scripts/generate-readmes in the digitransit-component project. -->

---

This module is part of the Digitransit-ui project. It is maintained in the
[HSLdevcom/digitransit-ui](https://github.com/HSLdevcom/digitransit-ui) repository, where you can create
PRs and issues.

### Installation

Install this module individually:

```sh
$ npm install @digitransit-component/digitransit-component-datetimepicker
```

Or install the digitransit-component module that includes it as a class:

```sh
$ npm install @digitransit-component/digitransit-component
```
