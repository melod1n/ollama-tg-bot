import {ChatCommand} from "../base/chat-command.ts";
import type {Message} from "typescript-telegram-bot-api";
import {bot, ollama} from "../index.ts";
import {send, waitText} from "./ollama-chat.ts";
import {Requirements} from "../base/requirements.ts";
import {Requirement} from "../base/requirement.ts";

export class OllamaSearch extends ChatCommand {
    regexp = /^\/s\s([^]+)/;

    override requirements = Requirements.Build(Requirement.BOT_ADMIN);

    async execute(msg: Message, match?: RegExpExecArray | null): Promise<void> {
        console.log('match', match);
        const chatId = msg.chat.id;

        try {
            const wait = await bot.sendMessage({
                chat_id: chatId,
                text: waitText,
                reply_parameters: {
                    chat_id: chatId,
                    message_id: msg.message_id
                },
                parse_mode: "Markdown"
            });

            const results = await ollama.webSearch({query: match?.[1]!});
            console.log('results', results);
            // const message = `Результаты:\n\n${results.results.map((r, i) => `${i + 1}. (${r.url})[${r.title}]\n`)}`;

            let message = 'Результаты:\n\n';
            results.results.forEach((result, index) => {
                message += `${index+1}. ${result.url}\n`;
            });

            await send(chatId, wait.message_id, message);
        } catch (error) {
            console.error(error);
        }
        return Promise.resolve();
    }
}