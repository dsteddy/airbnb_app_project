export interface User {
    host_id: number;
    name: string;
    email: string;
    password: string;
    description?: string;
    picture_url?: string;
    housing?: number[];
    is_host: 0 | 1;
}