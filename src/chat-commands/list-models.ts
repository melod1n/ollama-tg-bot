import {ChatCommand} from "../base/chat-command";
import {Message} from "typescript-telegram-bot-api";
import {bot, ollama} from "../index";

export class ListModels extends ChatCommand {
    regexp = /^\/models/;

    async execute(msg: Message, _match?: RegExpExecArray | null): Promise<void> {
        try {
            const listResponse = await ollama.list();

            const modelsString = listResponse.models
                .sort((a, b) => a.name.localeCompare(b.name))
                .map(e => `\`${e.model}\``)
                .join("\n");

            const message = 'Доступные модели:\n\n' + modelsString;

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