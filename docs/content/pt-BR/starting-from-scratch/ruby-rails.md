# Ruby on Rails

### Criando uma aplicação Rails

```sh
$ azk shell --image azukiapp/ruby --shell /bin/bash
# gem install rails --no-rdoc --no-ri
# rails new <my-app>
# exit
```

> Nota: Se você estiver usando Linux, você terá que transferir a propriedade da pasta gerada para seu usuário. Isso acontece pois o container é executado como usuário root, portanto todos os arquivos e pastas gerados dentro do container pertencem ao usuário root. Para fazer esta correção, basta executar:

```sh
$ sudo chown -R `id -un`:`id -gn` <my-app>
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

Para rodar os testes

```sh
$ azk start test
$ azk shell test -- bundle exec rake test
```

Lembrando que se o seu ambiente de testes exigir dependência do OS como Webkit e QT4, você precisa mudar a imagem do Docker

### Examplos

#### Ruby on Rails com MySQL

!INCLUDE "../../common/azkfilejs/ruby-rails.md"
