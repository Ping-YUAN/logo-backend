import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalModule as PrimengTerminal } from 'primeng/terminal';
import { LogoTerminalComponent } from './LogoTerminal/logo-terminal.component';
@NgModule({
  imports: [CommonModule, PrimengTerminal],
  exports: [LogoTerminalComponent],
  declarations: [LogoTerminalComponent],
})
export class TerminalModule {}
