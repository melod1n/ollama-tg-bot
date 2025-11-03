import {Ollama} from "ollama";
import {TelegramBot} from "typescript-telegram-bot-api";
import {Environment} from "./common/Environment.ts";
import {ChatCommand} from "./base/chat-command.ts";
import {findAndExecuteChatCommand} from "./util/utils.ts";
import {OllamaCommand} from "./chat-commands/ollama.ts";
import {SetModel} from "./chat-commands/set-model.ts";
import {GetModel} from "./chat-commands/get-model.ts";

Environment.load();

export let model = Environment.OLLAMA_MODEL;

export function setModel(newModel: string) {
    model = newModel;
}

export const bot = new TelegramBot({botToken: Environment.BOT_TOKEN, testEnvironment: Environment.TEST_ENVIRONMENT});
export const ollama = new Ollama({host: Environment.OLLAMA_HOST});

const chatCommands: ChatCommand[] = [
    new OllamaCommand(),
    new SetModel(),
    new GetModel()
];

async function main() {
    try {
        await bot.startPolling();
    } catch (error) {
        console.error(error);
        return;
    }

    console.log(`Bot started! testEnvironment: ${Environment.TEST_ENVIRONMENT}`);
}

bot.on('message:text', async (message) => {
    console.log(message);

    if (message.chat.type === 'private' && !Environment.ADMIN_IDS.includes(message.chat.id)) return;
    await findAndExecuteChatCommand(chatCommands, message);
});

main().catch(console.error);