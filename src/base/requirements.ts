import {Requirement} from "./requirement";

export class Requirements {
    requirements: Requirement[];

    private constructor(requirements?: Requirement[]) {
        this.requirements = requirements || [];
    }

    static Build(...requirements: Requirement[]): Requirements {
        return new Requirements(requirements);
    }

    static Empty(): Requirements {
        return new Requirements();
    }

    isRequiresBotAdmin(): boolean {
        return this.requirements.includes(Requirement.BOT_ADMIN);
    }
}