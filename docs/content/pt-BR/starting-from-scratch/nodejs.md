# Node.js

Exemplos de criação de uma aplicação Node.js:

## Utilizando o npm init

### Criando o package.json

```sh
$ mkdir <my-app>
$ cd <my-app>
$ azk shell --image azukiapp/node --shell /bin/bash
# npm init //follow the instructions afterwards
# exit
```

> Nota: Se você estiver usando Linux, você terá que transferir a propriedade da pasta gerada para seu usuário. Isso acontece pois o container é executado como usuário root, portanto todos os arquivos e pastas gerados dentro do container pertencem ao usuário root. Para fazer esta correção, basta executar:

```sh
$ sudo chown -R `id -un`:`id -gn` .
```

### Gerando o Azkfile.js

```sh
$ azk init
```

## Utilizando o módulo express-generator

### Criando o projeto

```sh
$ azk shell --image azukiapp/node --shell /bin/bash
# npm install -g express-generator
# express <my-app>
# exit
```

### Gerando o Azkfile.js

```sh
$ cd <my-app>
$ azk init
```

### Rodando a aplicação

Para iniciar o ambiente de desenvolvimento

```sh
$ azk start -o && azk logs --follow
```

### Exemplos

#### Node com Mongodb

!INCLUDE "../../common/azkfilejs/node-mongodb.md"
