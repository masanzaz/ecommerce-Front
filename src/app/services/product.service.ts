import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  server_url = environment.server_url;

  constructor(private http: HttpClient) { }

  showMessage() {
  }

  getAllProducts(limitOfResults=10){
    return this.http.get(this.server_url + 'products', {
      params: {
        limit: limitOfResults.toString()
      }
    });
  }
  
  getAllProductById() {
    
  }
  
}
