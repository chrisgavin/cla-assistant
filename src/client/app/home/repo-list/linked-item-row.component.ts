import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {TOOLTIP_DIRECTIVES} from 'ng2-tooltip';
import {POPOVER_DIRECTIVES} from 'ng2-popover';

import { RepoLink } from './repo-link.component';
import { OrgLink } from './org-link.component';
import { StatusIndicatorComponent } from './status-indicator.component';
import { ReportModal } from './report/report.modal';

import { ClaBackendService } from '../../shared/claBackend/claBackend.service';
import { GithubService, Gist } from '../../shared/github';
import { LinkedItem } from '../../shared/claBackend/';

@Component({
  selector: 'linked-item-row',
  directives: [
    RepoLink,
    OrgLink,
    StatusIndicatorComponent,
    ReportModal,
    TOOLTIP_DIRECTIVES,
    POPOVER_DIRECTIVES],
  templateUrl: 'linked-item-row.component.html'
})

export class LinkedItemRowComponent implements OnInit {
  @Input() public item: LinkedItem;
  @Output() public onUnlink: EventEmitter<LinkedItem>;

  private gist: Gist = {
    fileName: '',
    url: '',
    updatedAt: null,
    history: []
  };
  private gistValid: boolean = false;
  private webhookValid: boolean = false;
  private numOfSignatures = 0;

  constructor(
    private claBackendService: ClaBackendService,
    private githubService: GithubService
  ) {
    this.onUnlink = new EventEmitter<LinkedItem>();
  }

  public ngOnInit() {
    this.githubService.getGistInfo(this.item.gist).subscribe(
      (gist: Gist) => {
        if (gist) {
          this.gist = gist;
          this.gistValid = true;
          this.getClaSignatures(gist.history[0].version);
        }
      },
      (error) => {
        console.log(error);
      }
    );
    this.claBackendService.getWebhook(this.item).subscribe(
      webhook => {
        if (webhook) { this.webhookValid = webhook.active; }
      },
      () => this.webhookValid = false
    );
  }

  private getClaSignatures(version: string) {
    this.claBackendService.getClaSignatures(this.item, version).subscribe(
      signatures => this.numOfSignatures = signatures.length
    );
  }

  public isValid() {
    return this.gistValid && this.webhookValid;
  }
}
