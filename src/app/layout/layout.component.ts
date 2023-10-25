import {ChangeDetectorRef, Component} from '@angular/core';
import {LoginService} from "../login/login.service";
import {Journal} from "../models/journal";
import {TempStoreService} from "../journal/temp-store.service";
import {select, Store} from "@ngrx/store";
import {AppState} from "../app-state";
import {JournalService} from "../journal/journal.service";
import {WebsocketService} from "../websocket.service";
import {NavigationEnd, Router} from "@angular/router";

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent {

  indexedJournals: Journal[] = []

  showNavBar = true;

  currentProgressionToken = '';
  constructor(private loginService: LoginService,
              private store:Store<AppState>,
              private router: Router,
              private cd: ChangeDetectorRef) {
    //this.journalService.updateIndexedJournals();
    this.store.pipe(select('indexedJournal')).subscribe(indexedJournals => {
      this.indexedJournals = indexedJournals;
    })

    this.router.events.subscribe(val => {
      if (val instanceof NavigationEnd) {
        this.showNavBar = (val.url != '/login')
        this.cd.detectChanges()
      }
    });

    this.store.pipe(select('progression')).subscribe(progression => {
      if (progression.Token !== undefined) this.currentProgressionToken = progression.Token
    })

  }



  disconnect() {
    this.loginService.disconnect()
  }
}
