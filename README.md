# ShopWise 🚀
**Cloud-Native Event-Driven Microservices Platform**

## 🎯 Executive Summary

ShopWise is a high-performance, distributed E-commerce platform designed to handle complex business transactions at scale. Unlike traditional monolithic applications, ShopWise utilizes a **Microservices Architecture** to decouple business logic, ensuring **high availability** and **fault tolerance**.

The system features an **Event-Driven design** using **Apache Kafka**, allowing critical processes (like order placement and notifications) to run asynchronously without blocking the user experience. It secures user data using industry-standard **OAuth2/OpenID Connect** via **Keycloak** and employs a **Polyglot Persistence** strategy (using the best database for the specific job: **MySQL**, **PostgreSQL**, and **MongoDB**).

## 🏗️ High-Level Architecture Diagram

This is the visual representation of what you have built.

**Entry Point**: All traffic flows through the **API Gateway**, which acts as the single entry point and security guard.

**Service Discovery**: Services find each other dynamically using **Netflix Eureka** (Discovery Server).

**Asynchronous Layer**: The **Order Service** talks to the **Notification Service** via **Kafka** (not direct HTTP), ensuring that if the notification system fails, the order is still processed.

## 🛠️ Technology Stack

| Layer | Technology Used | Role/Purpose |
|-------|-----------------|--------------|
| **Frontend** | React.js | Responsive, dynamic user interface for customers. |
| **Backend Core** | Java 21 + Spring Boot 3 | The framework for building robust, scalable microservices. |
| **Orchestration** | Docker & Docker Compose | Containerizing all services and databases for consistent deployment. |
| **Messaging** | Apache Kafka | Handles high-throughput, asynchronous events (Order Placed). |
| **Security** | Keycloak (OAuth2 / OIDC) | Centralized Identity Management (SSO, Token validation). |
| **Gateway** | Spring Cloud Gateway | Routing, Load Balancing, and Centralized Authentication. |
| **Discovery** | Netflix Eureka | Service Registry (Dynamic IP management). |
| **Databases** | MySQL, MongoDB, PostgreSQL | Polyglot storage (Relational vs. Document data). |

## 🏢 Microservices Breakdown

Here is the role of each independent service you created:

| Service | Database | Logic |
|---------|----------|-------|
| **API Gateway** | - | The "Front Door." Routes requests (e.g., `/api/order`) to correct internal service. Verifies JWT Tokens from Keycloak. |
| **Product Service** | MongoDB (NoSQL) | Manages product catalog. Uses MongoDB because product attributes (colors, sizes, specs) vary and fit document structure better than SQL tables. |
| **Order Service** | MySQL (Relational) | Handles transactional buying process. Kafka Producer that emits `OrderPlacedEvent`. |
| **Inventory Service** | MySQL | Checks stock levels. Ensures you can't sell what you don't have. |
| **Notification Service** | - | Listens to Kafka topics. Sends alerts (email/log) on order placement. Contains "Poison Pill" error handling. |
| **Identity Service (Keycloak)** | PostgreSQL | Handles Users, Roles, and Login pages. Decouples security from business code. |

## ⭐ Key Engineering Features (The "Senior" Traits)

These are the specific points that make your project impressive to recruiters:

- **Polyglot Persistence**: Didn't just use one database. Demonstrated architectural maturity by using **MongoDB** for flexible product data and **MySQL** for ACID-compliant transactional data.
- **Event-Driven Architecture**: Solved the "Blocking" problem. Using **Kafka**, system is **Fault Tolerant**. If Notification Service crashes, Order Service keeps working—notifications queued for later.
- **Centralized Security**: Avoided "Security Risk" of writing own login code. Implemented production-grade **Identity Provider (Keycloak)**.
- **Inter-Service Communication**: Utilized **Spring Cloud OpenFeign** (synchronous calls) and **Kafka** (asynchronous calls), showing pattern mastery.

## 🔄 How the "Order Flow" Works (The Story)

When an interviewer asks "How does it work?", tell them this story:

1. **User Login**: User clicks "Login" on **React**. Redirected to **Keycloak** login page. Success → gets **JWT Access Token**.
2. **Request**: React app sends "Place Order" request + Token to **API Gateway**.
3. **Routing**: Gateway validates token → routes to **Order Service**.
4. **Transaction**: Order Service saves order to **MySQL** as "PENDING".
5. **The Event**: Order Service fires **`OrderPlacedEvent`** to **Kafka** (no blocking!).
6. **Async Processing** (Parallel):
   - **Inventory Service** hears event → deducts stock
   - **Notification Service** hears event → prepares email
   
**Result**: Instant, fault-tolerant, scalable order processing.
## 📊 Project Status & Value

**Current State**: Fully functional hybrid deployment. 
- Infrastructure (**Kafka**, **Databases**, **Keycloak**) runs on **Docker Compose**
- Microservices run locally for rapid development
- **Kubernetes manifests** ready for production scaling

**Developer Level**: Demonstrates skills well beyond typical university student:
- DevOps
- Cloud-Native Architecture
- Distributed Systems design


