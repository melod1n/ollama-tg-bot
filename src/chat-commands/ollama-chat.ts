import {ChatCommand} from "../base/chat-command";
import {Requirements} from "../base/requirements";
import {Requirement} from "../base/requirement";
import {Message} from "typescript-telegram-bot-api";
import {bot, model, ollama} from "../index";
import {editMessageText, ignore} from "../util/utils";
import {Environment} from "../common/Environment";

export const waitText = '⏳ Дайте-ка подумать...';

export class OllamaChat extends ChatCommand {
    regexp = /^\/c\s([^]+)/;

    override requirements = Requirements.Build(Requirement.BOT_ADMIN);

    async execute(msg: Message, match?: RegExpExecArray | null): Promise<void> {
        console.log('match', match);
        return this.executeOllama(msg, match?.[1]!);
    }

    async executeOllama(msg: Message, text: string): Promise<void> {
        if (!text || text.trim().length === 0) return;
        const chatId = msg.chat.id;

        let waitMessage: Message;

        try {
            waitMessage = await bot.sendMessage({
                chat_id: chatId,
                text: waitText,
                reply_parameters: {
                    chat_id: chatId,
                    message_id: msg.message_id
                },
                parse_mode: "Markdown"
            });

            const stream = await ollama.chat({
                model: model,
                stream: true,
                messages: [
                    {
                        role: 'system',
                        content: Environment.SYSTEM_PROMPT
                    },
                    {
                        role: 'user',
                        content: text
                    }
                ]
            });

            let ended = false;
            let messageText = '';

            const interval = setInterval(async () => {
                console.log('messageText', messageText);
                console.log('ended', ended);
                await editMessageText(chatId, waitMessage.message_id, messageText);
                if (ended) {
                    clearInterval(interval);
                }
            }, 4500);

            for await (const chunk of stream) {
                messageText += chunk.message.content;

                if (chunk.done) {
                    console.log('messageText', messageText);
                    ended = true;
                    clearInterval(interval);
                    await editMessageText(chatId, waitMessage.message_id, messageText);
                }
            }
        } catch (error) {
            console.error(error);
            await editMessageText(chatId, waitMessage.message_id, `Произошла ошибка!\n${error.toString()}`)
                .catch(async (e) => {
                    await editMessageText(chatId, waitMessage.message_id, `Произошла ошибка!\n${e.toString()}`).catch(ignore);
                });
        }
        return Promise.resolve();
    }
}