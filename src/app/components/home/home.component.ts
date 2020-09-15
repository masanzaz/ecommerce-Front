import { Products } from './../../models/products';
import { Component, OnInit } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  products: Products[] = [];
  constructor(private productService: ProductService,
              private router: Router) { }

  ngOnInit(): void {
    this.productService.showMessage();

    this.productService.getAllProducts().subscribe((prods: Products[] ) => {
      this.products = prods;
    });
  }

  OnSelectProduct(id: Number) {
    this.router.navigate(['/products', id]).then();
  }

}
