# 20. Deployment & Environment Setup Guide

This guide provides step-by-step instructions to configure, build, and deploy **XAMS** in both local development and production environments.

---

## 20.1 Local Development Prerequisites
Ensure you have the following installed on your machine:
* **Java Development Kit (JDK)**: JDK 21 (configured in system environment variables).
* **Node.js**: Node.js v18.0.0 or higher (comes with npm).
* **PostgreSQL Database**: PostgreSQL 15 or higher.
* **Redis Caching**: Redis 7.0 or higher.
* **Maven**: Apache Maven 3.9+ (or use the packaged wrapper `./mvnw`).

---

## 20.2 Step-by-Step Installation

### Step 1: Database Initialization
1. Open your PostgreSQL terminal (pgAdmin or `psql` shell) and create a database named `assignment_db`:
   ```sql
   CREATE DATABASE assignment_db;
   ```
2. Update the credentials in `Backend/src/main/resources/application.properties` if your PostgreSQL username/password differ from the defaults:
   ```properties
   spring.datasource.username=postgres
   spring.datasource.password=YourSecretPassword
   ```

### Step 2: Starting Caching & File Systems
1. Start your local Redis server:
   ```bash
   redis-server
   ```
2. Register a free account on [Cloudinary](https://cloudinary.com) and retrieve your **Cloud Name**, **API Key**, and **API Secret**.
3. Update the credentials in `application.properties`:
   ```properties
   app.cloudinary.cloud-name=your-cloud-name
   app.cloudinary.api-key=your-api-key
   app.cloudinary.api-secret=your-api-secret
   ```

### Step 3: Running the Backend Service
1. Open a terminal inside the `/Backend` directory.
2. Compile and run the Spring Boot application:
   ```bash
   mvn clean spring-boot:run
   ```
3. The server will start and listen on port `8080` (e.g., `http://localhost:8080`).

### Step 4: Running the Frontend Client
1. Open a new terminal inside the `/frontend` directory.
2. Install the required Node packages:
   ```bash
   npm install
   ```
3. Start the Vite local development server:
   ```bash
   npm run dev
   ```
4. The React application will start and listen on port `5173`. Open `http://localhost:5173` in your web browser.

---

## 20.3 Production Packaging

### 1. Frontend Production Build
To compile the React SPA into static HTML, CSS, and JS assets:
```bash
cd frontend
npm run build
```
The compiled bundle will be saved to the `/frontend/dist` directory, ready to be served by Nginx or Apache.

### 2. Backend JAR Compilation
To package the Spring Boot backend into an executable JAR:
```bash
cd Backend
mvn clean package -DskipTests
```
The compiled JAR will be saved to `/Backend/target/assignment-management-system-0.0.1-SNAPSHOT.jar`, ready to run in a production environment:
```bash
java -jar target/assignment-management-system-0.0.1-SNAPSHOT.jar
```
