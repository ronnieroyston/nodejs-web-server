# Nodejs Native Web Server

This is a Web Server implemented using Node's native [HTTP module](https://nodejs.org/api/http.html).

## Usage

To use this web server follow the instructions below:

1. Install [Nodejs](https://nodejs.org/en) and [Git](https://git-scm.com/) on your machine.
2. Clone this repository to your machine, i.e. `git clone https://github.com/ronnieroyston/nodejs-web-server.git`.
2. Open a terminal at the location of the `server.js` file on your machine and issue the command `node server`.
4. Open a web browser on your machine and navigate to `127.0.0.1:8080`.
5. The server must be restarted after adding new subdirectories under the `/public` root folder.

### Release Notes

The server assumes a `/public` directory exists in the location of the Node script and that all HTML files include the `.html` file extension. This `/public` directory is the root directory of the web server. Subdirectories under the root directory are each assumed to have an `.index.html` file.

 - Calls to the root directory and its subdirectories read from the `index.html` at that path.
 - Calls without a file extension have `.html` added to the URL.

