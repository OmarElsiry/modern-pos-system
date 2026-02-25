export interface BaseRepository<T> {
    findById(id: string): Promise<T | null>;
    findAll(filters?: any): Promise<T[]>;
    create(item: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
    update(id: string, item: Partial<T>): Promise<T>;
    delete(id: string): Promise<void>;
}
