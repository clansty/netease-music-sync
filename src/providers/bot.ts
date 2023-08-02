import TelegramBot from "node-telegram-bot-api";

export default new TelegramBot(process.env.TELEGRAM_TOKEN!, {
  polling: false,
  baseApiUrl: process.env.TELEGRAM_API_BASE,
});
