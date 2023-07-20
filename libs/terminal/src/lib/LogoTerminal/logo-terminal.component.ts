import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { Terminal, TerminalService } from 'primeng/terminal';
import { LogoService } from '@logo-backend/services';
import { Subject, Subscription } from 'rxjs';
@Component({
  selector: 'logo-backend-logo-terminal',
  templateUrl: './logo-terminal.component.html',
  styleUrls: ['./logo-terminal.component.scss'],
  providers: [TerminalService],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.Default,
})
export class LogoTerminalComponent implements OnDestroy {
  @ViewChild(Terminal) pTerminal: any;
  @ViewChild('renderResult') renderResultHolder: any;
  isRenderResult = false;
  private websocketSubscription: Subscription | undefined;

  private subject: Subject<string> = new Subject();

  constructor(
    private terminalService: TerminalService,
    private logoService: LogoService
  ) {
    this.logoService.setupLogoSocket();
    if (!this.websocketSubscription) {
      this.websocketSubscription = this.logoService.connect()?.subscribe(
        (message) => {
          this.subject.next(message);
          console.log(message);
        },
        (error) => {
          console.log(`socket error ${error}`);
        },
        () => {
          console.log(`socket connection closed`);
        }
      );
      this.subject.subscribe((response) => {
        this.isRenderResult = response.includes('\r\n\r\n');

        if (!this.isRenderResult) {
          this.terminalService.sendResponse(response);
        } else {
          let holderElement: any;
          if (!document.getElementById('contentHolder')) {
            holderElement = document.createElement('div');
            holderElement.id = 'contentHolder';
          } else {
            holderElement = document.getElementById('contentHolder');
          }

          let lines = response.split('\r\n').filter((item) => item);
          lines.forEach((item) => {
            const textRow = document.createElement('pre');
            textRow.textContent = item;
            holderElement.appendChild(textRow);
          });

          document.getElementById('renderResult')?.appendChild(holderElement);
        }
        this.pTerminal.cd.markForCheck();
      });
    }

    this.terminalService.commandHandler.subscribe((command) => {
      this.isRenderResult = false;
      document.getElementById('contentHolder')?.remove();
      this.logoService.sendMessage(command);
    });
  }

  ngOnDestroy(): void {
    if (this.websocketSubscription) {
      this.websocketSubscription.unsubscribe();
    }
  }
}
