# Local World Clock PWA

This is a simple Progressive Web App (PWA) that displays the local
time and a list of world clocks for different timezones.

## Features

*   Displays the current time and date for your local timezone.
*   Shows a list of clocks for various cities around the world.
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

## Customization

Currently, the list of world clocks is hardcoded in `lwc.js`.
Future versions will include a user interface to add, remove, and
reorder the clocks.
