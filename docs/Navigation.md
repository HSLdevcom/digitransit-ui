# Application navigation and hierarchy

Navigation in digitransit-ui should, whenever possible, adhere to the [Material Design guidelines](https://material.io/guidelines/patterns/navigation.html#navigation-up-back-buttons).

## Application view hierarchy

![Location](https://raw.githubusercontent.com/HSLdevcom/digitransit-ui/master/docs/images/hierarchy.png)

## Up button
The Up button is only present in the mobile layout of the service. The Up button moves up through the hierarchy depicted in the picture attached.
The Up-button is replaced by the home button in the desktop UI, as there is only a single level of views.
The native back button should move the user back through the history along the last views. The back button also closes any modals, such as offcanvas, search, favourite/nearby tabs etc. The back button does NOT return you to the previous state of the same view, such as when moving between tabs in the route view, when updating settings in the summary view or viewing different itineraries on the desktop version.
