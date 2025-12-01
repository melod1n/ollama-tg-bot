import {ChatCommand} from "../base/chat-command";
import {Message} from "typescript-telegram-bot-api";
import {bot} from "../index";
import {ignore} from "../util/utils";

export class Ping extends ChatCommand {
    regexp = /^\/ping/i;

    async execute(msg: Message, _match?: RegExpExecArray | null): Promise<void> {
        await bot.sendMessage({chat_id: msg.chat.id, text: 'pong'}).catch(ignore);
    }
}