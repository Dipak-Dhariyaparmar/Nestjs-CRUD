# 🚀 NestJS-CRUD API

A simple, modular, and production-ready CRUD REST API built with [NestJS](https://nestjs.com/). This project demonstrates how to structure a backend API using best practices, including DTOs, validation, error handling, and modular design.

---

## 📌 Features

- ✅ RESTful CRUD operations (Create, Read, Update, Delete)
- 📦 Modular folder structure (Controllers, Services, DTOs, Modules)
- 🔐 Data validation using `class-validator` and `Pipes`
- 💾 Configurable with `.env` file
- ⚙️ Easy-to-extend architecture
- 📡 Ready to connect with databases (e.g. PostgreSQL, MongoDB)

---

## 🛠️ Tech Stack

- **Framework**: NestJS (TypeScript)
- **Validation**: class-validator, class-transformer
- **Configuration**: @nestjs/config
- **HTTP Server**: Express (default, can be switched to Fastify)
- **Database (Optional)**: TypeORM / Prisma / Mongoose (choose your ORM)

---

## 📁 Project Structure
src/
├── app.module.ts
├── main.ts
├── user/
│ ├── user.controller.ts
│ ├── user.service.ts
│ ├── user.module.ts
│ ├── dto/
│ │ ├── create-user.dto.ts
│ │ └── update-user.dto.ts
│ └── entities/
│ └── user.entity.ts

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/Dipak-Dhariyaparmar/Nestjs-CRUD.git
cd Nestjs-CRUD

npm install

# .env
PORT=3000

# Development
npm run start:dev

# Production build
npm run build
npm run start:prod


