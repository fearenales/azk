# Python / Django

### Generating a Django application

```sh
$ azk shell --image azukiapp/python --shell /bin/bash
# pip install Django
# django-admin startproject <my-app>
# exit
```

> Note: If you're on Linux, you have to fix the ownership of the resulting folder. This is because the container run as root user, so that all created files and folder own to the root user. To do this fix, just run:

```sh
$ sudo chown -R `id -un`:`id -gn` <my-app>
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

#### Python with Django

!INCLUDE "../../common/azkfilejs/python-django.md"
