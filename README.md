## Getting started with basic typescript

```
npm init -y
npm install --save-dev typescript
npx tsc --init
```

> package.json
> ```
> "scripts" {
>   "start": "tsc --watch"  // npm start
> }
> ```

> tsconfig.json
> ```
> "outDir": "./dest/"
> ```

## getting started with typescript bundler

```
npx create-snowpack-app . --template @snowpack/app-template-blank-typescript --force  // will remove this file lolz
```

## Sources
- [First Typescript Project](https://www.youtube.com/watch?v=jBmrduvKl5w) by Web Dev Simplified on YouTube