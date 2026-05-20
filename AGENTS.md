# FarmaCRM - Contexto e Regras do Projeto

## 1. Visão Geral
Sistema de gestão para farmácias focado em Inteligência de Negócio (BI) e conformidade com a LGPD (dados sensíveis de saúde). O back-end é uma API RESTful.

## 2. Stack Tecnológica
- **Linguagem:** Node.js (TypeScript)
- **Framework:** Express
- **Base de Dados:** PostgreSQL com Prisma ORM
- **Testes:** Jest + Supertest

## 3. Padrões de Arquitetura e Código
- **Arquitetura em Camadas:** Rotas -> Controladores -> Serviços -> Repositórios.
- **Repositórios:** A única camada que comunica com o Prisma.
- **Serviços:** Onde residem as regras de negócio puras.
- **Tratamento de Erros:** Utilizar classes customizadas (`HttpError`, `NotFoundError`) e um middleware global.
- **Segurança (LGPD):** Nenhum dado médico do paciente pode ser devolvido sem validação de consentimento.

## 4. Hurdles (Obstáculos Comuns e Soluções)
*Nota: Preencha isto à medida que a IA cometer erros repetitivos. Se o Antigravity instalar pacotes errados ou usar funções obsoletas do Prisma, documente aqui.*

## 5. Checklist de Implementação (A IA deve seguir)
1. Escrever o teste (TDD) primeiro.
2. Escrever a lógica para o teste passar.
3. Verificar a segurança e injeção de dependências.
4. Fazer commit da funcionalidade a funcionar.