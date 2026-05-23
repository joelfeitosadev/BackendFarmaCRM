<a id="português"></a>

[Português](#português) | [English](#english)

## 🇧🇷 Português

# FarmaCRM Backend API

API RESTful para gerenciamento de Pacientes, Controle de Estoque (Fórmulas/Medicamentos) e Atendimentos (Kanban), desenvolvida em **Node.js** com **TypeScript** e **Prisma ORM**.

## 📝 Descrição do Projeto

Este projeto consiste no desenvolvimento de uma **API RESTful** para o gerenciamento de uma farmácia moderna. O desafio foca na implementação de uma arquitetura robusta e escalável utilizando **Node.js, TypeScript e PostgreSQL**, aplicando padrões de design como **Repository e Service Pattern**, além de garantir a integridade dos dados e a qualidade do código através de **testes automatizados (TDD - 100% de Cobertura)**.

### Principais Objetivos:

* **Módulo de Pacientes (BI & CRM):** CRUD completo, proteção de dados (LGPD Consent), cálculo de LTV (Lifetime Value), detecção de clientes inativos (Churn) e alertas de uso contínuo baseados em posologia.
* **Módulo de Produtos (Estoque Inteligente):** Gestão de medicamentos, recálculo automatizado da Curva ABC (financeira), alertas de vencimento (< 60 dias) e necessidade de reposição (Estoque Mínimo).
* **Módulo de Atendimentos (Kanban):** Fluxo de transição de status (`ORCAMENTO` -> `AGUARDANDO_RECEITA` -> `PRONTO_ENTREGA` -> `FINALIZADO`), validação rigorosa de estoque (abatimento automático com rollbacks via `$transaction`) e trava de segurança (`403 Forbidden`) exigindo receita médica criptografada para liberação final.

## 🚀 Tecnologias e Metodologias Utilizadas

O projeto foi construído seguindo as melhores práticas de desenvolvimento, focando em manutenibilidade, tipagem estática e testes rigorosos.

**Tecnologias:**
* **Node.js & Express.js:** Base da aplicação para criação do servidor e gerenciamento de rotas.
* **TypeScript:** Utilizado para tipagem estática, garantindo maior segurança e previsibilidade do código.
* **Prisma ORM:** Escolhido para modelagem do banco de dados relacional (PostgreSQL) e execução das *migrations*.
* **PostgreSQL:** Banco de dados relacional escolhido para persistência dos dados.
* **Docker:** Utilizado para conteinerização do ambiente de desenvolvimento (PostgreSQL via docker-compose), garantindo portabilidade e facilidade de setup.
* **Zod:** Validação robusta de entradas (Schemas) a nível de middleware/controller.
* **Jest & Supertest:** Ferramentas escolhidas para a suíte de testes de integração e unitários, atingindo a marca de **66 testes (100% de cobertura)**.
* **Swagger UI (swagger-ui-express & yamljs):** Para a documentação interativa da API de forma padronizada.

**Metodologias e Padrões:**
* **Clean Code:** Tratamento centralizado de erros globais (Middleware `errorHandler`) instanciando classes customizadas (`ConflictError`, `NotFoundError`, etc).
* **Padrão Repository & Service Pattern:** Responsabilidades totalmente separadas. Os `Controllers` lidam apenas com as requisições HTTP, os `Services` contêm as regras de negócio complexas e os `Repositories` fazem a comunicação direta com o Prisma.
* **Test-Driven Development (TDD):** Criação de mocks de banco de dados (`jest-mock-extended`) para testar o comportamento da aplicação de forma isolada, simulando falhas (500), erros de validação (400), ausências (404) e conflitos (409).
* **Conventional Commits:** Padrão estrito adotado no versionamento do projeto (`feat:`, `chore:`, `style:`, etc).

---

## 📋 Pré-requisitos

Para rodar este projeto localmente, você precisará ter:

* **Node.js:** (Recomendado v18 ou superior).
  * 🔗 [Guia oficial de instalação do Node.js](https://nodejs.org/en/download/package-manager)
* **PostgreSQL:** Banco de dados rodando localmente ou via Docker.
* **Git:** Para clonar o repositório.

---

## 🔧 Como Executar a Aplicação

### Via Docker (Recomendado)
Para uma experiência idêntica ao ambiente de produção:

1.  **Clone o repositório:**
    ```bash
    git clone <url-do-repositorio>
    cd FarmaCRM/BackendFarmaCRM
    ```

2.  **Suba o ambiente (Banco + API):**
    ```bash
    docker-compose up --build -d
    ```
    O Docker fará o build da aplicação em *multi-stage*, criará as tabelas do banco automaticamente (`prisma db push`) e deixará a API rodando na porta `3000`.

### Localmente (Para Desenvolvimento)

1.  **Instale as dependências:**
    ```bash
    npm install
    ```

2.  **Suba apenas o banco de dados via Docker:**
    ```bash
    docker-compose up db -d
    ```

3.  **Configuração de Ambiente:**
    Crie um arquivo `.env` na raiz e aponte para o banco local:
    ```env
    DATABASE_URL="postgresql://postgres:password@localhost:5432/farmacrm?schema=public"
    ```

4.  **Sincronize o Prisma (Geração e Push):**
    ```bash
    npx prisma db push --accept-data-loss
    npx prisma generate
    ```

5.  **Inicie o servidor (Modo Dev):**
    ```bash
    npm run dev
    ```

---

## 🧪 Como Rodar os Testes

A suíte de testes foi projetada usando o Prisma Mock, o que significa que ela não exige um banco de dados real rodando para validar as regras de negócio. 

Para rodar todos os 66 testes integrados:
```bash
npm test
```
*Isto validará todos os status HTTP esperados (200, 201, 400, 403, 404, 409, 500).*

---

## 📚 Documentação da API (Swagger)

A aplicação possui uma documentação interativa oficial utilizando o Swagger UI.

Com o servidor rodando localmente (`npm run dev`), acesse no seu navegador:

👉 **`http://localhost:3000/api-docs`**

### Resumo dos Endpoints

* **Patients (Pacientes & CRM)**

| Action | Endpoint | HTTP Method |
| :--- | :--- | :--- |
| Criar paciente | `/patients` | POST |
| Listar todos | `/patients` | GET |
| Buscar por ID | `/patients/:id` | GET |
| Atualizar paciente | `/patients/:id` | PATCH |
| Pacientes Inativos (Churn) | `/patients/churn` | GET |
| Alertas de Uso Contínuo | `/patients/continuous-use` | GET |
| Calcular Lifetime Value (LTV) | `/patients/:id/ltv` | GET |
| Atualizar Consentimento LGPD | `/patients/:id/consent` | PUT |

* **Products (Estoque & Finanças)**

| Action | Endpoint | HTTP Method |
| :--- | :--- | :--- |
| Criar produto | `/products` | POST |
| Listar produtos | `/products` | GET |
| Buscar por ID | `/products/:id` | GET |
| Atualizar produto | `/products/:id` | PATCH |
| Processar Curva ABC | `/products/process-abc` | POST |
| Alertas de Vencimento (< 60d) | `/products/expiration-alerts` | GET |
| Sugestão de Reposição | `/products/restock` | GET |

* **Orders (Atendimento & Kanban)**

| Action | Endpoint | HTTP Method |
| :--- | :--- | :--- |
| Iniciar novo atendimento | `/orders` | POST |
| Buscar atendimento por ID | `/orders/:id` | GET |
| Mover Card no Kanban | `/orders/:id/move` | PUT |
| Anexar Receita Médica | `/orders/:id/prescription` | POST |

*(Para detalhes exatos de Payload e Responses, verifique o `/api-docs` no navegador).*

---

[Português](#português) | [English](#english)
<a id="english"></a>

## 🇺🇸 English

# FarmaCRM Backend API

RESTful API for Patient Management, Inventory Control (Formulas/Medicines), and Service Desk (Kanban), developed in **Node.js** with **TypeScript** and **Prisma ORM**.

## 📝 Project Description

This project consists of the development of a **RESTful API** to manage a modern pharmacy. The challenge focuses on implementing a robust and scalable architecture using **Node.js, TypeScript, and PostgreSQL**, applying design patterns such as **Repository and Service Pattern**, while ensuring data integrity and code quality through **automated tests (TDD - 100% Coverage)**.

### Main Objectives:

* **Patients Module (BI & CRM):** Full CRUD, data protection (LGPD Consent), Lifetime Value (LTV) calculation, churn detection, and continuous-use alerts based on posology.
* **Products Module (Smart Inventory):** Medicine management, automated ABC Curve recalculation (financial performance), expiration alerts (< 60 days), and restock needs (Minimum Stock).
* **Services Module (Kanban):** Status transition flow (`ORCAMENTO` -> `AGUARDANDO_RECEITA` -> `PRONTO_ENTREGA` -> `FINALIZADO`), strict inventory validation (automatic deduction with `$transaction` rollbacks), and safety locks (`403 Forbidden`) requiring an encrypted medical prescription for final release.

## 🚀 Technologies and Methodologies

The project was built following development best practices, focusing on maintainability, static typing, and rigorous testing.

**Technologies:**
* **Node.js & Express.js:** Application base for server creation and route management.
* **TypeScript:** Used for static typing, ensuring greater security and code predictability.
* **Prisma ORM:** Chosen for relational database modeling (PostgreSQL) and migration execution.
* **PostgreSQL:** Relational database chosen for data persistence.
* **Docker:** Used for containerizing the development environment (PostgreSQL via docker-compose), ensuring portability and easy setup.
* **Zod:** Robust input validation (Schemas) at the middleware/controller level.
* **Jest & Supertest:** Tools chosen for the integration and unit testing suite, reaching the mark of **66 tests (100% coverage)**.
* **Swagger UI (swagger-ui-express & yamljs):** For standardized automated interactive API documentation.

**Methodologies and Patterns:**
* **Clean Code:** Centralized global error handling (Middleware `errorHandler`) throwing custom classes (`ConflictError`, `NotFoundError`, etc).
* **Repository & Service Pattern:** Completely separated responsibilities. `Controllers` handle only HTTP requests, `Services` contain complex business rules, and `Repositories` handle direct communication with Prisma.
* **Test-Driven Development (TDD):** Creation of database mocks (`jest-mock-extended`) to test application behavior in isolation, simulating failures (500), validation errors (400), not found (404), and conflicts (409).
* **Conventional Commits:** Strict standard adopted for project versioning (`feat:`, `chore:`, `style:`, etc).

---

## 📋 Prerequisites

To run this project locally, you will need:

* **Node.js:** (v18 or higher recommended).
  * 🔗 [Official Node.js Installation Guide](https://nodejs.org/en/download/package-manager)
* **PostgreSQL:** Database running locally or via Docker.
* **Git:** To clone the repository.

---

## 🔧 How to Run

### Via Docker (Recommended)
For an experience identical to the production environment:

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd FarmaCRM/BackendFarmaCRM
    ```

2.  **Start the environment (Database + API):**
    ```bash
    docker-compose up --build -d
    ```
    Docker will multi-stage build the application, automatically create the database tables (`prisma db push`), and leave the API running on port `3000`.

### Locally (For Development)

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start only the database via Docker:**
    ```bash
    docker-compose up db -d
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root directory and point to your local database:
    ```env
    DATABASE_URL="postgresql://postgres:password@localhost:5432/farmacrm?schema=public"
    ```

4.  **Synchronize Prisma (Generate and Push):**
    ```bash
    npx prisma db push --accept-data-loss
    npx prisma generate
    ```

5.  **Start the server (Dev Mode):**
    ```bash
    npm run dev
    ```

---

## 🧪 How to Execute Tests

The test suite was designed using the Prisma Mock, meaning it does not require a real database running to validate the business rules.

To run all 66 integrated tests:
```bash
npm test
```
*This will validate all expected HTTP statuses (200, 201, 400, 403, 404, 409, 500).*

---

## 📚 API Documentation (Swagger)

The application features official interactive documentation using Swagger UI.

With the server running locally (`npm run dev`), access it in your browser:

👉 **`http://localhost:3000/api-docs`**

### Endpoints Summary

* **Patients (CRM)**

| Action | Endpoint | HTTP Method |
| :--- | :--- | :--- |
| Create patient | `/patients` | POST |
| List all | `/patients` | GET |
| Get by ID | `/patients/:id` | GET |
| Update patient | `/patients/:id` | PATCH |
| Inactive Patients (Churn) | `/patients/churn` | GET |
| Continuous Use Alerts | `/patients/continuous-use` | GET |
| Calc Lifetime Value (LTV) | `/patients/:id/ltv` | GET |
| Update LGPD Consent | `/patients/:id/consent` | PUT |

* **Products (Inventory & Finance)**

| Action | Endpoint | HTTP Method |
| :--- | :--- | :--- |
| Create product | `/products` | POST |
| List products | `/products` | GET |
| Get by ID | `/products/:id` | GET |
| Update product | `/products/:id` | PATCH |
| Process ABC Curve | `/products/process-abc` | POST |
| Expiration Alerts (< 60d) | `/products/expiration-alerts` | GET |
| Restock Suggestions | `/products/restock` | GET |

* **Orders (Desk & Kanban)**

| Action | Endpoint | HTTP Method |
| :--- | :--- | :--- |
| Start new order | `/orders` | POST |
| Get order by ID | `/orders/:id` | GET |
| Move Card on Kanban | `/orders/:id/move` | PUT |
| Attach Prescription | `/orders/:id/prescription` | POST |

*(For exact Payload and Response details, please check `/api-docs` in the browser).*

---

**Desenvolvido por Joel Feitosa da Silva.**
