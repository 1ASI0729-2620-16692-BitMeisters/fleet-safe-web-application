import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { App } from './app';
describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({imports:[App],providers:[provideRouter([]),provideTranslateService()]}).compileComponents();
  });
  it('shows only the routed page while nobody is signed in', () => {
    const fixture=TestBed.createComponent(App);fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-layout')).toBeNull();
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });
  it('renders the shared FleetSafe application shell for a signed-in user', () => {
    localStorage.setItem('fleetsafe-session',JSON.stringify({token:'access-token',expiresAt:Date.now()+60_000,user:{id:'user-1',companyId:'company-1',email:'ana.quispe@andinos.pe',firstName:'Ana',lastName:'Quispe',role:'FLEET_SUPERVISOR',isActive:true}}));
    const fixture=TestBed.createComponent(App);fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-layout')).toBeTruthy();
  });
});
