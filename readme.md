![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# i18n-babel

Translations library for any javascript based app.


## Plain Javascript

`index.html`
```html
<script type="module" src="https://unpkg.com/i18n-babel/dist/i18n-babel/i18n-babel.esm.js"></script>
<script nomodule src="https://unpkg.com/i18n-babel/dist/i18n-babel/i18n-babel.js"></script>

<i18n-t t-data='{"name": "i18n Babel!", "url": "https://i18n-babel.com"}'>Visit us: <a href="(%url)">(%name)</a></i18n-t>

<script>
    // Get it from https://i18n-babel.com
    const i18nConfig = {
        apiUrl: `https://i18n-babel.com/api/v1/application/5f7...`,
        appId: 'your-app-id',
        appSecret: 't8GTsNsd...',
    };
    Translator.init(availableLangs, defaultLanguage, i18nConfig);
</script>
```

## Example of use with stencil.js app

`app.ts` config file:
```ts
import { Translator } from 'i18n-babel/dist/collection/utils/translator';

import './app.deps';

const envConfig: IEnvironmentConfig = {
    env: 'production',
};

const i18nConfig = {
    apiUrl: 'https://i18n-babel.com/api/v1/application/5f7...',
    appId: 'com.i18n-babel',
    appSecret: 't8GTsNsdr...',
};

export default () => {
    Translator.init(availableLangs, defaultLanguage, i18nConfig);
};
```

`app.deps.ts`:
```ts
import 'i18n-babel';
...
```

`your-awesome-component.ts`:
```tsx
import { Component, h, State, Prop } from '@stencil/core';

@Component({
    tag: 'app-home',
    styleUrl: 'app-home.css',
})
export class AppHome {
    render() {
        const tData = {
            url: 'https://i18n-babel.com',
            name: 'i18n Babel!',
        };
        return <p><i18n-t t-data={JSON.stringify(tData)}>Visit us: <a href="(%url)">(%name)</a></i18n-t></p>;
    }
}
```
