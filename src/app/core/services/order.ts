import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Order as OrderModel } from '../models/order';

@Injectable({
  providedIn: 'root',
})
export class Order {
  
  http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:3000/api';

  create(order: OrderModel) : Observable<OrderModel> {
    return this.http.post<OrderModel>(`${this.baseUrl}/orders`, order);
  }
}
