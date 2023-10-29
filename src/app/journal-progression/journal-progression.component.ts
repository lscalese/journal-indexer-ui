import {Component, OnInit} from '@angular/core';
import {IndexerProgression} from "../models/indexer-progression";
import {ActivatedRoute, Router} from "@angular/router";
import { Store, select } from "@ngrx/store";
import {Observable} from "rxjs";
import {AppState} from "../app-state";
import {JournalFileService} from "../journal/journal-file.service";
import {JournalService} from "../journal/journal.service";

@Component({
  selector: 'app-journal-progression',
  templateUrl: './journal-progression.component.html',
  styleUrls: ['./journal-progression.component.css']
})
export class JournalProgressionComponent implements OnInit {

  indexerProgression: IndexerProgression =  {};

  progression$: Observable<IndexerProgression>;

  token: string = '';

  constructor(private fileService: JournalFileService,
              private activatedRoute: ActivatedRoute,
              private store:Store<AppState>,
              private journalService: JournalService,
              private router: Router) {
    this.progression$ = this.store.pipe(select('progression'))
    this.progression$.subscribe(progression => {
      this.indexerProgression = progression
      if (this.indexerProgression.Status == 'Done') {
        console.log('update indexed journal')
        this.journalService.updateIndexedJournals()
      }
    })
  }

  ngOnInit() {
    this.token = <string>this.activatedRoute.snapshot.paramMap.get('token');
    // this.activatedRoute.params.subscribe(param => {
    //   this.token = param['token']
    // })
  }
  refresh() {
    if (this.token == '') return;
    console.log("send refresh.")
    this.fileService.progression(this.token)
  }

  showStats(id: string|undefined) {
    if (id !== undefined) {
      this.router.navigate(['/stats', id])
    }
  }
}
