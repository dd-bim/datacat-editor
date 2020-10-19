export type FormProps<T> = {
    id: string,
    onDelete(value: T): void
}
