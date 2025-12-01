import {ChatCommand} from "../base/chat-command";
import {Environment} from "../common/Environment";
import {Message} from "typescript-telegram-bot-api";
import {bot, setModel} from "../index";

export class SetModel extends ChatCommand {
    regexp = /^\/setmodel\s([^]+)/;

    async execute(msg: Message, match?: RegExpExecArray | null): Promise<void> {
        const newModel = match?.[1]
        setModel(newModel || Environment.OLLAMA_MODEL);

        const chatId = msg.chat.id;

        const text = newModel ? `Выбрана модель "${newModel}"`
            : `Модель не задана. Будет использоваться стандартная модель "${Environment.OLLAMA_MODEL}".`

        try {
            await bot.sendMessage({chat_id: chatId, text: text});
        } catch (e) {
            console.error(e);
        }
        return Promise.resolve();
    }
}