import {Component, OnInit} from '@angular/core';
import {IndexerProgression} from "../models/indexer-progression";
import {JournalService} from "../journal/journal.service";
import {ActivatedRoute, Router} from "@angular/router";
import { Store, select } from "@ngrx/store";
import { UpdateProgression } from "../journals/journal.actions";
import {Observable} from "rxjs";
import {AppState} from "../app-state";
import {IndexerProgressionReducer} from "../journals/journal.reducer";
import {JournalFileService} from "../journal/journal-file.service";

@Component({
  selector: 'app-journal-progression',
  templateUrl: './journal-progression.component.html',
  styleUrls: ['./journal-progression.component.css']
})
export class JournalProgressionComponent implements OnInit {

  indexerProgression: IndexerProgression =  {};

  progression$: Observable<IndexerProgression>;

  token: string = '';

  interval: any;

  constructor(private fileService: JournalFileService,
              private activatedRoute: ActivatedRoute,
              private store:Store<AppState>) {
    this.progression$ = store.pipe(select('progression'))
    this.progression$.subscribe(progression => {
      this.indexerProgression = progression
      //if ((progression.Status == 'Done') || (progression.Status == 'ERR')) clearInterval(this.interval);
    })
  }

  ngOnInit() {
    this.token = <string>this.activatedRoute.snapshot.paramMap.get('token');

    /*this.interval = setInterval(() => {
      this.refresh();
    }, 500);*/

  }
  flushBuffer(): string {
    if (this.indexerProgression.Action == 'FB') {
      return 'In Progress ...'
    }

    if (this.indexerProgression.Flush == 'OK') {
      return 'Done.'
    }

    return 'Not started.'
  }

  buildIndices(): string {
    if (this.indexerProgression.Action == 'BI') {
      return 'In Progress ...'
    }

    if (this.indexerProgression.BuildIndices == 'OK') {
      return 'Done.'
    }

    return 'Not started.'
  }

  refresh() {
    if (this.token == '') return;
    console.log("send refresh.")
    this.fileService.progression(this.token)
  }
}
