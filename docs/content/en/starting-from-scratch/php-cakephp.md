# PHP / CakePHP

### Generating a CakePHP application

```sh
$ azk shell --image azukiapp/php-fpm --shell /bin/bash
# composer create-project cakephp/app <my-app> --prefer-dist
# exit
```

> Note: If you're on Linux, you have to fix the ownership of the resulting folder. This is because the container run as root user, so that all created files and folder own to the root user. To do this fix, just run:

```sh
$ sudo chown -R `id -un`:`id -gn` <my-app>
```

### Creating the Azkfile.js

```sh
$ cd my-cake-php
$ azk init
```

### Running application

To start the development environment

```sh
$ azk start -o && azk logs --follow
```

### Examples

#### PHP with CakePHP

!INCLUDE "../../common/azkfilejs/php-cakephp.md"
