# VaporCollector
![App Logo](https://i.imgur.com/uElJKEe.png)

### Concept

VaporCollector is a small Angular-based application centered around presenting various amounts of Steam user details and data, including game library, friend list, wishlists, value-weighted metrics, and more, with an approachable and simple GUI!

The inception of this small application centers around wanting to have a personal environment to build familiarity around the incoming feature sets of each new version of Angular as they drop.

### Features

Some features include:

- Track details of user's game library, such as detailed game hour tracking across various Steam-supported platforms, achievement breakdown, up-to-date aggregation of news for games in library, and more!
- Follow and interact with user's Friend List by seeing friend's libraries, gameplay details, history, statuses and more!
- Examine detailed value-weighted breakdowns of the user's game library, including "best-value" game tracking, leaderboard rankings against friends, and more!

...and more!

### Steam Store Scraper

Provided within the backend of the project is a small scraper that I developed to utilize the Steam Store API to gather up to date game pricing and other related data. Due to request restrictions associated with the Steam Store API:

- The scraper is currently set to run once a day, post-midnight, to limit the time required to run within these restrictions
- There is a five minute cool down when the request limit is met before the scraper continues into the next set of data
- This a specific to Steam, as it is their API with their data, and as a small side-project that isn't meant to be a paid product, utilizing other third=party paid options didn't seem to be the most logic approach

### Angular CLI Note

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.0.4.

## Installation
Ensure NPM@11.7.0 is installed
```bash
nvm install --lts
```

```bash
nvm use 11.7.0
```

```bash
npm install -g npm@11.7.0
```

Confirm version was correctly installed
```bash
npm -v
```

Then, install the package dependencies
```bash
npm ci
```

## Building

Before attempting to build project, ensure that environment file (.env) within the 'api' directory was created with the following variables:
- STEAM_API_KEY (int)
- NODE_ENV='developmentLocal'
- SECRET_SESSION_KEY (string)
- ACCESS_TOKEN_KEY (Base64-encoded)
- ACCESS_KEY_EXP (string, ex. '1m')
- REFRESH_TOKEN_SECRET (Base64-encoded)
- REFRESH_TOKEN_EXP (string, ex. '2m')
- LOCAL_CLIENT_PORT (int)


Then, run the following npm command to build and start the full stack of the application
```bash
npm run startFull
```

Application can be access through your browser via: http://localhost:LOCAL_CLIENT_PORT/
