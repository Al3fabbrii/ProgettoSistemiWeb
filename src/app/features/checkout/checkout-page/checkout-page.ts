import { JsonPipe } from '@angular/common';
import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from "@angular/material/select";
import { Cart } from '../../../core/services/cart';
import { Order } from '../../../core/services/order';
import { map } from 'rxjs/operators';
import { take } from 'rxjs/operators';
import { Order as OrderModel } from '../../../core/models/order';

@Component({
  selector: 'app-checkout-page',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule,
    JsonPipe
  ],
  templateUrl: './checkout-page.html',
  styleUrl: './checkout-page.scss',
})
export class CheckoutPage {

  private fb = inject(FormBuilder);
  private cart = inject(Cart);
  private orderService = inject(Order);

  readonly item$ = this.cart.list();
  readonly total$ = this.item$.pipe(
    // Calculate total price
    // Assuming each product has a 'price' property
    map(items => items.reduce(
      (sum, item) => sum + (item.price || 0), 0))
  );

  loading = false;
  orderSuccess = false;
  orderError = false;
  showSummary = false;

  getControl(path: string) {
    return this.form.get(path);
  }

  hasError(path: string, error: string): boolean {
    const control = this.getControl(path);
    return !!control && control.hasError(error) && control.touched;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.showSummary = true;
      this.focusFirstInvalid();
      return;
    }
    this.loading = true;
    this.orderSuccess = false;
    this.orderError = false;
    const value = this.form.getRawValue();
    this.item$.pipe(take(1)).subscribe(items => {
      const order: OrderModel = {
        customer: value.customer!,
        address: value.address!,
        items,
        total: items.reduce(
          (sum, it) => sum + it.price, 0),
        createdAt: new Date()
      };
      this.orderService.create(order).subscribe({
        next: () => {
          this.loading = false;
          this.orderSuccess = true;
          this.form.reset();
        },
        error: () => {
          this.loading = false;
          this.orderError = true;
        }
      });
    });
  }

  private focusFirstInvalid(): void {
    const firstInvalidControl =
      document.querySelector('form .ng-invalid[formControlName]') as HTMLElement | null;
    firstInvalidControl?.focus();
  }

  readonly form = this.fb.group({
    customer: this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
    }),
    address: this.fb.group({
      street: ['', [Validators.required]],
      city: ['', [Validators.required]],
      zip: ['', [Validators.required, Validators.pattern('^[0-9]{5}$')]],
    }),
    shippingMethod: ['standard', [Validators.required]],
    privacy: [false, [Validators.requiredTrue]],
  });
}