import TelegramBot from "node-telegram-bot-api";

export default new TelegramBot(process.env.TELEGRAM_TOKEN!, { polling: false });
