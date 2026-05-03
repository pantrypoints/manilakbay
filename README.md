# sv

Everything you need to build a Svelte project, powered by [`sv`](https://github.com/sveltejs/cli).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```sh
# create a new project
npx sv create my-app
```

To recreate this project with the same configuration:

```sh
# recreate this project
bun x sv@0.12.4 create --template minimal --types ts --add prettier eslint vitest="usages:unit,component" tailwindcss="plugins:typography,forms" sveltekit-adapter="adapter:cloudflare+cfTarget:pages" devtools-json drizzle="database:sqlite+sqlite:turso" mdsvex paraglide="languageTags:en, zh+demo:yes" playwright --install bun my-svelte-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```sh
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```sh
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.

uv purple
bus orange

    {
      "id": "BGC-NORTH",
      "name": "Ayala - BGC North Loop",
      "color": "#EF4444",
      "path": [
        [14.549191721295585, 121.02822303771973],
        [14.557707082499913, 121.03813648223877],
        [14.557208631385956, 121.04208469390869],
        [14.555588657488814, 121.04350090026854],
        [14.555422505647394, 121.04504585266115],
        [14.553636365451343, 121.05041027069092],
        [14.552140981146374, 121.04989528656006],
        [14.550977897460237, 121.05341434478758],
        [14.552514828172486, 121.05401515960692],
        [14.551850210799415, 121.05581760406494],
        [14.551195976118214, 121.05794191360474],
        [14.550510585324773, 121.05817794799806],
        [14.549316338706278, 121.05663299560545],
        [14.547675537164507, 121.05634331703186],
        [14.546823977127483, 121.05549573898315],
        [14.547488609632845, 121.05405807495116],
        [14.547363991190482, 121.05221271514891],
        [14.54890094706373, 121.05272769927977],
        [14.549939424704606, 121.04925155639648],
        [14.54844401535417, 121.04873657226561],
        [14.549108642982699, 121.04684829711913],
        [14.554051748182346, 121.04869365692139],
        [14.555297891684244, 121.04530334472656],
        [14.555630195429611, 121.04380130767822],
        [14.556959405406701, 121.04221343994139],
        [14.557582469827, 121.03843688964842],
        [14.549233260440298, 121.02848052978514]
      ]
    },