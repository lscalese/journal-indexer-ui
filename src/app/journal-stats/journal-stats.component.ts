import {Component, OnInit} from '@angular/core';
import { JournalService } from "../journal/journal.service";
import {Stats} from "../models/stats";
import {ActivatedRoute, Router} from "@angular/router";
import { PrettyBytesPipe} from "../pretty-bytes.pipe";
import {StatsData} from "../models/stats-data";
import {Journal} from "../models/journal";
import {AppState} from "../app-state";
import {select, Store} from "@ngrx/store";
import {Observable} from "rxjs";

@Component({
  selector: 'app-journal-stats',
  templateUrl: './journal-stats.component.html',
  styleUrls: ['./journal-stats.component.css']
})
export class JournalStatsComponent implements OnInit {

  stats?: Stats;

  selectedJournal?: Observable<Journal>
  constructor(private journalService:JournalService,
              private activatedRoute: ActivatedRoute,
              private store: Store<AppState>) {


  }

  ngOnInit(): void {
    let id = this.activatedRoute.snapshot.paramMap.get('id')
    if (id) {
      this.journalService.getStats(parseInt(<string>id)).subscribe(stats => { this.stats = stats })
      this.activatedRoute.params.subscribe(routeParams => {
        this.journalService.getStats(parseInt(routeParams['id'])).subscribe(stats => { this.stats = stats })
      })

    }

  }

  getOtherCount(statsData: StatsData): number {
    return statsData.Count - ( statsData.Details.SET - statsData.Details.KILL - statsData.Details.ZKILL )
  }



}
