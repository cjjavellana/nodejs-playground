
export class WebSocketRequest {
    public requestId: string;
}

export class AuthToken extends WebSocketRequest {
    public token: string;
}

export class User {
    public username: string;
    public groups: Group[];
    public permissions: Permission[];

    constructor(username: string, groups: Group[], permissions: Permission[]) {
        this.username = username;
        this.groups = groups;
        this.permissions = permissions;
    }
}

export class Group {
    public name: string;

    constructor(name: string) {
        this.name = name;
    }
}

export class Permission {
    public module: string;
    public action: string;
    public authority: Authority;

    constructor(module: string, action: string, authority: Authority) {
        this.module = module;
        this.action = action;
        this.authority = authority;
    }
}

export enum Authority {
    READ, WRITE, READ_WRITE
}

export class Metrics {
    public metrics: string;
    public periodStart: Date;
    public periodEnd: Date;
    public value: number;
}
