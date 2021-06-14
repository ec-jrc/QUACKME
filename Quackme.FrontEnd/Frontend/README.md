
# MARS-OBSPPRO 1.0 (frontend)


### Quick start
**Make sure you have Node version >= 6.6.0 and NPM >= 3.10.8**
```bash
node --version
# v6.6.0
npm --version
# 3.10.8
```

**In case you have outdated version please follow next steps to update npm**
```bash
# Note: 'sudo' command is using for Unix based OS
```
```bash
# NodeJS and NPM update:
# 1) Clear NPM's cache:
npm cache clean -f
# 2) update NPM
npm install -g npm
```

```bash
# clone repo
# --depth 1 removes all but one .git commit history. "master" branch by default
git clone https:// - QUACKME-quackmeweb-frontend

# change directory to our repo
cd meteoguard-weatherwarning-frontend

# add required global libraries
sudo npm install -g typings webpack-dev-server rimraf webpack

# install the repo with npm
npm install
npm audit fix

# start the server
npm start

```

**go to [http://0.0.0.0:4200](http://0.0.0.0:4200) or [http://localhost:4200](http://localhost:4200) in your browser**

## Other commands

### build files
```bash
# Currently we have possibility to specify only one build environment: prod

# To build production we need to use command
npm run build:prod

## File Structure
We use the component approach in our project. This is the new standard for developing Angular apps and a great way to ensure maintainable code by encapsulation of our behavior logic. A component is basically a self contained app usually in a single file or a folder with each concern as a file: style, template, specs, e2e, and component class. Here's how it looks:
```
sse-fault-forecasting-system-frontend/
 │
 ├──src/                       * our source files that will be compiled to javascript
 |   ├──main.browser.ts        * our entry file for our browser environment
 │   │
 |   ├──index.html             * Index.html: where we generate our index page
 │   │
 |   ├──polyfills.ts           * our polyfills file
 │   │
 |   ├──karma.conf.js          * karma config for our unit tests
 │   │
 │   ├──app/                   * WebApp: folder
 │   │   ├──app.spec.ts        * a simple test of components in app.ts
 │   │   ├──app.e2e.ts         * a simple end-to-end test for /
 │   │   └──app.ts             * App.ts: a simple version of our App component components
 │   │
 │   └──assets/                * static assets are served here
 │       ├──images/             * our list of all images used in appliaction
 │       ├──robots.txt         * for search engines to crawl your website
 │       └──human.txt          * for humans to know who the developers are
 │
 ├──e2e/ 
 |   ├──protractor.conf.js     * protractor config for our end-to-end tests
 │
 ├──tslint.json                * typescript lint config
 ├──tsconfig.json              * config that webpack uses for typescript
 └──package.json               * what npm uses to manage it's dependencies
```

# TypeScript
> To take full advantage of TypeScript with autocomplete you would have to install it globally and use an editor with the correct TypeScript plugins.

## Use a TypeScript-aware editor
We have good experience using these editors:

* [Visual Studio Code](https://code.visualstudio.com/)
* [Webstorm](https://www.jetbrains.com/webstorm/download/)
* [Atom](https://code.visualstudio.com/) with [TypeScript plugin](https://atom.io/packages/atom-typescript)
* [Sublime Text](http://www.sublimetext.com/3) with [Typescript-Sublime-Plugin](https://github.com/Microsoft/Typescript-Sublime-plugin#installation)

# Typings
> When you include a module that doesn't include Type Definitions inside of the module you need to include external Type Definitions with Typings

## Use latest Typings module
```
npm install --global typings
```

## Custom Type Definitions
When including 3rd party modules you also need to include the type definition for the module
if they don't provide one within the module. You can try to install it with typings

```
typings install node --save
```

If you can't find the type definition in the registry we can make an ambient definition in
this file for now. For example

```typescript
declare module "my-module" {
  export function doesSomething(value: string): string;
}
```

## Unit Testing

This is an Angular2 project using TypeScript and Jasmine for unit testing.

In the current tooling setup, you should use one of these two commands to run the unit tests:

1. ``npm run watch:test`` -- runs tests continuously on the console; after every change to a file the tests will be re-run
2. ``npm run test`` -- runs tests once; this is also configured on the CI server to be run during a regular CI build.
3. ``npm run watch:ci`` -- runs tests once; this command create coverage raport
