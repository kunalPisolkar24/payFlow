# 🤝 Contributing to Payflow

First off, thank you for considering contributing to Payflow! We welcome any contributions, from reporting a bug to submitting a feature request or writing code. Every contribution helps make Payflow better.

This document provides a set of guidelines to help you contribute effectively.

## Code of Conduct

This project and everyone participating in it is governed by the [Payflow Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior.

## How Can I Contribute?

*   **🐛 Reporting Bugs:** If you find a bug, please open an issue and provide as much detail as possible, including steps to reproduce it.
*   **✨ Suggesting Enhancements:** If you have an idea for a new feature or an improvement to an existing one, open an issue to start a discussion.
*   **📝 Documentation:** Improvements to the README or other documentation are always welcome.
*   **💻 Pull Requests:** If you're ready to contribute code, we'd be thrilled to review your pull request.

## 🚀 Development Setup

The easiest way to get started with the code is by using our Docker Compose setup, which mirrors the local development environment.

### Prerequisites

*   Git
*   Node.js (v20+) & pnpm
*   Docker & Docker Compose

### Steps

1.  **Fork the Repository:**
    Start by forking the [main Payflow repository](https://github.com/kunalPisolkar24/payFlow.git) to your own GitHub account.

2.  **Clone Your Fork:**
    Clone your forked repository to your local machine.
    ```sh
    git clone https://github.com/YOUR_USERNAME/payFlow.git
    cd payFlow
    ```

3.  **Set Up Environment Variables:**
    Payflow requires several environment variables to run. Copy the example file and fill it out with your own keys.
    ```sh
    cp apps/web/.env.example apps/web/.env
    ```
    You will need to populate `apps/web/.env` with your credentials for Neon, Google, Upstash, etc.

4.  **Run the Docker Environment:**
    This command will build the necessary containers and start the application.
    ```sh
    docker-compose up --build
    ```
    The application will be running at `http://localhost:3000`.

##  submitting a Pull Request (PR)

When you're ready to submit your code, please follow these steps.

### 1. Create a Branch

Create a new branch from `main` with a descriptive name.

```sh
git checkout -b feature/my-awesome-feature
# or for bug fixes:
git checkout -b fix/login-page-bug
```

### 2. Make Your Changes

Write your code, keeping our style guidelines in mind. Ensure your code is well-commented where necessary.

### 3. Run Tests

**This is a critical step.** All contributions must pass the existing tests, and new features should ideally include new tests.

*   **Run Unit & Integration Tests:**
    ```sh
    pnpm --filter web test
    ```
*   **Run End-to-End Tests:**
    ```sh
    pnpm --filter web test:e2e
    ```

Make sure all tests pass before submitting your PR.

### 4. Create the Pull Request

Push your branch to your fork and open a Pull Request against the `main` branch of the original Payflow repository.

*   **Provide a clear title** for your PR (e.g., `feat: Add PayPal payment provider` or `fix: Correct validation on signup form`).
*   **Write a detailed description.** Explain *what* you changed, *why* you changed it, and *how* it works.
*   **Link to any relevant issues** by including `Closes #123` in the description.
*   **Include screenshots or GIFs** if your changes affect the UI.

### 5. Code Review

Once your PR is submitted, a project maintainer will review it. We may ask for changes or improvements. We aim to be responsive and helpful during the review process!

## 🎨 Coding & Style Guidelines

*   **TypeScript:** The project is written in TypeScript. Please use strong types and avoid using `any` where possible.
*   **Prettier:** We use Prettier for automatic code formatting. Please run it before committing your changes.
    ```sh
    pnpm format
    ```
*   **ESLint:** Our linter will catch common issues. Please ensure your code has no linting errors.
*   **Commit Messages:** Please write clear and concise commit messages. We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

Thank you again for your interest in contributing to Payflow!
