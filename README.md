# HOPE, Inc. — Enterprise Resource Planning System

**An Integrated Management System for Modern Business Operations**

HOPE, Inc. is a web-based Enterprise Resource Planning (ERP) system designed to bring essential business operations into one centralized platform. It aims to simplify management processes, organize business information, and provide a more efficient way to manage company operations.

---

## Project Overview

The HOPE, Inc. ERP System brings together four major business management modules in one application:

- **Product Management** — Manage product-related information and inventory.
- **Human Resource Management** — Organize employee-related information.
- **Customer Management** — Manage and organize customer records.
- **Sales Management** — Support sales operations and transaction management.

The system uses a centralized database and authentication to support organized and secure access to the application.

## Key Features

- User authentication and account registration
- Login and logout functionality
- Password reset functionality
- Session management
- Role-based access checks
- Centralized business management modules
- Database security through Row Level Security (RLS)

## System Modules

### 1. Product Management
A module dedicated to managing product information and related inventory data.

### 2. Human Resource Management
A module for organizing and managing employee information.

### 3. Customer Management
A module for maintaining and organizing customer records.

### 4. Sales Management
A module for supporting sales-related operations and transaction records.

## Technologies Used

| Technology | Purpose |
|---|---|
| Next.js | Application framework |
| React | User interface |
| TypeScript | Application development |
| Tailwind CSS | Interface styling |
| Supabase | Authentication and database |
| PostgreSQL | Relational database |
| GitHub | Version control and collaboration |

## Application Architecture

The application is built using the Next.js App Router. Its modules share responsive navigation and Supabase authentication, with server-side role checks and database Row Level Security policies.

## Installation and Setup

### Prerequisites
- Node.js and npm
- Git
- A Supabase project

### 1. Clone the Repository

```bash
git clone https://github.com/Arvhel/GPT_Team.git
```

### 2. Navigate to the Project Folder

```bash
cd GPT_Team
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Copy `.env.example` to `.env.local` and provide your Supabase project URL and anonymous key.

### 5. Run the Application

```bash
npm run dev
```

Open the local URL provided by Next.js in your browser.

## Database Setup

Apply the existing base module schemas in their dependency order, followed by the available migrations:

- `supabase/migration/customer_management.sql`
- `supabase/migration/hrm_employee_directory.sql`
- `supabase/migration/sales_management.sql`
- `supabase/migration/product_management_integration.sql`

Make sure the required Supabase tables and Row Level Security policies are configured.

## Validation

Run the following commands to check the project:

```bash
npm run typecheck
npm run build
```

## Development and Collaboration

This project is developed collaboratively using GitHub.

The team follows a structured workflow involving:
- Sprint planning and task assignment
- Feature branches for development
- Pull Requests for code review
- Testing and validation
- Integration into the main branch

## Project Repository

[HOPE, Inc. — GitHub Repository](https://github.com/Arvhel/GPT_Team)

---

*HOPE, Inc. — Bringing business operations together in one platform.*
