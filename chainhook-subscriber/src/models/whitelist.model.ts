export interface Whitelist {
    action: Action;
    "asset-contract": Action;
    type: Action;
    whitelisted: Whitelisted;
}

export interface Action {
    type: string;
    value: string;
}

export interface Whitelisted {
    type: string;
    value: boolean;
}
