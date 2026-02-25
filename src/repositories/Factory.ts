import { getPlatform } from '../utils/env';
import { ProductRepository } from './ProductRepository';
import { WebProductRepository } from './web/WebProductRepository';

export class RepositoryFactory {
    static getProductRepository() {
        const platform = getPlatform();
        if (platform === 'electron') {
            return new ProductRepository();
        }
        return new WebProductRepository() as any; // Temporary cast until ProductRepository is also async
    }
}
