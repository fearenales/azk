# Node.js

Example of generating a Node.js application:

## Using npm init

### Generating a package.json

```sh
$ mkdir <my-app>
$ cd <my-app>
$ azk shell --image azukiapp/node --shell /bin/bash
# npm init //follow the instructions afterwards
# exit
```

> Note: If you're on Linux, you have to fix the ownership of the resulting folder. This is because the container run as root user, so that all created files and folder own to the root user. To do this fix, just run:

```sh
$ sudo chown -R `id -un`:`id -gn` .
```

### Creating the Azkfile.js

```sh
$ azk init
```

## Using the express-generator module

### Generating the project

```sh
$ azk shell --image azukiapp/node --shell /bin/bash
# npm install -g express-generator
# express <my-app>
# exit
```

### Creating the Azkfile.js

```sh
$ cd <my-app>
$ azk init
```

### Running application

To start the development environment

```sh
$ azk start -o && azk logs --follow
```

### Examples

#### Node with Mongodb

!INCLUDE "../../common/azkfilejs/node-mongodb.md"
