import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LogoTerminalComponent } from './logo-terminal.component';

describe('LogoTerminalComponent', () => {
  let component: LogoTerminalComponent;
  let fixture: ComponentFixture<LogoTerminalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LogoTerminalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LogoTerminalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
