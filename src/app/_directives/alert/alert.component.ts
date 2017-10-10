import { Component, OnInit } from '@angular/core';

import { AlertService } from '../../_services/alert.service';

@Component({
  selector: 'alert',
  templateUrl: 'alert.component.pug'
})

export class AlertComponent implements OnInit {
  public message: any;

  constructor(private alertService: AlertService) {
  }

  public ngOnInit() {
    this.alertService.getMessage().subscribe((message) => {
      this.message = message;
    });
  }
}
