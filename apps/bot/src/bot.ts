import { Bot } from "grammy";
import { App } from "./config/env";
import { startCommand } from "./commands/start.command";
import { helpCommand } from "./commands/help.command";
import { playCommand } from "./commands/play.command";
import { searchCommand } from "./commands/search.command";
import { pauseCommand } from "./commands/pause.command";
import { resumeCommand } from "./commands/resume.command";
import { skipCommand } from "./commands/skip.command";
import { stopCommand } from "./commands/stop.command";
import { queueCommand } from "./commands/queue.command";
import { nowCommand } from "./commands/now.command";
import { volumeCommand } from "./commands/volume.command";
import { clearCommand } from "./commands/clear.command";
import { playCallback } from "./utils/player.callback";
import {
  suggestCommand,
  suggestCallback,
  suggestSubCallback,
  suggestPlayCallback,
  suggestBackCallback,
} from "./commands/suggest.command";

const bot = new Bot(App.getOrThrow("TELEGRAM_BOT_TOKEN"));

// Commands
bot.command("start", startCommand);
bot.command("help", helpCommand);
bot.command("play", playCommand);
bot.command("search", searchCommand);
bot.command("pause", pauseCommand);
bot.command("resume", resumeCommand);
bot.command("skip", skipCommand);
bot.command("stop", stopCommand);
bot.command("queue", queueCommand);
bot.command("now", nowCommand);
bot.command("volume", volumeCommand);
bot.command("clear", clearCommand);
bot.command("suggest", suggestCommand);

// Callbacks
bot.callbackQuery(/^pause:-?\d+$/, playCallback);
bot.callbackQuery(/^skip:-?\d+$/, playCallback);
bot.callbackQuery(/^stop:-?\d+$/, playCallback);
bot.callbackQuery(/^queue:-?\d+$/, playCallback);
bot.callbackQuery(/^sp:/, playCallback);
bot.callbackQuery(/^sg:/, suggestCallback);
bot.callbackQuery(/^sgs:/, suggestSubCallback);
bot.callbackQuery(/^sgp:/, suggestPlayCallback);
bot.callbackQuery(/^sgback:/, suggestBackCallback);
bot.callbackQuery("sgmain", suggestBackCallback);

// Register commands for Telegram menu
bot.api.setMyCommands([
  { command: "play", description: "Play a song" },
  { command: "search", description: "Search and select a song" },
  { command: "suggest", description: "Suggest songs by genre/trend/artist" },
  { command: "pause", description: "Pause playback" },
  { command: "resume", description: "Resume playback" },
  { command: "skip", description: "Skip to next song" },
  { command: "stop", description: "Stop playback" },
  { command: "queue", description: "View the queue" },
  { command: "now", description: "View current song" },
  { command: "volume", description: "Set volume 0-100" },
  { command: "clear", description: "Clear the queue" },
  { command: "help", description: "Show help" },
]);

export { bot };
