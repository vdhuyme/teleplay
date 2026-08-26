import dotenv from "dotenv";
import { bot } from "./bot";

dotenv.config();

bot.start({
  onStart: () => {
    console.log("🤖 Bot is running!");
  },
});
