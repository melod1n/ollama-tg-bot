import {ChatCommand} from "../base/chat-command";
import {Message} from "typescript-telegram-bot-api";
import {bot, model} from "../index";

export class GetModel extends ChatCommand {
    regexp = /^\/getmodel/;

    async execute(msg: Message, match?: RegExpExecArray | null): Promise<void> {
        const chatId = msg.chat.id;

        try {
            await bot.sendMessage({chat_id: chatId, text: `Текущая модель: "${model}"`})
        } catch (e) {
            console.error(e);
        }
        return Promise.resolve();
    }
}