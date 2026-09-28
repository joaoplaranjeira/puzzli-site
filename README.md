# puzzli-site

Site da Puzzli para apresentação dos serviços e pedidos de reserva. A aplicação foi migrada para React e gera um site estático pronto para publicação no Render.

## Desenvolvimento local

Requer Node.js 20.19 ou superior.

```bash
npm install
cp .env.example .env
npm run dev
```

Antes de iniciar, defina `VITE_MANAGEMENT_API_URL` no ficheiro `.env` com o endereço base da API de gestão. No Render, configure a mesma variável de ambiente no serviço estático; o valor é incorporado durante o build.

### Desenvolvimento com Docker

Com a API de gestão disponível em `http://localhost:5005`, execute:

```bash
docker compose up --build
```

O site fica disponível em `http://localhost:5174`. O código local é montado no container e as alterações são atualizadas automaticamente. Os pedidos `/api` são encaminhados internamente para a API em `localhost:5005`, sem configuração CORS adicional. Para parar:

```bash
docker compose down
```

## Página pública do motorista

A página está disponível em `/{publicSlug}` e também em `/motoristas/{publicSlug}`. Obtém o perfil, os parceiros e as promoções através dos endpoints públicos da API de gestão. Por exemplo:

```text
http://localhost:5174/joaosantos
```

O `render.yaml` inclui o rewrite necessário para abrir diretamente qualquer rota de motorista.

## Build de produção

```bash
npm run build
npm run preview
```

O build estático é criado em `dist/`.

## Publicação no Render

O ficheiro `render.yaml` contém a configuração do serviço estático:

- nome: `puzzli-site`
- build: `npm ci && npm run build`
- diretório publicado: `dist`

No Render, pode ser usado **New > Blueprint** e selecionado este repositório. Em alternativa, ao criar manualmente um **Static Site**, use os mesmos comandos acima.

## Tecnologias

- React
- Vite
- CSS
- OpenStreetMap/Nominatim para sugestões de moradas

O fluxo de reserva continua a usar a API OTP já configurada e guarda reservas confirmadas no `localStorage` do browser.
