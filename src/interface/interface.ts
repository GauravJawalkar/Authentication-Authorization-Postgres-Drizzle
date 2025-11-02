export interface TokenUser {
    id: string,
    name: string,
    lastName?: string,
    email: string,
    gender?: "male" | "female"
}