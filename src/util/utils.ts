import type {CallbackQuery, Message} from "typescript-telegram-bot-api";
import type {ChatCommand} from "../base/chat-command.ts";
import type {CallbackCommand} from "../base/callback-command.ts";
import {TelegramError} from "typescript-telegram-bot-api/dist/errors";
import {Environment} from "../common/Environment";

export const ignore = () => {
};

export const ignoreIfNotChanged = (e: Error | TelegramError) => {
    if (!(e instanceof TelegramError && e?.response?.description?.startsWith("Bad Request: message is not modified"))) {
        throw e;
    }
};

export function searchChatCommand(commands: ChatCommand[], text: string): ChatCommand | null {
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        if (command?.regexp.test(text)) {
            return command;
        }
    }

    return null;
}

export function searchCallbackCommand(commands: CallbackCommand[], data: string): CallbackCommand | null {
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        if (!command?.data) continue;
        if (data.startsWith(command.data)) {
            return command;
        }
    }

    return null;
}

export async function findAndExecuteChatCommand(commands: ChatCommand[], msg: Message, text?: string): Promise<boolean> {
    const fromId = msg.from?.id || -1;
    const cmdText = text || (msg as Message).text || '';

    const command = searchChatCommand(commands, cmdText);
    if (!command) return false;

    const requirements = command.requirements;
    if (requirements) {
        if (requirements.isRequiresBotAdmin() && !Environment.ADMIN_IDS.includes(fromId)) {
            console.log(`${command.regexp}: adminId is bad: ${fromId}`);
            return false;
        }
    }

    await command.execute(msg, command.regexp.exec(cmdText));
    return true;
}

export async function findAndExecuteCallbackCommand(commands: CallbackCommand[], query: CallbackQuery): Promise<boolean> {
    const fromId = query.from.id;
    const data = query.data || '';

    const command = searchCallbackCommand(commands, data);
    if (!command) return false;

    const requirements = command.requirements;
    if (requirements) {
        if (requirements.isRequiresBotAdmin() && !Environment.ADMIN_IDS.includes(fromId)) {
            console.log(`${command.data}: adminId is bad: ${fromId}`);
            return false;
        }
    }

    await command.execute(query);
    await command.answerCallbackQuery(query);
    await command.afterExecute(query);
    return true;
}