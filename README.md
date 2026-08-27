<p align="center">
  <img src="logo.png" alt="Cronus Logo" width="200"/>
</p>

<h1 align="center">Teleplay</h1>

<p align="center">
  A collaborative Telegram music player for groups.
  <br />
  <i>Pick. Queue. Vote. Listen together.</i>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-GPL_v3-8DB600?style=for-the-badge&logo=gnu&logoColor=white" alt="License: GPL v3" /></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-22+-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js 22+" /></a>
  <a href="https://www.typescriptlang.org"><img src="https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="https://core.telegram.org/bots"><img src="https://img.shields.io/badge/Telegram-Bot_API-26A5E4?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegram Bot API" /></a>
  <a href="https://expressjs.com"><img src="https://img.shields.io/badge/Express-API-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" /></a>
  <a href="https://react.dev"><img src="https://img.shields.io/badge/React-UI-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" /></a>
</p>

## Features

- **Group playback** — one bot, many listeners, same queue.
- **Suggest** — quick picks by genre, trending, or play history.
- **Queue with votes** — duplicate entries auto-bump instead of stacking.
- **YouTube-backed** — search and play any track by query or URL.
- **Real-time sync** — state, queue, and volume broadcast over WebSockets.
- **Web player UI** — control playback from a browser alongside the chat.

## Architecture

Monorepo (pnpm workspaces):

```
apps/
  bot/      Telegram bot (grammy)
  api/      REST + Socket.IO server (Express, Drizzle ORM)
  player/   Web UI (React)
packages/
  youtube/  YouTube Data API client
  core/     Shared utilities
```

## Quick start

```bash
# Prereqs: Node >= 22, pnpm
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/bot/.env.example apps/bot/.env
# fill in TELEGRAM_BOT_TOKEN, API_URL, YOUTUBE_API_KEY, DB credentials
pnpm dev
```

Visit the API on `http://localhost:3000` and the player UI on the port it prints.

## Commands (bot)

| Command    | What it does                           |
| ---------- | -------------------------------------- |
| `/play`    | Play a song by query or YouTube ID/URL |
| `/search`  | Search and pick from results           |
| `/suggest` | Browse by genre, trending, or history  |
| `/pause`   | Pause the player                       |
| `/resume`  | Resume playback                        |
| `/skip`    | Skip to the next queued song           |
| `/stop`    | Stop playback                          |
| `/queue`   | Show the current queue                 |
| `/now`     | Show what's playing                    |
| `/volume`  | Set volume 0–100                       |
| `/clear`   | Clear the queue                        |

## Contributing

Issues and PRs welcome. By participating you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[GNU GPL v3](LICENSE)
