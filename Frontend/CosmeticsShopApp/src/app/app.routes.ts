import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginComponent } from './components/login/login';
import { RegisterComponent } from './components/register/register';
import { ProductsComponent} from './components/products/products';
import { ProductDetailComponent } from './components/product-detail/product-detail';
import { CartComponent } from './components/cart/cart';
import { Checkout } from './components/checkout/checkout';
import { OrderSuccessComponent } from './components/order-success/order-success';
import { ProfileComponent} from './components/profile/profile';
import { DashboardComponent } from './components/admin/dashboard/dashboard';
import { ManageProductsComponent } from './components/admin/manage-products/manage-products';
import { ManageOrdersComponent } from './components/admin/manage-orders/manage-orders';
import { ManageUsersComponent } from './components/admin/manage-users/manage-users';
import { TransactionsComponent } from './components/admin/transactions/transactions';
import { authGuard } from './guards/auth-guard';
import { BeautyQuizComponent } from './components/beauty-quiz/beauty-quiz';
import { ShadeFinderComponent } from './components/shade-finder/shade-finder';
import { adminGuard } from './guards/admin.guard';
import { WishlistComponent } from './components/wishlist/wishlist';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'products/:id', component: ProductDetailComponent },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'checkout', component: Checkout, canActivate: [authGuard] },
  { path: 'order-success', component: OrderSuccessComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'admin', component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/products', component: ManageProductsComponent, canActivate: [adminGuard] },
  { path: 'admin/orders', component: ManageOrdersComponent, canActivate: [adminGuard] },
  { path: 'admin/users', component: ManageUsersComponent, canActivate: [adminGuard] },
  { path: 'admin/transactions', component: TransactionsComponent, canActivate: [adminGuard] },
  { path: 'beauty-quiz', component: BeautyQuizComponent },
  { path: 'shade-finder', component: ShadeFinderComponent },
  { path: 'wishlist', component: WishlistComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];