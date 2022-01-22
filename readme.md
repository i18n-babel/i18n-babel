![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)

# i18n-babel

i18n-babel is the most powerful translations manager for javascript applications on the web.

- Easy to integrate: min to no effort
- Web component: works with any framework (React, Angular, Stencil, ... even with plain Javascript)
- No external dependencies
- Automatic language detection
- The key is the fallback: if no translations present, the application will show the texts as defined
- Local translations with intelligent update system
- Versioning of translations with local cache in localstorage
- Supports interpolation
- Privacy friendly: local values can be opted-in/out
- Small footprint: < 400 Kb
- Free to use

# Gold sponsors

From the creators of i18n-babel: translations as a service - [blablatec.com](blablatec.com)

Move your application to the next level: the premium translations service. With [blablatec.com](blablatec.com) you can focus on what you do best: add value to your application, surrounding with valuable partners.

[Blablatec.com](blablatec.com) helps you to manage the translations with an easy and intuitive system.

# Local values and Cookie Policies

This library uses cookie `lang` which must be opted in setting `isLocalValuesAllowed: true` on initialization.
It also uses localstorage to keep the last version of the translation of each language in local storage. It must be opted in in the same way as cookie.

# Configuration

Place the translations in `assets/translations/all.json`.
For every language, create an `all-${langCode}.json` where langCode is the 2 letters code for the language. Also create the default `all.json`:
- `all.json`
- `all-en.json`
- `all-ca.json`
- ...

Every file is in the form:

```ts
type TypeTData = {
    [key: string]: string;
};
```

An example file could be:

```json
{
    "some text that should be translated": "this is the translation",
    "[MAIN.TITLE]": "An important title",
    "translation (% interpolated %)": "(% interpolated %) translation",
    "translation interpolated object (% interp.someKey %)": "(% interp.someKey %) interpolated"
}
```

# Quick examples

## Example of use with plain Javascript

`index.html`
```html
<!doctype html>
<html>

<head>
    <script type="module" src="https://unpkg.com/i18n-babel/dist/i18n-babel/i18n-babel.esm.js"></script>
    <script nomodule src="https://unpkg.com/i18n-babel/dist/i18n-babel/i18n-babel.js"></script>
</head>

<body>
    <h1><i18n-t>The title of the page</i18n-t></h1>
    <p><i18n-t t-data='{"name": "i18n Babel!", "url": "https://i18n-babel.com"}'>Visit us: <a href="(%url)">(%name)</a></i18n-t></p>

    <script>
        Translator.init({ isLocalValuesAllowed: true });
    </script>
</body>

</html>
```

## Example of use with stencil.js app

### Install

`npm install i18n-babel`

### Usage

`app.ts` config file:
```ts
import { Translator } from 'i18n-babel/dist/collection/utils/translator';

import './app.deps';

const envConfig: IEnvironmentConfig = {
    env: 'production',
};

export default () => {
    Translator.init({ isLocalValuesAllowed: true });
};
```

`app.deps.ts`:
```ts
import 'i18n-babel';
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

# API

## Translator

Translator is the main object. It is a [singleton class](https://en.wikipedia.org/wiki/Singleton_pattern) and thus it cannot be instantiated. Use `Translator.init(options)` to initialize translations. It also supports `getInstance()` to get an instance to the object at any time of lifecycle.
All public methods of `Translator` can be used as static or instance method.

### init(options: II18nOptions)

Initializes the translator object. Must be called before using i18n-babel. When called after a previous call, it will overwrite the singleton object with the new options.

- `options`: initialization options
- **returns**: an instance to the `Translator` object

```js
const translator = Translator.init({
    availableLangs: ['en', 'ca'],
    defaultLanguage: 'en',
    userLanguage: 'ca',
    isShowMissing: true,
    isLocalValuesAllowed: true,
    apiUrl: `https://i18n-babel.com/api/v1/application/5f7...`,
    appId: 'an-app-id',
    appSecret: 't8GTsNsd...',
    missingTag: 'app',
    tags: [],
});
```

It accepts an II18nOptions options object with the following parameters:

```ts
interface II18nOptions {
    /** Allowed languages array, if found language is not in this array, will fall back to default, defaults to ['en'] */
    availableLangs: string[];
    /** The default language to select when the selected one is not found in availableLangs, defaults to 'en' */
    defaultLanguage?: string;
    /** Will take precedence over navigator language, defaults to 'en' */
    userLanguage?: string;
    /** Show missing translations in console.warn, defaults to false */
    isShowMissing?: boolean;
    /** Allow the use of cookie `lang` to save the language and localstorage to save translations and versions, defaults to false */
    isLocalValuesAllowed?: boolean;
    /** Api url to get remote updates, defailts to null */
    apiUrl?: string;
    /** App id to get remote updates, defailts to null */
    appId?: string;
    /** App secret to get remote updates, defailts to null */
    appSecret?: string;
    /** The tag that will be sent to server when missing string is found, defaults to 'app' */
    missingTag?: string;
    /** The tags to filter strings on server side, defaults [] */
    tags?: string[];
}
```

### getInstance(): Translator

Translator is a static object.

- **returns**: an instance to the `Translator` object

```js
const translator = Translator.getInstance();
```

### setLocalValuesAllowed(isLocalValuesAllowed = false): void

Opts in/out the use of local values.

- `isLocalValuesAllowed` boolean value indicating if local values are allowed or not

**WARNING**: calling this function with `false` will remove all local values.

```js
Translator.setLocalValuesAllowed(true);
```

### t(originalText, tData, lang): Promise<string>

Translates a text, returns the text itself if no translation is found.

- `originalText`: text to translate
- `tData`: Interpolation parameters
- `lang`:  Translation language
- **returns**: Translated text

```js
const translation = await Translator.t('Hello from (% name %)!', { name: 'i18n-babel' }, 'ca');
```

Given an `all-ca.json` like the following one:
```json
{
    "Hello from (% name %)!": "(% name %) et saluda!"
}
```

The variable `translation` will become: `i18n-babel et saluda!`

### changeLanguage(lang): void

Changes the language of the application.

```js
Translator.changeLanguage('es');
```

### cacheClear(): void

Clears the translations cache and tries to download again the translations.

```js
Translator.cacheClear();
```

# Backend API

The backend API must implement the following routes:

- **GET** `${apiUrl}/lang`: return an array with available languages
- **GET** `${apiUrl}/lang/loc-version?lang=${lang}`: return a float number with the version of the requested language
- **GET** `${apiUrl}/locale/all.json?lang=${lang}&tags=app,server`: return a json with the translations for the language
    - lang: the language in format `'en'`
    - tags: optional coma separated tags
- **POST** `${apiUrl}/locale/missing`: saves missing string, body contains the data for the missing string:
    - lang: the language of the translation,
    - tag: the tag for this translation, in order to filter translations ing GET `all.json`
    - text: the missing translation
    - extra: (window as any).location.href

# License

MIT
