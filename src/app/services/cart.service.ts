import { OrderService } from './order.service';
import { ProductService } from './product.service';
import { environment } from 'src/environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationExtras } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class CartService {

  private cartDataClient = {
    total: 0,
    prodData: [
      {
        inCart: 0,
        id: 0
      }
    ]
  }

  private cartDataServer = {
    total: 0,
    prodData: [
      {
        inCart: 0,
        id: undefined
      }
    ]
  }
  private serverUrl = environment.server_url;

  cartTotal$ = new BehaviorSubject<number>(0);
  cartData$ = new BehaviorSubject<any>(this.cartDataServer);


  constructor(private http: HttpClient,
              private productService: ProductService,
              private orderService: OrderService,
              private roter: Router)
               { 

    this.cartTotal$.next(this.cartDataServer.total);           
    this.cartData$.next(this.cartDataServer);

    let info = JSON.parse(localStorage.getItem('cart'));

    if (info!= null && info != undefined && info.prodData[0].inCart != 0)
    {
      this.cartDataClient = info;

      this.cartDataClient.prodData.forEach( p=> {
        this.productService.getProductById(p.id).subscribe((actual: any) => {
          if(this.cartDataServer.prodData[0].inCart ==0 ){
            this.cartDataServer.prodData[0].inCart = p.inCart;
            this.cartDataServer.prodData[0].id = p;

            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          } else {
            this.cartDataServer.prodData.push({
              inCart: p.inCart,
              id: p
            });
            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          }
          this.cartData$.next({... this.cartDataServer}); 
        });
      });

    }
  }


  AddProductToCart(id: number, quantity: number){
    this.productService.getProductById(id).subscribe(prod => {
      if(this.cartDataServer.prodData[0].id == undefined)
      {
        this.cartDataServer.prodData[0].id = prod;
        this.cartDataServer.prodData[0].inCart = (quantity != undefined)? quantity : 1;

        this.cartDataClient.prodData[0].inCart = this.cartDataServer.prodData[0].inCart;
        this.cartDataClient.prodData[0].id = prod.id;
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
        this.cartData$.next({... this.cartDataServer}); 
      }
      else
      {
        let index =  this.cartDataServer.prodData.findIndex(p=> p.id == prod.id);
        if(index != -1) {
          if( quantity != undefined && quantity <= prod.quantity)
          {
            this.cartDataServer.prodData[index].inCart = (this.cartDataServer.prodData[index].inCart < prod.quantity) ? quantity : prod.quantity;
          } else {
            this.cartDataServer.prodData[index].inCart = (this.cartDataServer.prodData[index].inCart < prod.quantity) ? this.cartDataServer.prodData[index].inCart++ : prod.quantity;
          }
          this.cartDataClient.prodData[index].inCart = this.cartDataServer.prodData[index].inCart;
        } else {
          this.cartDataServer.prodData.push({
            inCart: 1,
            id: prod
          });
          this.cartDataClient.prodData.push({
            inCart: 1,
            id: prod.id
          });

          this.cartDataClient.total = this.cartDataServer.total;
          localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          this.cartData$.next({... this.cartDataServer}); 
        }
      }
    });
  }

  UpdateCartItem(index:number, increase: boolean){
    let data = this.cartDataServer.prodData[index];
    if(increase)
    {
      data.inCart < data.id.quantity ? data.inCart++ : data.id.quantity;
      this.cartDataClient.prodData[index].inCart = data.inCart;
      this.cartDataClient.total = this.cartDataServer.total;
      localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      this.cartData$.next({... this.cartDataServer}); 
    } else {
      data.inCart--;
      if(data.inCart < 1) {
        this.cartData$.next({... this.cartDataServer}); 
      } else {
        this.cartData$.next({... this.cartDataServer}); 
        this.cartDataClient.prodData[index].inCart = data.inCart;

        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }
    }
  }

  DeleteProductFromCrt(index: number) {
    if(window.confirm('Are you sure you want to remove the item?'))
    {
      this.cartDataServer.prodData.splice(index, 1);
      this.cartDataClient.prodData.splice(index, 1);

      this.cartDataClient.total = this.cartDataServer.total;
      
      if(this.cartDataClient.total == 0) {
        this.cartDataClient = {
          total: 0, prodData: [{ id: 0, inCart: 0}]
        };
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      } else {
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }

      if(this.cartDataServer.total == 0) {
        this.cartDataServer = {
          total: 0, prodData: [{ id: undefined, inCart: 0}]
        };
        this.cartData$.next({... this.cartDataServer}); 
      } else {
        this.cartData$.next({... this.cartDataServer}); 
      }


    } else {
      return;
    }
  }

  private CaulculateTotal() {
    let total = 0;
    this.cartDataServer.prodData.forEach(p => {
      const {inCart} = p;
      const {price} = p.id.price;

      total += inCart * price;
    });

    this.cartDataServer.total = total;
    this.cartData$.next({... this.cartDataServer}); 
  }

 CheckOutFromCart(userId: number){
  this.http.post(this.serverUrl + 'orders/payment', null).subscribe((res: {succses: boolean}) => {
    if (res.succses)
    {
      this.resetServerData();
      this.http.post(this.serverUrl + 'orders/new', {
        userId: userId,
        products: this.cartDataClient.prodData
      }).subscribe((data: OrderResponse)=> {

        this.orderService.getorderById(data.order_id).then(prods=> {
          if(data.success) {
            const navigation: NavigationExtras = {
              state: {
                message: data.message,
                products: prods,
                orderId: data.order_id,
                total: this.cartDataClient.total
              }
            };
            this.roter.navigate(['/thankyou'], navigation).then(p=> {
              this.cartDataClient = {
                total: 0, prodData: [{ id: 0, inCart: 0}]
              };
              this.cartData$.next(0); 
              localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
            });
          }
        });
      });
    }
  });
 }

 private resetServerData() {
   this.cartDataServer = {
      total: 0,
      prodData: [
        {
          inCart: 0,
          id: undefined
        }
      ]
    };
    this.cartData$.next({... this.cartDataServer}); 
 }

 
}

interface OrderResponse {
  order_id: number;
  success: boolean;
  message: string;
  products: [
    {
      id: number,
      incart: number
    }
  ]

}
