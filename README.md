# datacat Editor

This application is a simple client implementation compatible with the datacat API.
It offers an opinionated view to manage a data catalog structured after ISO 12006-3.

This project was bootstrapped with [Vite](https://github.com/vitejs/vite).

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

%% ### `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information. %% 

### `npm run build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [Building for Production](https://vite.dev/guide/build.html) for more information.
You may also see some [Build options] (https://vite.dev/config/build-options.html). 

%% ### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (Webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it. %%

## Learn More

You can learn more in the [Vite documentation](https://vite.dev/guide/).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: https://vite.dev/guide/features.html 

%% ### Analyzing the Bundle Size

This section has moved here: https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size %%

### Making a Progressive Web App

This section has moved here: https://vite.dev/guide/philosophy.html 

%% ### Advanced Configuration

This section has moved here: https://facebook.github.io/create-react-app/docs/advanced-configuration %%

### Deployment

This section has moved here: https://vite.dev/guide/static-deploy.html 

### `npm run build` fails to minify

You may want to use some of these options: vite build --minify [minifier]	Enable/disable minification, or specify minifier to use (default: "esbuild") (boolean | "terser" | "esbuild").

# Docker image

This application is published as a [self-contained Docker image](https://hub.docker.com/repository/docker/bentrm/datacat-editor) 
with all npm packages needed pre-installed. The entrypoint of the container is the `npm start` script, which means a development
server is executed by default. It should only be used for development and local testing.

A static application bundle (see `npm run build`) for production use can be generated from this image
by using it as a builder image.
See the [datacat-stack](https://github.com/dd-bim/datacat-stack) project for an example.

# Configuration

The application is self-contained and will interact with the datacat API at the local path `/graphql`
by default. If you host your catalog at another location, you'll need to override the system variable `REACT_APP_API`.

For example, to run this application locally connecting to the datacat API on port 8080:

````bash
$ REACT_APP_API=http://localhost:8080/graphql npm start 
````
