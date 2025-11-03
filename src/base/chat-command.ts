import type {Message} from "typescript-telegram-bot-api";
import {Requirements} from "./requirements";

export abstract class ChatCommand {

    abstract regexp: RegExp;
    requirements?: Requirements = Requirements.Empty();

    abstract execute(
        msg: Message,
        match?: RegExpExecArray | null
    ): Promise<void>;
}