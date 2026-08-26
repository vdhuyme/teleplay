# Teleplay

A Telegram group music remote-control bot.

## Overview

Teleplay allows everyone in a Telegram group to control a YouTube music player. The Telegram bot acts as a remote control, while the actual playback happens in a web browser using the YouTube IFrame Player API.

## Architecture

```
                         Telegram Group
                              |
                              v
                         grammY Bot
                              |
                           HTTP API
                              |
                              v
                         Express API
                              |
             ┌────────────────┼────────────────┐
             |                |                |
             v                v                v
          MySQL            Redis         YouTube API
             |                |
             |                |
             └────────┬───────┘
                      |
                  WebSocket
                      |
                      v
                Next.js Player
                      |
                      v
             YouTube IFrame API
                      |
                      v
                   YouTube
```

## Features

- Control music from Telegram group chat
- Play, pause, resume, skip, stop commands
- Queue management
- Volume control
- Real-time player state sync
- Multiple independent groups support

## Prerequisites

- Node.js >= 18
- pnpm
- Docker & Docker Compose
- YouTube Data API key

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:

- `YOUTUBE_API_KEY` - Your YouTube Data API key
- `TELEGRAM_BOT_TOKEN` - Your Telegram bot token

### 3. Start infrastructure

```bash
docker compose up -d
```

### 4. Run database migrations

```bash
pnpm db:migrate
```

### 5. Start the applications

```bash
pnpm dev
```

This will start:

- API server on port 3000
- Bot server
- Player on port 3001

### 6. Open the player

Navigate to: `http://localhost:3001/player/-100123456789`

Replace `-100123456789` with your Telegram group's chat ID.

## Telegram Commands

| Command           | Description                     |
| ----------------- | ------------------------------- |
| `/start`          | Welcome message                 |
| `/help`           | Show available commands         |
| `/play <query>`   | Play a song                     |
| `/pause`          | Pause playback                  |
| `/resume`         | Resume playback                 |
| `/skip`           | Skip to next song               |
| `/stop`           | Stop playback                   |
| `/queue`          | View the queue                  |
| `/now`            | View current song with controls |
| `/volume <0-100>` | Set volume                      |
| `/clear`          | Clear the queue                 |

## Development

### Project Structure

```
teleplay/
├── apps/
│   ├── api/          # Express API server
│   ├── bot/          # Telegram bot
│   └── player/       # Next.js player
├── packages/
│   ├── config/       # Environment configuration
│   ├── contracts/    # Shared Zod schemas
│   └── database/     # Drizzle ORM setup
└── docker-compose.yml
```

### Available Scripts

```bash
# Development
pnpm dev              # Start all apps
pnpm build            # Build all apps
pnpm typecheck        # Type check all apps
pnpm lint             # Lint all apps

# Database
pnpm db:generate      # Generate migrations
pnpm db:migrate       # Run migrations
```

## Tech Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Package Manager**: pnpm
- **API**: Express
- **Bot**: grammY
- **Database**: MySQL 8 + Drizzle ORM
- **Cache**: Redis
- **Realtime**: WebSocket
- **Player**: Next.js + YouTube IFrame API
- **Validation**: Zod

## License

MIT
