import { Products } from './products';
export interface cart {
    total: number;
    data: [
        {
            product: Products,
            numInCart: number
        }
    ];
}

export interface cartPublic {
    total: number;
    data: [
        {
            id: number,
            numInCart: number
        }
    ];
}

