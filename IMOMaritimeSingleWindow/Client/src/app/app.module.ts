import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, XHRBackend } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { JwtHelperService, JwtModule } from '@auth0/angular-jwt';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AuthenticateXHRBackend } from '../authenticate-xhr.backend';
import { AppRoutingModule, routedComponents } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/guards/auth.guard';
import { EmailConfirmationGuard } from './auth/guards/email-confirmation.guard';
import { ErrorGuard } from './auth/guards/error.guard';
import { LoginAuthGuard } from './auth/guards/login-auth.guard';
import { PasswordResetGuard } from './auth/guards/password-reset.guard';
import { PasswordChangeComponent } from './auth/password-change/password-change.component';
import { PasswordResetComponent } from './auth/password-reset/password-reset.component';
import { ContentContainerModule } from './main-content/content-container/content-container.module';
import { FooterComponent } from './main-content/footer/footer.component';
import { HeaderComponent } from './main-content/header/header.component';
import { AccountService } from './shared/services/account.service';
import { AuthService } from './shared/services/auth-service';
import { AuthRequest } from './shared/services/auth.request.service';
import { ConstantsService } from './shared/services/constants.service';
import { ContentService } from './shared/services/content.service';
import { LoginService } from './shared/services/login.service';
import { ConfigService } from './shared/utils/config.service';

@NgModule({
  imports: [
    AppRoutingModule,
    AuthModule,
    BrowserModule,
    ContentContainerModule,
    FormsModule,
    HttpClientModule,
    HttpModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        whitelistedDomains: ['localhost:4200'],
        blacklistedRoutes: ['localhost:4200/login']
      }
    }),
    NgbModule.forRoot(),
  ],
  declarations: [
    AppComponent,
    FooterComponent,
    HeaderComponent,
    PasswordChangeComponent,
    PasswordResetComponent,
    routedComponents,
  ],
  providers: [
    { provide: XHRBackend, useClass: AuthenticateXHRBackend },
    AccountService,
    AuthGuard,
    AuthRequest,
    AuthService,
    ConfigService,
    ConstantsService,
    ContentService,
    EmailConfirmationGuard,
    ErrorGuard,
    JwtHelperService,
    LoginAuthGuard,
    LoginService,
    PasswordResetGuard,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function tokenGetter() {
  return localStorage.getItem('auth_token');
}
