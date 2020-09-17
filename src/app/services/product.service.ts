import { Products } from './../models/products';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  server_url = environment.server_url;

  constructor(private http: HttpClient) { }

  showMessage() {
  }

  getAllProducts(limitOfResults=10): Observable<Products[]>{
    return this.http.get<Products[]>(this.server_url + 'products', {
      params: {
        limit: limitOfResults.toString()
      }
    });
  }
  
  getProductById(id: number): Observable<Products> {
    return this.http.get<Products>(this.server_url + 'products' + id);
  }

  getProductByCategory(categoryId: number): Observable<Products[]> {
    return this.http.get<Products[]>(this.server_url + 'products/' + categoryId + 'category');
  }
  
}
