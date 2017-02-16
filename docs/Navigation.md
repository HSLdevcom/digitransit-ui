# Application navigation and hierarchy

Navigation in digitransit-ui should, whenever possible, adhere to the [Material Design guidelines](https://material.io/guidelines/patterns/navigation.html#navigation-up-back-buttons). Read that document first to get an idea of the concept and terminology.

## Application view hierarchy

![Hierarchy](https://raw.githubusercontent.com/HSLdevcom/digitransit-ui/master/docs/images/hierarchy.png)

## Up button ![Up Button](https://raw.githubusercontent.com/HSLdevcom/digitransit-ui/master/docs/images/up.png)
The Up button is only present in the mobile layout of the service. The Up button moves the user to the view above it in the hierarchy. It does not move across the crosslinks in the service. The Up button is replaced by the home button in the desktop UI, as there is only a single level of views.

## Back button
The browser's back button should move the user back to the previous view in the browser history. The back button also closes any menus and modals, such as the main menu and search settings, search modals, opened tabs on the front page. It should also minimize any maximized maps on mobile. The back button should not return you to the previous state of the same view, such as when moving between tabs in the route view, when updating settings in the summary view or viewing different itineraries on the desktop version.
