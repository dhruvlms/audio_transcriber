# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Docker

This project includes a production `Dockerfile` and a `docker-compose.yml` for convenience.

- Build production image and run (serves on port 3000):

```bash
docker build -t frontend-audio:latest .
docker run --rm -p 3000:80 frontend-audio:latest
```

- Use docker-compose for production build + run:

```bash
docker-compose up --build web
```

- Start a development container (bind mounts code, runs Vite dev server on 5173):

```bash
docker-compose up dev
```

Notes:
- The build step uses `npm run build` to produce the `dist/` folder which nginx serves.
- I cannot build or run Docker images from this environment — run the commands above locally where Docker is installed.
