# PHP / Laravel

### Criando uma aplicação Laravel

```sh
$ azk shell --image azukiapp/php-fpm --shell /bin/bash
# composer create-project laravel/laravel <my-app> --prefer-dist
# exit
```

> Nota: Se você estiver usando Linux, você terá que transferir a propriedade da pasta gerada para seu usuário. Isso acontece pois o container é executado como usuário root, portanto todos os arquivos e pastas gerados dentro do container pertencem ao usuário root. Para fazer esta correção, basta executar:

```sh
$ sudo chown -R `id -un`:`id -gn` <my-app>
```


### Gerando o Azkfile.js

```sh
$ cd my-app
$ azk init
```

### Rodando a aplicação

Para iniciar o ambiente de desenvolvimento

```sh
$ azk start -o && azk logs --follow
```

### Exemplos

#### PHP com Laravel

!INCLUDE "../../common/azkfilejs/php-laravel.md"
