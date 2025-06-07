import { TestBed } from '@angular/core/testing';
import { AuthGuard } from './auth.guard';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const authServiceSpy = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });

    guard = TestBed.inject(AuthGuard);
    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access when user is authenticated', () => {
    authService.isAuthenticated.and.returnValue(true);

    const result = guard.canActivate(
      {} as ActivatedRouteSnapshot,
      { url: '/dashboard' } as RouterStateSnapshot
    );

    expect(result).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not authenticated', () => {
    authService.isAuthenticated.and.returnValue(false);

    const result = guard.canActivate(
      {} as ActivatedRouteSnapshot,
      { url: '/dashboard' } as RouterStateSnapshot
    );

    expect(result).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/dashboard' }
    });
  });

  it('should handle different return URLs', () => {
    authService.isAuthenticated.and.returnValue(false);

    guard.canActivate(
      {} as ActivatedRouteSnapshot,
      { url: '/portfolio' } as RouterStateSnapshot
    );

    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/portfolio' }
    });
  });

  it('should handle root URL', () => {
    authService.isAuthenticated.and.returnValue(false);

    guard.canActivate(
      {} as ActivatedRouteSnapshot,
      { url: '/' } as RouterStateSnapshot
    );

    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/' }
    });
  });

  it('should handle URLs with query parameters', () => {
    authService.isAuthenticated.and.returnValue(false);

    guard.canActivate(
      {} as ActivatedRouteSnapshot,
      { url: '/dashboard?view=summary' } as RouterStateSnapshot
    );

    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/dashboard?view=summary' }
    });
  });

  it('should handle URLs with fragments', () => {
    authService.isAuthenticated.and.returnValue(false);

    guard.canActivate(
      {} as ActivatedRouteSnapshot,
      { url: '/dashboard#section1' } as RouterStateSnapshot
    );

    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/dashboard#section1' }
    });
  });

  it('should handle complex URLs', () => {
    authService.isAuthenticated.and.returnValue(false);

    guard.canActivate(
      {} as ActivatedRouteSnapshot,
      { url: '/dashboard/123/edit?mode=advanced#details' } as RouterStateSnapshot
    );

    expect(router.navigate).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/dashboard/123/edit?mode=advanced#details' }
    });
  });
}); 