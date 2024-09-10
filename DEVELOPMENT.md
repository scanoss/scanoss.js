### Local Development
If you want to develop this package and use it locally in your project (without publishing it), follow these steps:

#### 1 - Creating a Symbolic Link for the Development Package:
In the root of the scanoss.js package, run the command:

```bash
npm install && npm run build && npm link . 
```
This command creates a global symbolic link in your system that points to the local location of your package. This means you can use the package in any other Node.js project on your machine as if it were installed globally.

#### 2 - Using the Package in Your Project:

In the root of the project where you want to use the scanoss package, run the command:

```bash
npm link scanoss
```
This will create a symbolic link in your project to the globally linked scanoss package. Any changes made in the package will be immediately reflected in the consuming project.

#### 3 - Disconnecting the Link:

Remember that once you finish developing or using the package locally, you should break the link to avoid potential issues with future versions or with installing other packages. To do this, simply run:

```bash
npm unlink scanoss
```
in both the project and the scanoss package. This will remove the symbolic links and restore the normal state of the packages.

