import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Products } from '../models/products';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private serverUrl = environment.server_url;
  products: Products[] =[];

  constructor(private http: HttpClient) { }

  getorderById(id:number) {
    return this.http.get(this.serverUrl + 'orders' + id).toPromise();
  }

}
