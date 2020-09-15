export interface Products {
    id: number;
    title: string;
    category: string;
    description: string;
    price: number;
    quantity: number;
    image: string;
    images: string;
}

export interface ServerResponse {
    count: number;
    products: Products[];
}

