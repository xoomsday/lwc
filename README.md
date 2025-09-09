# Local World Clock PWA

This is a simple Progressive Web App (PWA) that displays the local
time and a list of world clocks for different timezones.

## Features

*   Displays the current time and date for your local timezone.
*   Shows a list of clocks for various cities around the world.
*   Add new locations to the list.
*   Remove existing locations from the list.
*   Reorder locations by dragging and dropping.
*   Works offline thanks to its service worker.
*   Can be installed on your device as a PWA.

## How to Use

1.  Serve the `lwc` directory using a simple web server. For example,
    you can use Python's built-in server:
    ```bash
    python3 -m http.server
    ```
2.  Open your web browser and navigate to the server address (e.g.,
    `http://localhost:8000/`).

The application is designed to be relocatable, so it can be served
from any path on a web server.

## Managing Locations

*   **Add a new location**: Click on the '+' button at the bottom right
    to open a dialog where you can enter a new location.
*   **Remove an existing location**: Click on the 'X' button next to
    the location you want to remove.
*   **Reorder the locations**: Press and hold the mouse button over a
    location and drag it to a new position in the list.
