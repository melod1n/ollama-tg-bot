import {ChatCommand} from "../base/chat-command";
import {Message} from "typescript-telegram-bot-api";
import {bot, ollama} from "../index";

export class ListModels extends ChatCommand {
    regexp = /^\/models/;

    async execute(msg: Message, _match?: RegExpExecArray | null): Promise<void> {
        try {
            const listResponse = await ollama.list();
            const message = 'Доступные модели:\n\n' +
                listResponse.models.map(e => `\`${e.model}\``).join("\n");

            await bot.sendMessage(
                {
                    chat_id: msg.chat.id,
                    text: message,
                    parse_mode: "Markdown",
                }
            );
        } catch (e) {
            console.error(e);
        }
        return Promise.resolve();
    }
}