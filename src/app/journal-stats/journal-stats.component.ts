import {Component, OnInit} from '@angular/core';
import { JournalService } from "../journal/journal.service";
import {Stats} from "../models/stats";
import {ActivatedRoute, Router} from "@angular/router";
import {StatsData} from "../models/stats-data";
import {TypeDetails} from "../models/type-details";

@Component({
  selector: 'app-journal-stats',
  templateUrl: './journal-stats.component.html',
  styleUrls: ['./journal-stats.component.css']
})
export class JournalStatsComponent implements OnInit {

  stats?: Stats;

  selectedStatsData?: StatsData;

  currentJournal: string = '0';

  state: string = '';

  constructor(private journalService:JournalService,
              private activatedRoute: ActivatedRoute,
              private router: Router,) {


  }

  ngOnInit(): void {
    let id = this.activatedRoute.snapshot.paramMap.get('id')

    if (id) {
      this.currentJournal = id

      this.state = 'loading'
      // this.journalService.getStats(parseInt(<string>id)).subscribe(stats => { this.stats = stats })
      this.journalService.getStats(parseInt(<string>id)).subscribe({
        next: (stats: Stats) => {
          this.stats = stats
          this.state = 'loaded'
        },
        error: (err: any)=> {
          this.state = 'error'
        },
        complete: () => {
          this.state = ''
        }
      })

      this.activatedRoute.params.subscribe(routeParams => {
        this.journalService.getStats(parseInt(routeParams['id'])).subscribe(stats => { this.stats = stats })
      })
      this.journalService.updateIndexedJournals()
    }

  }

  getOtherCount(statsData: StatsData): number {
    return statsData.Count - ( statsData.Details.SET + statsData.Details.KILL + statsData.Details.ZKILL )
  }

  searchGlobal(global: string) {
    let gbl = '^' + global.substring(global.indexOf(']')+1, global.length)
    this.router.navigate(['/show', this.currentJournal], { queryParams: { global: gbl}})
  }

  searchDatabase( db: string) {
    this.router.navigate(['/show', this.currentJournal], { queryParams: { database: db}})
  }

  searchPID( pid: string) {
    this.router.navigate(['/show', this.currentJournal], { queryParams: { pid: pid }})
  }

  getCount(key: string, details: TypeDetails): number|undefined {
    let str = key as keyof typeof details;
    return details[str];
  }

}
