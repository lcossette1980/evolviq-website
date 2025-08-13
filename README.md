# EvolvIQ Web App

Frontend (React, Vercel) + Backend (FastAPI, Railway). See the docs section below for production readiness.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Documentation

- Production Master TODO: `docs/PRODUCTION_TODO.md` — master, sequenced checklist for launch.
- Roadmap: `docs/ASSESSMENTS_PROFILE_ROADMAP.md` — high‑level phases and goals.
- API Spec: `docs/API_SPEC_PROFILE.md` — endpoint contracts.
- Schemas: `docs/SCHEMAS/*.md` — data shapes used by the API and frontend.
- Guide Registry: `docs/GUIDE_REGISTRY.md` — guide metadata and mappings.
- Feedback Log: `FEEDBACK_TRACKING.md` — ongoing issue/decision log.

### Create GitHub Issues from the Master TODO

Requires GitHub CLI (gh) and authentication.

```
node scripts/create_issues_from_todo.js docs/PRODUCTION_TODO.md --repo <owner>/<repo> --label production
```

Use `--dry-run` to preview without creating issues.

For CRA reference docs, see: https://facebook.github.io/create-react-app/
