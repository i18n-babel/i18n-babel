<span class="badge-npmversion"><a href="https://npmjs.org/package/i18n-babel" title="View this project on NPM"><img src="https://img.shields.io/npm/v/i18n-babel.svg" alt="NPM version" /></a></span>
<span class="badge-npmdownloads"><a href="https://npmjs.org/package/i18n-babel" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/i18n-babel.svg" alt="NPM downloads" /></a></span>

# i18n-babel

i18n-babel is the most powerful translations manager for javascript applications on the web.

- Easy to integrate: min to no effort
- No external dependencies: only javascript and html :)
- Blazing fast: it is a web component
- Works with any framework (React, Angular, Stencil, ... even with plain Javascript)
- Automatic language detection from naviagator user preferences
- The key is the fallback: if no translation is found, the application will show the texts as defined
- Local translations with intelligent update system
- Versioning of translations with local cache in localstorage
- Supports interpolation
- Privacy friendly: local values can be opted-in/out
- Small footprint: ~15 kB (4.5 kB gzipped)
- Free to use

# Gold sponsors

From the creators of ***i18n-babel***: translations as a service - [blablatec.com](blablatec.com)

Move your application to the next level: the premium translations service. With [blablatec.com](blablatec.com) you can focus on what you do best: add value to your application, surrounding with valuable partners.

[Blablatec.com](blablatec.com) helps you to manage the translations with an easy and intuitive interface and keep the texts of your application always up to date.

# Local values and Cookie Policies

This library uses cookie `lang` which must be opted in by setting `isLocalValuesAllowed: true` on initialization.
It also uses localstorage to keep the last version of the translation of each language in local storage. It must be opted in in the same way as cookie.

# Index

- i18n-babel
- Gold sponsors
- Local values and Cookie Policies
- Index
- How it works
    - Configuration
    - Initialization
    - Modes
        * Tag name
        * Code
        * Attribute
- Quick examples
    - Example of use with plain Javascript
    - Example of use with stencil.js app
        * Install
        * Usage
- API
    - Events
        * Example
    - Translator
        * `init(options: ITranslatorOptions) => Translator`
        * `getInstance() => Translator`
        * `setLocalValuesAllowed(isLocalValuesAllowed = false) => void`
        * `t(originalText: string, tData?: TypeTData, lang?: string) => Promise<string>`
        * `guessLanguage(isSkipCookie = false, resetCookie = false) => string`
        * `getDefaultLanguage() => string`
        * `getCurrentLanguage() => string`
        * `setLanguage(lang) => boolean`
        * `cacheClear() => void`
        * `window.newTranslations => { [key: string]: string }`
- Backend API
- License

# How it works

## Configuration

The `i18n-babel` library needs translations in order to translate the texts :)
On local environment, translations files can be located at `assets/i18n/all.json`. This can be customized at initialization time.
For every language, create an `assets/i18n/all-${langCode}.json` where langCode is the 2 letters code for the language. Also create the default `all.json`:
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

An example file would be:

```json
{
    "some text that should be translated": "this is the translation",
    "[MAIN.TITLE]": "An important title",
    "translation (% interpolated %)": "(% interpolated %) translation",
    "translation interpolated object (% interp.someKey %)": "(% interp.someKey %) interpolated"
}
```

It is also possible to specify the version of the translations for each language with a file named `assets/i18n/versions.json`. Note that during a new release, texts in localstorage will take precedence over texts in files, so versioning is important to keep translations updated. Default language is specified with `'--'`:

```json
{
    "--": 4,
    "ca": 10,
    "en": 6,
    "es": 3
}
```

## Initialization

The library must be initialized in order to start translating. Please **NOTE** that no translations will be applied until the library is initialized. The event `i18n-babel-ready` will be launched when the `window.onload` event occurs and the `Translator` component is ready to be used:

```js
document.addEventListener('i18n-babel-ready', () => Translator.init({ isLocalValuesAllowed: true }));
```

See below in API section, all availabe options. When initialized, the library will do some things:

1. Detect the language in this order of precedence:
    - Cookie `lang` when present
    - Init `options.userLanguage` when present
    - `window.navigator.userLanguage`
    - `window.navigator.language`
    - `opts.defaultLanguage`, which defaults to `en`
2. Check if there are available translations in localstorage
3. Get the version of the localstorage translations
4. Check if there is a newer version for the selected language in `assets/i18n/versions.json` (or wherever specified on init options)
5. When a new version in `assets/i18n` is detected, refresh localstorage

If `apiUrl`, `appId` and `appSecret` have been provided (they can be obtained on blablatec.com):

6. Start a background process to check if there is a newer version for the translations
7. In case a new version for language detected, download new version and refresh localstorage

**WARNING** Localstorage must be enabled with `isLocalValuesAllowed: true` option. When not enabled, the process will skip checking and continue on. This will make the translations to be download every time the application loads.

Every time the language changes, the process will be started again.

## Modes

`i18n-babel` is available in 3 different modes:

- [*Enabled  by default*] Tag Name: `<i18n-babel>Translate me!</i18n-babel>`
- [*Enabled  by default*] Javascript: `await Translator.t('Translate me')`
- [*Disabled by default*] Attribute: `<span data-i18n>Translate me!</span>`

**NOTE**: `i18n-babel` library comes with `tag name` and `javascript` momdes enabled by default and attribute mode disabled. Although attribute mode seems the cleanest way to use the library, it requires to monitor changes on then entire DOM and shadow DOM's too. Even though it is been carried on in a very performant way, depending on the size of the page can have an imapct on performance on very large sites.

### Tag name
This is the easiest and recommended way to translate. It is only required to initialize the library and to place every text inside `i18n-babel` tag:

```html
<i18n-babel>Translate me!</i18n-babel>
<script>
    // Texts will be translated once Translator is initialized
    document.addEventListener(
        'i18n-babel-ready',
        () => Translator.init({ isLocalValuesAllowed: true }));
</script>
```

It also supports dynamic interpolation via `data-i18n` attribute:

```html
<i18n-babel data-i18n='{"name": "i18n-babel"}'>Hello (% name %)</i18n-babel>
<script>
    // Texts will be translated once Translator is initialized
    document.addEventListener(
        'i18n-babel-ready',
        () => Translator.init({ isLocalValuesAllowed: true }));
</script>
```

The changes on the attribute `data-i18n` are immediately applied to the text. Please note that the `data-i18n` attribute only supports a well formatted JSON string: the keys must be always double quoted and string values must be double quotted too:

```json
{"name": "i18n-babel", "number": 12.8}
```

For this reason it is easier to place the text inside single quotes. It can also be modified via code:

```html
<i18n-babel id="greet">Hello (% name %)</i18n-babel>

<script>
    const greet = document.getElementById('greet');
    // Setup can be done before initialization occurs
    greet.setAttribute('data-i18n', JSON.stringify({ name: 'world' }));

    // Wait for initialization
    document.addEventListener(
        'i18n-babel-ready',
        () => Translator.init({ isLocalValuesAllowed: true }));

    // Change the text later on
    setTimeout(() => {
        const attr = JSON.stringify({ name: 'universe' });
        greet.setAttribute('data-i18n', attr);
    }, 1000);
</script>
```

### Code

The second method to translate texts is on javascript / typescript:

```html
<h1><i18n-babel id="main-title" /></h1>

<script>
    const mainTitle = document.getElementById('main-title');
    async function load() {
        Translator.init({ isLocalValuesAllowed: true });
        const text = 'We like random numbers: (% random %)';
        const params = { random: Math.random() };
        codeTranslated.innerHTML = await Translator.t(text, params);
    }
    document.addEventListener('i18n-babel-ready', load);
</script>
```

**NOTE**: `Translator.init` function must be called before any other one. Otherwise `Translator` will initialize itself with default values (see below in API section).

### Attribute

The last available method is with `data-i18n` attribute. It is **disabled** by default because it wakes up a process to scan and watch changes to the whole DOM and shadow DOM's:

```html
<p data-i18n>Translate me!</p>
<script>
    // Texts will be translated once Translator is initialized
    document.addEventListener('i18n-babel-ready', () => Translator.init({
        isLocalValuesAllowed: true,
        isEnableAttr: true,
    }));
</script>
```

It also supports dynamic interpolation via `data-i18n` attribute:

```html
<p data-i18n='{"name": "i18n-babel"}'>Hello (% name %)</p>
<script>
    // Texts will be translated once Translator is initialized
    document.addEventListener('i18n-babel-ready', () => Translator.init({
        isLocalValuesAllowed: true,
        isEnableAttr: true,
    }));
</script>
```

# Quick examples

See examples in [examples folder](https://github.com/i18n-babel/i18n-babel/tree/master/examples).

## Example of use with plain Javascript

`index.html`
```html
<!doctype html>
<html>

<head>
    <script src="https://unpkg.com/i18n-babel/dist/i18n-babel.js"></script>
</head>

<body>
    <h1 data-i18n>Translate texts with attribute <code>data-i18n</code></h1>
    <p>
        <i18n-babel i18n-babel='{"name": "i18n Babel!", "url": "https://i18n-babel.com"}'>
            Visit us: <a href="(%url)">(%name)</a>
        </i18n-babel>
    </p>

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
import { Translator } from 'i18n-babel';

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
        return (
            <p>
                <i18n-babel data-i18n={JSON.stringify(tData)}>
                    Visit us: <a href="(%url)">(%name)</a>
                </i18n-babel>
            </p>
        );
    }
}
```

# API

## Events


| Event                            | Description                                                                                                                                | Type                  |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| `i18n-babel-ready`               | Event emitted when translator is ready to be initialized                                                                                   | `CustomEvent<void>`   |
| `i18n-babel-update-translations` | Event emitted when translations has been changed<br>Mainly for internal purposes, `ev.detail` contains language                                 | `CustomEvent<string>` |
| `i18n-babel-missing-translation` | Event emitted when missing (empty) translation is found<br>`ev.detail` contains original text<br>*Only emitted when `isShowMissing` is set to `true`* | `CustomEvent<string>` |
| `i18n-babel-new-translation`     | Event emitted when new translation is found<br>`ev.detail` contains original text<br>*Only emitted when `isShowMissing` is set to `true`*     | `CustomEvent<string>` |

### Example:

```ts
document.addEventListener('i18n-babel-missing-translation', ev => {
    console.log('Missing translation for:', ev.detail);
});
```

## Translator

Translator is the main object. It is a [singleton class](https://en.wikipedia.org/wiki/Singleton_pattern) and thus it cannot be instantiated. Use `Translator.init(options)` to initialize translations. It also supports `getInstance()` to get an instance to the object at any time of lifecycle.
All public methods of `Translator` can be used as static or instance method.

### `init(options: ITranslatorOptions) => Translator`

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

It accepts an ITranslatorOptions options object with the following parameters:

```ts
interface ITranslatorOptions {
    /** Allowed languages array, if found language is not in this array, will fall back to default, defaults to ['en'] */
    availableLangs?: string[];
    /** The default language to select when the selected one is not found in availableLangs, defaults to 'en' */
    defaultLanguage?: string;
    /** Will take precedence over navigator language, defaults to 'en' */
    userLanguage?: string;
    /** Show missing translations in console, defaults to false */
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
    /** Path to the location of assets files, defaults 'assets/i18n' */
    assetsLocation?: string;
    /**
     * Names of the translations and version files. Define it as:
     * ```
     * { "--": "filename1.json", "ca": "filename2.json", "en": "filename3.json", ..., "versions": "filename.json" }
     * ```
     * defaults: For every language, the default file is located at `all-${langCode}.json`:
     * ```
     * { "--": "all.json", "ca": "all-ca.json", "en": "all-en.json", ..., "versions": "versions.json" }
     * ```
     */
    fileNames?: { [key: string]: string };
}
```

### `getInstance() => Translator`

Translator is a static object.

- **returns**: an instance to the `Translator` object

```js
const translator = Translator.getInstance();
```

### `setLocalValuesAllowed(isLocalValuesAllowed = false) => void`

Opts in/out the use of local values.

- `isLocalValuesAllowed` boolean value indicating if local values are allowed or not

**WARNING**: calling this function with `false` will remove all local values.

```js
Translator.setLocalValuesAllowed(true);
```

### `t(originalText: string, tData?: TypeTData, lang?: string) => Promise<string>`

Translates a text, returns the text itself if no translation is found.

- `originalText`: text to translate
- `tData`: Interpolation parameters
- `lang`: Translation language
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

### `guessLanguage(isSkipCookie = false, resetCookie = false) => string`

This method may never be used, use `getCurrentLanguage()` instead.
Guess the language. First look at the `lang` cookie.
If it's not available, it looks for the language in these places (in this order of precedence):

- options.userLanguage
- navigator.userLanguage
- options.defaultLanguage

- `isSkipCookie`: does not read from cookie
- `resetCookie`: saves the favorite language to `lang` cookie
- **returns**: 2 letters favorite language

```js
Translator.guessLanguage();
```

**Use case**: get the language in which the user would like to see the application.

### `getDefaultLanguage() => string`

This method may never be used, use `getCurrentLanguage()` instead.
Guesses the language (see `guessLanguage()`) and filters it with `availableLangs`.
If the language is not present in `availableLangs` the `options.defaultLanguage` will be returned.

- **returns**: 2 letters default language

```js
Translator.getDefaultLanguage();
```

**Use case**: get the language in which the application will be displayed the first time it is opened.

### `getCurrentLanguage() => string`

Gets the current language of the application.

- **returns**: 2 letters current language

```js
Translator.getCurrentLanguage();
```

### `setLanguage(lang) => boolean`

Changes the language of the application.
Must be one of availableLangs otherwise the favorite language will be selected.

- `lang`: new language
- **returns**: the selected language

```js
Translator.setLanguage('es');
```

### `cacheClear() => void`

Clears the translations cache and tries to download again the translations.

```js
Translator.cacheClear();
```

### `window.newTranslations => { [key: string]: string }`

Contains an array with all new translations found. Only available when `isShowMissing` is set to `true`.

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
