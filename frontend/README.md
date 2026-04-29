# EcoWinds Frontend

Aplicação Angular standalone para administrar salas, microcontroladores ESP, agendamentos e logs do backend EcoWinds.

## Stack

- Angular 19
- TypeScript strict
- Reactive Forms
- HttpClient com interceptors JWT e tratamento global de erros
- PrimeIcons para iconografia

## Configuração

A URL da API fica em `src/environments/environment.ts`.

```ts
apiBaseUrl: 'http://localhost:8080'
```

O backend atual expõe:

- `POST /auth/login`
- `POST /auth/register`
- `GET /room/search`, `POST /room`, `PUT /room/{id}`, `DELETE /room/{id}`
- `GET /esp-device/search`, `POST /esp-device`, `PUT /esp-device/{id}`, `DELETE /esp-device/{id}`
- `GET /class-schedule/search`, `POST /class-schedule`, `PUT /class-schedule/{id}`, `DELETE /class-schedule/{id}`
- `GET /audit-log/search`, `POST /audit-log`, `PUT /audit-log/{id}`, `DELETE /audit-log/{id}`

## Execução

Requisito de ambiente: Node.js `18.19+`, compatível com Angular CLI 19.

```bash
npm install
npm start
```

Acesse `http://localhost:4200`.

## Build

```bash
npm run build
```

## Arquitetura

- `core`: autenticação, guards, interceptors, storage e modelos globais.
- `services`: integração HTTP por recurso.
- `models`: interfaces TypeScript das entidades do backend.
- `layouts`: layout interno com sidebar e topbar.
- `pages`: login, dashboard e CRUDs.
- `shared`: tabela, modal de formulário, confirmação, toast e cards reutilizáveis.

O token JWT é mantido em `sessionStorage` e enviado via interceptor para chamadas protegidas.
