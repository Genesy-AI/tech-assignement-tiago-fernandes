<p align="center">
  <img src="https://cdn.prod.website-files.com/674ec82ac8f13332ff5201aa/677eaa5351b3ef0c2418820a_favicon%20256x256.png" width="128" height="128" alt="Favicon">
</p>

## Overview

Welcome to the **TinyGenesy** take‑home! This exercise is a condensed version of our product and day‑to‑day work. Please treat the codebase as if it were the one you ship to production.


## What you’ll do (at a glance)

1. Review an open PR that implements a new feature.

2. Investigate & fix a reported CSV import bug (details below).

3. Implement a new feature (details below).

4. Analyze the codebase and propose improvements.


## Getting Started

### Prerequisites

- **Node.js** (use the version in .nvmrc).

- **pnpm** package manager.

- **SQLite** (bundled; no separate install required).

Install tools:

- Node via nvm: https://github.com/nvm-sh/nvm#installing-and-updating

- pnpm: https://pnpm.io/installation#using-other-package-managers

### Environment setup

**Backend (one‑time)**

```zsh
cd backend
nvm use                # Ensure the Node version from .nvmrc
pnpm install           # Install dependencies
pnpm migrate:dev       # Sync local SQLite with Prisma schema
pnpm gen:prisma        # Generate Prisma client
```

**Backend (develop)**

```zsh
cd backend
pnpm run dev           # Starts the API server
```

When you change the Prisma schema:
```zsh
pnpm migrate:dev
```

**Frontend (one‑time)**

```zsh
cd frontend
nvm use                # Ensure the Node version from .nvmrc
pnpm install
```

**Frontend (develop)**

```zsh
cd frontend
pnpm run dev           # Starts the dev server
```

## Task Description

### PR review

Review the open PR as if it were from a teammate. Add any inline comments you find necessary and provide a final summary with either an approval or a change-request decision.

### Bug reported

When importing from CSV, the country column displays strange characters that do not match valid country codes. I have been using the example CSV file.


### New feature

Some users have mentioned they would like to track more data points for their leads.
We are adding the following fields: lead’s phone number, years at their current company, and LinkedIn profile.

We want users to be able to:

 1. See the new field in the table of leads
 2. Manually set those fields using the import from csv feature
 3. Use the new fields in the message composition

Since the list of fields will continue to grow, we need to improve the UX of the message composition (no design provided).

### Codebase Analysis & Roadmap

Create an `IMPROVEMENTS.md` file as if it were a document in our project management tool. The goal is to capture:
- Top priorities identified, with an Impact vs. Effort assessment
- Quick wins (small, high-value changes)
- Larger refactors that require more investment
- Potential bugs and risky areas
- Opportunities for better UX patterns
- Developer experience (DX) improvements such as tooling, tests, and type safety

#### Note on AI use

You’re welcome to use AI-assisted tools if you’d like. We are an AI-native company and incorporate them into our day-to-day work.

You won’t be evaluated on producing a single predefined _correct solution_, but rather on your problem-solving skills, the product mindset you showcase, your ability to reason and explain your thought process, and the trade-offs behind your decisions.


## Submission

Work in the repository as you see fit. When you’re done, just ping us.

We value the time you invest in this task, and we commit to spending a similar amount reviewing it thoroughly. Regardless of the outcome, we’ll provide constructive feedback so you can benefit from the evaluation.

