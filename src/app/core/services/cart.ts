import { inject, Injectable } from '@angular/core';
import { ProductApi } from './product-api';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Cart {
  
  product$ = inject(ProductApi);

  list() {
    return this.product$.list().pipe(
      map(products => products.slice(0, 5))
    );
  }
}
