# [catanstat](https://catanstat.surge.sh)

An app to track your [Catan](https://www.catan.com/) game statistics.

## Scripts

There are some helpful scripts to run:

```bash
npm run dev # Starts the app in development mode

npm run build # Builds the app for production

npm run analyze # Runs the production code analysis

npm run ts # Runs the TypeScript compiler
```

## Deployment

The app is deployed via [surge.sh](https://surge.sh).

```bash
npm run build && surge ./build https://catanstat.surge.sh
```
