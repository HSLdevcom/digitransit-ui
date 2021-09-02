"Position" is user's current position that is queried through HTML geolocation interface. Position is used to show marker on map and to initialize routing start location.

Note that in this context "Position" is not same thing as "Location". User's position will change during a trip but start and stop locations remain the same. Please refer to the [terms](Terms.md) for a detailed definition.

![Position](https://raw.githubusercontent.com/HSLdevcom/digitransit-ui/master/docs/images/position.png)

|State|Description|
|--------|-------|
|**No position**|Application has no idea where user currently is or user's previous positions|
|**Previous position**|Application has no idea where user currently is but it knows where she was some time ago|
|**Positioning**|Browser is trying to find out user's geolocation|
|**Tracking position**|User's position is found and is being tracked by application|
|**Tracking position with bad accuracy**|User's position is found and is being tracked by application. However, tracking accuracy is not very good|
|**Positioning timeout**|ERROR: For some reason we didn't find user's position within 10 seconds|
|**Positioning aborted**|ERROR: User aborted positioning|
|**Positioning not supported**|ERROR: Browser does not support HTML5 positioning or it's not available on device|
|**Positioning denied**|ERROR: User has denied positioning on this page|
