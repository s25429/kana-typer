# Kana Typer

Provides a way to study and practice japanese kana characters.

[![Build Status]()]()

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Testing](#testing)
- [License](#license)
- [Authors](#authors)
- [Acknowledgments](#acknowledgments)
- [Support](#support)
- [Changelog](#changelog)
- [Roadmap](#roadmap)

## Installation

1. **Clone the repository**.

    ```bash
    git clone https://github.com/username-here/project-name-here.git
    ```

2. **Navigate to the project directory** and open it with editor of your choice or use GUI to do the same.

    ```bash
    cd project-name-here
    code .
    ```

3. **Install required dependencies**. You may use integrated terminal if you text editor is equipped with it (for VSCode press CTRL+`) or use terminal used previously to clone the repository.

    ```bash
    npm install --save-dev typescript
    npm install --save-dev sass
    npm install -g sass
    sass src/scss/:src/css/
    ```

## Usage

There are few ways to launch and use project's current dev build. You may use one depending on your needs and preferences.

### Using VSCode and Live Server (preferred)

1. **Open the project in VSCode**: If you haven't done that already to install dependencies open the project either by opening VSCode and choosing a folder under `File > Open Folder`, using option `Open with Code` in context menu by right clicking folder with the project, or typing `code .` while being in the project directory in terminal of your choice.

2. **Generate JS files**: In terminal of your choice run `npm run tsc`. This should run TypeScript Compiler that will generate your JS files in src/js/ directory. You should not edit them, only modify TS files and save them, TSC launched in the terminal will do the rest.

3. **Generate CSS files**: As of now the project has no Sass files, so no further action is needed for now, but will be needed in future renditions of this project.

4. **Install the Live Server Extenstion**: Navigate to Extensions tab on the sidebar on the left, or by pressing CTRL+SHIFT+X and search for "Live Server" by Ritwick Dey. Install the extension and reload the app by pressing CTRL+SHIFT+P, typing `reload` and the pressing enter.

5. **Launch the project**: Either right-click on the HTML file in public/ and select "Open with Live Server", or search for "Go Live" button at the bottom right corner of the program.

6. **Interact with the project**: Web project should now launch in your default browser. For the time being the main index file is in public/ directory. Navigate there in your browser and you should be good to go.

### Using a Typescript Bundler

1. Well no idea yet, lol.

### Using custom server

1. Something with node.js I bet.

## Configuration

If your project has configuration files, describe their purpose and how to modify them.

## Features

List the main features and functionalities of your project.

## API Documentation

Provide details on how to use any APIs your project exposes.

## Contributing

Explain how others can contribute to your project

- Fork the repository
- Create a new branch
- Make your changes
- Open a pull request

## Testing

Explain how to run tests and provide information about code coverage.

## License 

This project is licensed under the MIT License.

## Authors

- Cezary Ciślak ([@s25429](s25429@pjwstk.edu.pl))

## Acknowledgments

Mention any external libraries, resources, or contributors you'd like to acknowledge.

## Support

For support, open an issue or contact us at support@example.com.

## Changelog

### Version 0.0.1 (2023-08-29)
- initial working prototype (should not be here, it's not a release)

## Roadmap

Outline your future plans and features for the project.

## Old README.md

### Getting started with basic typescript

```
npm init -y
npm install --save-dev typescript
npx tsc --init
```

> package.json
> ```
> "scripts" {
>   "start": "tsc --watch"  // npm start
> }
> ```

> tsconfig.json
> ```
> "outDir": "./dest/"
> ```

### getting started with typescript bundler

```
npx create-snowpack-app . --template @snowpack/app-template-blank-typescript --force  // will remove this file lolz
```

### Sources
- [First Typescript Project](https://www.youtube.com/watch?v=jBmrduvKl5w) by Web Dev Simplified on YouTube