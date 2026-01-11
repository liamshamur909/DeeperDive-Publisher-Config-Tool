# DeeperDive Publisher Config Tool

The **DeeperDive Publisher Config Tool** is a web-based application designed to manage, edit, and version-control publisher configuration files. It provides a user-friendly interface for modifying JSON configurations while automatically maintaining a version history of all changes.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

## 🚀 Installation

1. **Clone the repository** (if applicable) or navigate to the project directory.
2. **Install dependencies**:
   ```bash
   npm install
   ```

## 💻 Running the Project

### Development Mode

To run the server in development mode with hot-reloading (using `tsx watch`):

```bash
npm run dev
```

The server will start at `http://localhost:3000`.

### Production/Standard Start

To run the server normally:

```bash
npm start
```

### Building

To compile the TypeScript code (if needed for deployment):

```bash
npm run build
```

## ✨ Features

- **Publisher Management**: View a list of all available publisher configurations.
- **Visual Editor**: detailed form-based editing of complex JSON structures.
- **Version Control**: Every save automatically creates a new version in `data/history/`, preserving the complete history of changes.
- **Version Comparison**: Inspect previous versions of configurations.
- **REST API**: Backend API to handle data retrieval and persistence.

## 📂 Project Structure

- **`src/`**: Contains the Express server implementation (`server.ts`).
- **`public/`**: Frontend source code (HTML, CSS, TypeScript).
- **`data/`**: Stores the active publisher JSON files.
  - **`history/`**: Stores archived versions of modified configurations.
- **`dist/`**: Compiled JavaScript output.

## 🔌 API Reference

The server exposes the following REST endpoints:

- **`GET /api/publishers`**
  - Returns a list of all publisher configurations.
- **`GET /api/publisher/:filename`**
  - Returns the content of a specific publisher configuration.
- **`PUT /api/publisher/:filename`**
  - Updates a publisher configuration and creates a new history version.
- **`GET /api/publisher/:filename/versions`**
  - Returns a list of available versions for a specific file.
- **`GET /api/publisher/:filename/versions/:version`**
  - Returns the content of a specific historical version.
