
# 💳 Payflow: A Modern & Secure Payments Platform

Payflow is a full-stack payment application engineered for security, high performance, and a seamless user experience. It features a robust, multi-provider authentication system and a scalable, cloud-native architecture ready for production workloads.

This repository contains the complete monorepo, including a production-ready Kubernetes deployment configuration.



## ✨ Core Features

*   **✅ Secure Multi-Provider Authentication:**
    *   **Credentials-Based Login:** Traditional email and password sign-up/login.
    *   **Social Logins:** Seamless authentication via Google and GitHub using Next-Auth.
*   **🤖 Human Verification:** Integrated with **Cloudflare Turnstile** to transparently prevent bot abuse.
*   **💎 Intuitive UI:** A clean and responsive user interface built with **Shadcn UI** and **Tailwind CSS**, enhanced with fluid animations from **Framer Motion**.
*   **☁️ Cloud-Native Ready:** Comes with a complete **Kubernetes & Helm** configuration for deploying the application and a full monitoring stack (**Prometheus & Grafana**) in a production-like environment.
*   **⚡ High-Performance Architecture:**
    *   Built on a **Turborepo** monorepo for high-performance build caching.
    *   Leverages a serverless-ready **Neon DB** (PostgreSQL) that scales on demand.
    *   API rate limiting with **Upstash Redis** to prevent brute-force attacks.
*   **🔒 Comprehensive Security:**
    *   **Bcrypt** for password hashing.
    *   **Zod** for rigorous, schema-based API input validation.
    *   Enterprise-grade DDoS protection via Vercel.
*   **🧪 Fully Tested:**
    *   **100% code coverage** on backend unit tests with **Vitest**.
    *   End-to-end user flow validation with **Cypress**.



## 🛠️ Tech Stack

| Category                  | Technologies                                                                                                                                                                                                                                                                            |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Monorepo & Build**      | `Turborepo`, `pnpm`                                                                                                                                                                                                                                                                     |
| **Framework**             | `Next.js 15` (App Router)                                                                                                                                                                                                                                                               |
| **UI & Styling**          | `React`, `TypeScript`, `Shadcn UI`, `Tailwind CSS`, `Framer Motion`                                                                                                                                                                                                                     |
| **Backend & API**         | `Next-Auth v5`, `Zod` (Validation), `Bcrypt` (Hashing)                                                                                                                                                                                                                                  |
| **Database**              | `PostgreSQL` (Neon DB), `Prisma` (ORM)                                                                                                                                                                                                                                                  |
| **In-Memory Store**       | `Redis` (Upstash) for Rate Limiting                                                                                                                                                                                                                                                     |
| **Testing**               | `Vitest` (Unit), `Cypress` (E2E)                                                                                                                                                                                                                                                        |
| **Containerization**      | `Docker`, `Docker Compose`                                                                                                                                                                                                                                                              |
| **Orchestration & DevOps**| `Kubernetes`, `Helm`, `Prometheus`, `Grafana`, `GitHub Actions`                                                                                                                                                                                                                           |



## 🚀 Getting Started (Local Development with Docker)

This is the quickest way to get Payflow running on your local machine.

### Prerequisites

*   Git
*   Node.js (v20+) & pnpm
*   Docker & Docker Compose

### 1. Clone the Repository

```sh
git clone https://github.com/kunalPisolkar24/payFlow.git
cd payFlow
```

### 2. Set Up Environment Variables

Copy the example environment file and fill in your credentials.

```sh
cp apps/web/.env.example apps/web/.env
```

Your `apps/web/.env` file should look like this:

```.env
DATABASE_URL="YOUR_NEON_DB_CONNECTION_STRING"

GOOGLE_CLIENT_ID="YOUR_GOOGLE_CLIENT_ID"
GOOGLE_CLIENT_SECRET="YOUR_GOOGLE_CLIENT_SECRET"
NEXTAUTH_SECRET="my_secret_password" # Change this to a long, random string
NEXTAUTH_URL="http://localhost:3000"

UPSTASH_REDIS_REST_URL="YOUR_UPSTASH_REDIS_URL"
UPSTASH_REDIS_REST_TOKEN="YOUR_UPSTASH_REDIS_TOKEN"

TURNSTILE_SECRET_KEY="YOUR_CLOUDFLARE_TURNSTILE_SECRET"
NEXT_PUBLIC_TURNSTILE_SITE_KEY="YOUR_CLOUDFLARE_TURNSTILE_SITE_KEY"
```

### 3. Run the Application

This single command will build the Docker image, run the database migration, and start the development server.

```sh
docker-compose up --build
```

The application will be available at **`http://localhost:3000`**.

---

## 🚢 Cloud-Native Deployment (Kubernetes & Kind)

This setup simulates a real-world production environment on your local machine using Kubernetes. It deploys the application along with a full Prometheus & Grafana monitoring stack.

### Prerequisites

*   All prerequisites from the Docker setup.
*   [Kind](https://kind.sigs.k8s.io/docs/user/quick-start/)
*   [Kubectl](https://kubernetes.io/docs/tasks/tools/)
*   [Helm](https://helm.sh/docs/intro/install/)

### 1. Create the Local Kubernetes Cluster

This command creates a `kind` cluster with ports `80` and `443` exposed to your local machine, which is necessary for the Ingress controller to work.

```sh
./setup-cluster
```

### 2. Build & Push the Docker Image

The `build-and-push.sh` script builds a production-optimized image and pushes it to the local registry used by `kind`.

```sh
./build-and-push.sh
```

### 3. Deploy with Helm

The Payflow Helm chart depends on the kube-prometheus-stack chart. Navigate to the chart directory and run this command to download the dependency.

```sh
cd payflow-chart
helm dependency update
cd ..
```

This command deploys the entire `staging` environment, including the Payflow application, Prometheus, and Grafana, using the Helm chart located in `/payflow-chart`.

```sh
helm upgrade --install payflow-staging ./payflow-chart \
  --namespace staging \
  --create-namespace \
  -f ./payflow-chart/values.staging.yaml 
```

The Helm chart will first run a database migration `Job` and then deploy the application.

### 4. Accessing Services



*   **Payflow Application:** 
Access the application via port-forwarding
    ```sh
    kubectl port-forward --namespace staging svc/payflow-staging-payflow-chart 3000:3000
    ```
    Available at **`http://localhost:3000`**.
*   **Grafana Dashboard:**
    1.  Get the admin password: `kubectl get secret --namespace staging payflow-staging-grafana -o jsonpath="{.data.admin-password}" | base64 --decode ; echo`
    2.  Access the dashboard via port-forwarding: `kubectl port-forward --namespace staging svc/payflow-staging-grafana 8080:80`
    3.  Navigate to **`http://localhost:8080`** (username: `admin` and password: [What you get command]).



## 🧪 Testing

To run the full suite of tests locally:

*   **Tests (Vitest):**
    ```sh
    pnpm --filter web test
    ```
*   **End-to-End Tests (Cypress):**
    ```sh
    pnpm --filter web test:e2e
    ```



## 🤝 Contributing

Contributions are welcome! This project follows the standard Fork & Pull Request workflow.

Please see [`CONTRIBUTING.md`](CONTRIBUTING.md) for more details on our code standards and guidelines.



## 📜 License

This project is licensed under the MIT License. See the [`LICENSE.md`](LICENSE.md) file for details.
