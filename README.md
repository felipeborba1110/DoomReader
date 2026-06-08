# DoomReader

## Sobre o Projeto

O DoomReader é uma aplicação web desenvolvida para proporcionar uma experiência de leitura contínua de mangás, manhwas e webtoons sem a necessidade de trocar constantemente de página.

Diferentemente dos leitores convencionais, onde cada capítulo exige um novo carregamento da página, o DoomReader utiliza carregamento dinâmico para buscar e renderizar os próximos capítulos automaticamente conforme o usuário avança na leitura.

O objetivo principal é criar uma experiência imersiva, eliminando interrupções e permitindo que o leitor permaneça focado exclusivamente no conteúdo.

### Principais Características

- Leitura contínua entre capítulos.
- Carregamento automático de novos capítulos.
- Interface simples e minimalista.
- Redução de interrupções causadas por navegações entre páginas.
- Persistência da posição de leitura.
- Controle de memória através da remoção de páginas antigas do DOM.

---

# Demonstração de Funcionamento

1. O usuário informa a URL do capítulo inicial.
2. O backend realiza a extração das imagens da página.
3. As páginas são enviadas ao frontend em formato JSON.
4. O frontend renderiza as imagens dinamicamente.
5. Ao atingir o final do capítulo, um `IntersectionObserver` detecta a aproximação do usuário ao fim do conteúdo.
6. O próximo capítulo é buscado automaticamente.
7. O novo conteúdo é adicionado ao fluxo de leitura sem recarregar a página.

---

# Tecnologias Utilizadas

## Frontend

- HTML5
- CSS3
- JavaScript (Vanilla JS)
- IntersectionObserver API

## Backend

- Node.js
- Express.js
- Axios
- Cheerio

---

# Possíveis Melhorias Futuras

- Sistema de favoritos.
- Histórico de leitura.
- Busca integrada de obras.
- Suporte a múltiplas fontes.
- Cache local dos capítulos.
- Sincronização em nuvem.
- Modo offline.
- Sistema de bookmarks.
- Virtualização de páginas para obras muito extensas.
- Suporte para múltiplos idiomas.

---
