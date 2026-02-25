import { Product, ProductInput, ProductFilters } from '../../types/models';
import { BaseRepository } from '../types';

export class WebProductRepository implements BaseRepository<Product> {
    private products: Product[] = [];

    constructor() {
        // Initial mock data
        console.warn('Using WebProductRepository (Mock mode)');
        this.products = [
            {
                id: '1',
                name: 'منتج تجريبي 1',
                barcode: '123456',
                wholesalePrice: 8,
                retailPrice: 10,
                purchasePrice: 5,
                stockQuantity: 100,
                categoryId: '1',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                id: '2',
                name: 'منتج تجريبي 2',
                barcode: '789012',
                wholesalePrice: 20,
                retailPrice: 25,
                purchasePrice: 15,
                stockQuantity: 50,
                categoryId: '1',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ];
    }

    async findById(id: string): Promise<Product | null> {
        return this.products.find(p => p.id === id) || null;
    }

    async findAll(filters?: ProductFilters): Promise<Product[]> {
        let result = [...this.products];
        if (filters?.searchTerm) {
            const term = filters.searchTerm.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(term) ||
                p.barcode.toLowerCase().includes(term)
            );
        }
        return result;
    }

    async create(input: ProductInput): Promise<Product> {
        const newProduct: Product = {
            ...input,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        this.products.push(newProduct);
        return newProduct;
    }

    async update(id: string, updates: Partial<ProductInput>): Promise<Product> {
        const index = this.products.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Product not found');

        this.products[index] = {
            ...this.products[index],
            ...updates,
            updatedAt: new Date()
        } as Product;

        return this.products[index];
    }

    async delete(id: string): Promise<void> {
        this.products = this.products.filter(p => p.id !== id);
    }

    async findByBarcode(barcode: string): Promise<Product | null> {
        return this.products.find(p => p.barcode === barcode) || null;
    }
}
