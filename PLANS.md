# Teleplay

Build a Telegram group music remote-control bot.

## 1. Goal

Build a Telegram bot that allows everyone in a Telegram group to control a YouTube music player.

The Telegram bot does **not** download, process, stream, or play audio.

The actual playback happens inside a web browser using the YouTube IFrame Player API.

Each Telegram group has its own independent player, queue, and playback state.

There is intentionally **no user management system**.

Do not implement:

- users
- accounts
- roles
- permissions
- authentication
- player ownership
- pairing
- user sessions

Anyone who can use the bot in the Telegram group can control that group's player.

---

# 2. Stack

Use:

- Node.js
- TypeScript
- pnpm workspace
- Express
- grammY
- Zod
- Drizzle ORM
- MySQL 8
- mysql2
- Redis
- WebSocket
- Next.js
- React
- YouTube Data API
- YouTube IFrame Player API
- Pino
- Docker Compose

Do not use:

- NestJS
- PostgreSQL
- FFmpeg
- yt-dlp
- audio downloading
- Telegram Voice Chat APIs

The project must use **pnpm** for package management.

---

# 3. Repository

Create a pnpm monorepo:

```text
teleplay/
├── apps/
│   ├── api/
│   ├── bot/
│   └── player/
│
├── packages/
│   ├── database/
│   ├── contracts/
│   └── config/
│
├── docker-compose.yml
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── .env.example
└── README.md
```

Root scripts:

```text
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

Use workspace dependencies between internal packages.

---

# 4. Architecture

```text
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

Responsibilities:

### Telegram / grammY

Receive commands and send responses.

### Express API

Contains all business logic.

### MySQL

Stores persistent queue/history data.

### Redis

Stores realtime player state and handles player locks.

### YouTube Data API

Searches for videos.

### Next.js Player

Displays the player and controls YouTube playback.

### YouTube IFrame API

Actually plays the YouTube video.

---

# 5. Group Identity

Use Telegram `chat.id` as the player ID.

Example:

```text
Telegram chat ID:
-100123456789
```

Use:

```text
playerId = "-100123456789"
```

Do not create a separate `players` table unless it becomes necessary later.

The Telegram group itself is the player identity.

Therefore:

```text
Telegram Group A
    -> playerId = chat.id A

Telegram Group B
    -> playerId = chat.id B
```

Each group gets independent:

- queue
- current song
- playback state
- history

---

# 6. Supported Telegram Chats

Only support:

- group
- supergroup

Do not implement private-chat music playback.

Do not check Telegram membership lists.

Do not maintain a user database.

If a user can send a command in the group, they are allowed to use the bot.

Use:

```ts
ctx.chat.id;
```

as the player ID.

---

# 7. MySQL + Drizzle

Use:

- MySQL 8
- Drizzle ORM
- mysql2
- drizzle-kit

Database connection:

```ts
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";

const pool = mysql.createPool(process.env.DATABASE_URL!);

export const db = drizzle(pool);
```

Use migrations through Drizzle Kit.

---

# 8. Database Schema

Only create tables that are necessary.

## `queue_items`

Purpose: persistent queue.

Fields:

```text
id
player_id
video_id
title
thumbnail
duration
position
requested_by
created_at
```

Recommended types:

```text
id            bigint unsigned auto_increment
player_id     varchar(32)
video_id      varchar(32)
title         varchar(500)
thumbnail     varchar(1000)
duration      int unsigned
position      int unsigned
requested_by  varchar(255)
created_at    timestamp
```

Create an index on:

```text
(player_id, position)
```

---

## `play_history`

Purpose: playback history.

Fields:

```text
id
player_id
video_id
title
requested_by
played_at
```

Recommended types:

```text
id            bigint unsigned auto_increment
player_id     varchar(32)
video_id      varchar(32)
title         varchar(500)
requested_by  varchar(255)
played_at     timestamp
```

Create an index on:

```text
(player_id, played_at)
```

`requested_by` is display-only.

It must never be used for authorization.

---

# 9. Redis

Redis is the source of truth for realtime player state.

Use keys:

```text
player:{chatId}:state
player:{chatId}:lock
```

Example state:

```json
{
  "status": "playing",
  "videoId": "abc123",
  "position": 120,
  "volume": 80
}
```

Possible statuses:

```text
idle
playing
paused
stopped
```

Do not persist realtime playback state in MySQL on every update.

Use Redis for:

- current player state
- current position
- current video
- volume
- distributed player lock

---

# 10. Redis Locking

Queue operations must be protected from concurrent requests.

Operations requiring a lock:

- play
- skip
- stop
- clear
- remove queue item
- video ended

Lock:

```text
player:{chatId}:lock
```

Use a short TTL.

Never hold the lock longer than necessary.

The goal is to prevent race conditions such as:

```text
User A -> /skip
User B -> /play Song
User C -> /skip
```

from corrupting the queue.

---

# 11. YouTube Integration

Use the official YouTube Data API for search.

Example:

```text
/play Daft Punk Get Lucky
```

Backend:

```text
search YouTube
    |
    v
videoId
title
thumbnail
duration
```

The backend must never download the audio.

Do not use:

```text
yt-dlp
FFmpeg
audio proxy
audio extraction
```

The browser plays the YouTube video directly through the YouTube IFrame Player API.

---

# 12. `/play` Behavior

Request:

```http
POST /players/:playerId/play
```

Body:

```json
{
  "query": "Daft Punk Get Lucky",
  "requestedBy": "Huy"
}
```

Process:

1. Validate request using Zod.
2. Search YouTube.
3. Select the first appropriate result.
4. Acquire player lock.
5. Check current player state.
6. If player is idle, start the video immediately.
7. If player is playing/paused, add it to the queue.
8. Persist queue item when queued.
9. Update Redis state.
10. Broadcast WebSocket event.
11. Release lock.
12. Return selected video information.

Response:

```json
{
  "videoId": "abc123",
  "title": "Daft Punk - Get Lucky",
  "thumbnail": "...",
  "duration": 248
}
```

---

# 13. Queue

Queue order is determined by `position`.

Example:

```text
1. Get Lucky
2. Instant Crush
3. One More Time
```

When a song is added:

```text
position = current maximum position + 1
```

When the current song finishes:

1. Save current song to history.
2. Remove current queue item.
3. Select next queue item.
4. Update its state.
5. Broadcast `PLAY`.
6. Browser starts next video.

If no next item exists:

```text
status = idle
```

---

# 14. Web Player

Create a Next.js application with tailwindcss.

Route:

```text
/player/[playerId]
```

Example:

```text
/player/-100123456789
```

The page should contain:

- YouTube player
- now playing
- queue
- play/pause state
- volume
- connection status

Keep the UI simple.

The player is primarily a playback endpoint, not a full YouTube clone.

---

# 15. YouTube IFrame Player

Use the YouTube IFrame Player API.

Implement:

```ts
player.loadVideoById();
player.playVideo();
player.pauseVideo();
player.stopVideo();
player.setVolume();
```

Listen to:

```text
PLAYING
PAUSED
BUFFERING
ENDED
```

When:

```text
ENDED
```

call:

```http
POST /players/:playerId/events/ended
```

The API decides what plays next.

Do not let the browser manage the queue independently.

---

# 16. WebSocket

Use WebSocket for realtime communication between API and player.

Connection:

```text
/ws/players/:playerId
```

Shared WebSocket contracts must be defined in:

```text
packages/contracts
```

Use Zod for validation.

Events:

```text
PLAY
PAUSE
RESUME
STOP
VOLUME
QUEUE_UPDATED
STATE_SYNC
```

Example:

```json
{
  "type": "PLAY",
  "videoId": "abc123",
  "position": 0
}
```

---

# 17. Player Synchronization

When the browser connects:

```text
WebSocket connect
      |
      v
load Redis state
      |
      v
STATE_SYNC
      |
      v
restore YouTube player
```

If the current state is:

```json
{
  "status": "playing",
  "videoId": "abc123",
  "position": 120
}
```

the browser should restore the video from approximately that position.

If the WebSocket disconnects:

- do not clear the queue
- do not change player state
- allow automatic reconnect

After reconnecting, the player must synchronize from the server again.

---

# 18. API Endpoints

Implement:

```text
GET    /health

GET    /players/:playerId/state

POST   /players/:playerId/play
POST   /players/:playerId/pause
POST   /players/:playerId/resume
POST   /players/:playerId/skip
POST   /players/:playerId/stop
POST   /players/:playerId/volume

GET    /players/:playerId/queue

POST   /players/:playerId/queue

DELETE /players/:playerId/queue/:itemId

DELETE /players/:playerId/queue

POST   /players/:playerId/events/ended
```

Controllers must be thin.

Business logic belongs in services.

Validate all input with Zod.

---

# 19. `/pause`

Process:

```text
Telegram
    |
    v
POST /pause
    |
    v
Redis state = paused
    |
    v
WebSocket PAUSE
    |
    v
Browser
    |
    v
player.pauseVideo()
```

---

# 20. `/resume`

Process:

```text
Telegram
    |
    v
POST /resume
    |
    v
Redis state = playing
    |
    v
WebSocket RESUME
    |
    v
Browser
    |
    v
player.playVideo()
```

---

# 21. `/skip`

Process:

```text
current song
    |
    v
save history
    |
    v
remove current queue item
    |
    v
get next queue item
    |
    v
update Redis
    |
    v
WebSocket PLAY
    |
    v
browser loads next video
```

If queue is empty:

```text
status = idle
```

and send:

```json
{
  "type": "STOP"
}
```

---

# 22. `/stop`

`/stop` stops the current video.

It must NOT clear the queue.

Example:

```text
/stop
```

means:

```text
stop playback
```

while:

```text
/clear
```

means:

```text
clear queue
```

Keep these behaviors separate.

---

# 23. Telegram Commands

Implement:

```text
/start
/help

/play <query>

/pause
/resume
/skip
/stop

/queue
/now

/volume <0-100>

/clear
```

Use grammY.

The bot communicates with Express through HTTP.

The bot must NOT directly access:

- MySQL
- Redis
- YouTube Data API

---

# 24. Telegram Inline Keyboard

`/now` should return something similar to:

```text
Now Playing

Daft Punk - Get Lucky

[ Pause ] [ Skip ]
[ Queue ] [ Stop ]
```

Use grammY inline keyboards.

Callback data examples:

```text
pause:-100123456789
skip:-100123456789
queue:-100123456789
stop:-100123456789
```

Validate callback data.

Do not trust callback data blindly.

---

# 25. `/queue`

Example response:

```text
Queue

Now Playing:
Daft Punk - Get Lucky

Up Next:
1. Instant Crush
2. One More Time
3. Harder Better Faster Stronger
```

Show `requested_by` when available.

---

# 26. `/now`

Example:

```text
Now Playing

Daft Punk - Get Lucky

Requested by Huy

[ Pause ] [ Skip ]
[ Queue ] [ Stop ]
```

If nothing is playing:

```text
Nothing is playing.
```

---

# 27. Bot Structure

```text
apps/bot/src/
├── bot.ts
├── commands/
│   ├── start.command.ts
│   ├── help.command.ts
│   ├── play.command.ts
│   ├── pause.command.ts
│   ├── resume.command.ts
│   ├── skip.command.ts
│   ├── stop.command.ts
│   ├── queue.command.ts
│   ├── now.command.ts
│   ├── volume.command.ts
│   └── clear.command.ts
├── callbacks/
│   └── player.callback.ts
├── api/
│   └── api-client.ts
└── formatters/
    └── player.formatter.ts
```

Keep grammY handlers thin.

Example flow:

```text
grammY command
      |
      v
API client
      |
      v
Express
      |
      v
service
```

Do not put business logic inside Telegram command handlers.

---

# 28. API Structure

```text
apps/api/src/
├── app.ts
├── server.ts
│
├── config/
│   └── env.ts
│
├── modules/
│   ├── players/
│   │   ├── player.routes.ts
│   │   ├── player.controller.ts
│   │   └── player.service.ts
│   │
│   ├── queue/
│   │   ├── queue.routes.ts
│   │   ├── queue.controller.ts
│   │   └── queue.service.ts
│   │
│   └── youtube/
│       ├── youtube.client.ts
│       └── youtube.service.ts
│
├── realtime/
│   ├── websocket.ts
│   └── player-events.ts
│
├── middleware/
│   ├── error-handler.ts
│   └── validation.ts
│
└── shared/
    └── errors/
```

---

# 29. Shared Contracts

Use:

```text
packages/contracts/
```

Define:

- API request schemas
- API response schemas
- player state
- WebSocket events
- queue item types

Example:

```ts
export const playRequestSchema = z.object({
  query: z.string().min(1).max(200),
  requestedBy: z.string().max(255).optional(),
});
```

Use the same contracts wherever possible.

---

# 30. Database Package

Structure:

```text
packages/database/
├── src/
│   ├── client.ts
│   ├── schema/
│   │   ├── queue-items.ts
│   │   └── play-history.ts
│   └── index.ts
├── drizzle/
└── drizzle.config.ts
```

Use Drizzle migrations.

---

# 31. Environment Variables

API:

```env
DATABASE_URL=mysql://teleplay:teleplay@localhost:3306/teleplay
REDIS_URL=redis://localhost:6379
YOUTUBE_API_KEY=
API_PORT=3000
LOG_LEVEL=info
```

Bot:

```env
TELEGRAM_BOT_TOKEN=
API_URL=http://localhost:3000
```

Player:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WS_URL=ws://localhost:3000
```

Create:

```text
.env.example
```

Never commit secrets.

---

# 32. Docker Compose

Use Docker Compose for local infrastructure.

```yaml
services:
  mysql:
    image: mysql:8.4
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: teleplay
      MYSQL_USER: teleplay
      MYSQL_PASSWORD: teleplay
    ports:
      - "3306:3306"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

Applications should run directly through pnpm during development.

---

# 33. Logging

Use Pino.

Log:

- Telegram commands
- player commands
- queue changes
- YouTube searches
- WebSocket connections
- WebSocket disconnections
- player events
- errors

Never log:

- Telegram bot token
- YouTube API key
- database password
- Redis credentials

---

# 34. Error Handling

Use a consistent API error structure:

```json
{
  "error": {
    "code": "QUEUE_EMPTY",
    "message": "The queue is empty"
  }
}
```

Possible error codes:

```text
PLAYER_NOT_FOUND
QUEUE_EMPTY
VIDEO_NOT_FOUND
YOUTUBE_API_ERROR
INVALID_VOLUME
INVALID_COMMAND
```

Use centralized Express error handling.

Do not expose internal stack traces to Telegram users.

Log detailed errors with Pino.

---

# 35. Rate Limiting

YouTube search is the expensive operation.

Rate limit:

```text
/play
```

per Telegram group.

Do not allow users to spam YouTube API requests.

Use Redis for rate-limit state.

The exact limits can be configured later.

---

# 36. Security

Keep security simple.

Required:

- Zod validation
- rate limiting
- CORS configuration
- no public MySQL
- no public Redis
- no secrets in source control
- validate WebSocket messages
- validate Telegram callback data

Do not introduce OAuth or a user authentication system.

---

# 37. Tests

Add tests for important business logic:

```text
queue add
queue remove
queue clear
queue skip
next song
empty queue
player state
volume validation
concurrent queue mutation
```

Test the services rather than testing every Telegram handler implementation detail.

---

# 38. Development Commands

The root project must support:

```text
pnpm install

docker compose up -d

pnpm db:migrate

pnpm dev
```

Development should start:

```text
API
Bot
Player
```

through the pnpm workspace.

---

# 39. Implementation Order

Implement in this exact order:

1. Initialize pnpm workspace.
2. Create `apps/api`.
3. Create `apps/bot`.
4. Create `apps/player`.
5. Create shared packages.
6. Add MySQL and Redis Docker Compose.
7. Configure Drizzle + mysql2.
8. Create MySQL migrations.
9. Implement Redis player state.
10. Implement Express API foundation.
11. Implement YouTube search service.
12. Implement Next.js player.
13. Integrate YouTube IFrame Player API.
14. Implement WebSocket.
15. Implement `/play`.
16. Implement `/pause`.
17. Implement `/resume`.
18. Implement `/stop`.
19. Implement `/skip`.
20. Implement queue persistence.
21. Implement automatic next-song playback.
22. Implement grammY bot.
23. Implement Telegram commands.
24. Implement inline keyboards.
25. Implement `/queue` and `/now`.
26. Implement `/volume`.
27. Implement `/clear`.
28. Implement play history.
29. Implement WebSocket reconnection.
30. Implement state synchronization.
31. Implement rate limiting.
32. Implement centralized error handling.
33. Add tests.
34. Add README.

Do not implement additional features until the MVP works.

---

# 40. MVP Acceptance Criteria

The MVP is complete when the following flow works:

### 1. Start infrastructure

```text
docker compose up -d
```

### 2. Start applications

```text
pnpm dev
```

### 3. Open player

```text
/player/-100123456789
```

### 4. Telegram group

A user sends:

```text
/play Daft Punk Get Lucky
```

### 5. Bot

The bot searches YouTube and adds the result.

### 6. Player

The browser receives the WebSocket event and starts the YouTube video.

### 7. Pause

User sends:

```text
/pause
```

The browser pauses.

### 8. Resume

User sends:

```text
/resume
```

The browser resumes.

### 9. Queue

User sends:

```text
/play Instant Crush
/play One More Time
```

The songs are queued.

### 10. Skip

User sends:

```text
/skip
```

The next song starts.

### 11. Automatic playback

When a video reaches `ENDED`, the next queued song automatically starts.

### 12. Multiple groups

Two different Telegram groups must have completely independent:

- player state
- queue
- history

### 13. Reload

Reloading the browser player must restore the current state from Redis.

---

# 41. Final Architecture

```text
                         TELEGRAM
                            |
                            v
                       grammY Bot
                            |
                           HTTP
                            |
                            v
                      Express API
                            |
              ┌─────────────┼─────────────┐
              |             |             |
              v             v             v
            MySQL         Redis       YouTube API
              |             |
              |             |
              └──────┬──────┘
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

Core responsibilities:

```text
Telegram      = remote control
grammY        = Telegram integration
Express       = business logic
MySQL         = persistent queue/history
Redis         = realtime player state/locking
YouTube API   = video search
WebSocket     = realtime commands
Next.js       = player UI
YouTube IFrame = actual playback
```

Keep the implementation minimal.

Do not add user management.

Do not add authentication.

Do not add roles.

Do not add pairing.

Do not add Telegram Voice Chat.

Do not download or proxy YouTube audio.

Do not add unnecessary abstractions or services.

The first goal is to make this flow work end-to-end:

```text
Telegram /play
      ↓
YouTube search
      ↓
Queue
      ↓
WebSocket
      ↓
Browser
      ↓
YouTube playback
      ↓
ENDED
      ↓
Next queue item
```

## Dependencies

Use these libraries only unless a new dependency is clearly required.

### API / Bot

- express — HTTP API
- grammy — Telegram Bot API
- zod — request validation and shared contracts
- drizzle-orm — ORM
- mysql2 — MySQL driver
- ioredis — Redis client
- googleapis — YouTube Data API v3
- ws — WebSocket server
- pino — logging
- pino-http — HTTP request logging
- cors — CORS
- dotenv — environment variables

### Player

- next — Next.js
- react — React
- react-dom — React DOM

Do not use an additional YouTube player npm package. Load the official YouTube IFrame Player API directly in the browser.

### Development

- typescript
- tsx
- drizzle-kit
- @types/node
- @types/express
- @types/ws
- eslint
- prettier
- vitest

### Package Responsibilities

`apps/api`:

- express
- zod
- drizzle-orm
- mysql2
- ioredis
- googleapis
- ws
- pino
- pino-http
- cors
- dotenv

`apps/bot`:

- grammy
- zod
- dotenv

`apps/player`:

- next
- react
- react-dom

`packages/database`:

- drizzle-orm
- mysql2

`packages/contracts`:

- zod

`packages/config`:

- zod
- dotenv

Use pnpm workspace dependencies.

Do not add axios, socket.io, yt-dlp, ffmpeg, PostgreSQL, or other unnecessary libraries.
