export class DefaultError {
    static generate(code: number, message: string | any) {
        return {
            code,
            message
        }
    }
}