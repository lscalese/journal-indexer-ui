import {Component, OnInit} from '@angular/core';
import {select, Store} from "@ngrx/store";
import {JournalService} from "../../journal/journal.service";
import {AppState} from "../../app-state";
import {Journal} from "../../models/journal";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {Filter} from "../../models/filter";
import {FilterProperties} from "../../models/filter-properties";
import {ShowServices} from "../show-services.service";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent implements OnInit{

  journals: Journal[] = []
  filterForm: FormGroup = new FormGroup({});

  dbList: string[] = [ ]

  globalList: string[] = [ ]

  journalTypeList= ['SET', 'KILL', 'ZKILL', 'RemoteSET', 'RemoteKILL', 'RemoteZKILL', 'MirrorSET', 'MirrorKILL']

  selectedJournal?: Journal;

  showFilter = true

  control?: FormArray;

  constructor(private journalService:JournalService,
              private store: Store<AppState>,
              private formBuilder: FormBuilder,
              private showService: ShowServices,
              private route: ActivatedRoute) {
  }
  ngOnInit(): void {
    const tsRegex= /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}$/
    const numberOrEmptyRegExp = /^[0-9]\d*$/

    this.filterForm = this.formBuilder.group({
      File: this.formBuilder.group({Operator: ['='], Value:['', Validators.required]}),
      DatabaseName: this.formBuilder.group({Operator: ['='], Value:['']}),
      GlobalName: this.formBuilder.group({Operator: ['='], Value:['']}),
      ProcessID: this.formBuilder.group({Operator: ['='], Value:['', Validators.pattern(numberOrEmptyRegExp)]}),
      Type: this.formBuilder.group({Operator: ['='], Value:['']}),
      TimeStamp: this.formBuilder.group({
        Operator: ['between'],
        Start: ['', Validators.pattern(tsRegex)],
        End: ['', Validators.pattern(tsRegex)]},{
        validators: [filterPropertiesValidator()]}),
      Address: this.formBuilder.group({
        Operator: ['between'],
        Start: ['', Validators.pattern(numberOrEmptyRegExp)],
        End: ['', Validators.pattern(numberOrEmptyRegExp)]},{
        validators: [filterPropertiesValidator()]}),
      NewValue: this.formBuilder.group({
        Operator: ['='],
        Start: [''],
        End: [''],
        Position: ['', Validators.pattern(numberOrEmptyRegExp)]},{
        validators: [filterPropertiesValidator()]}),
      OldValue: this.formBuilder.group({
        Operator: ['='],
        Start: [''],
        End: [''],
        Position: ['', Validators.pattern(numberOrEmptyRegExp)]},{
        validators: [filterPropertiesValidator()]}),
      SubscriptsSize: this.formBuilder.group({
        Operator: ['between'],
        Start: ['', Validators.pattern(numberOrEmptyRegExp)],
        End: ['', Validators.pattern(numberOrEmptyRegExp)]},{
        validators: [filterPropertiesValidator()]}),
      Subscripts: this.formBuilder.array([])
    })

    this.control = <FormArray>this.filterForm.controls['Subscripts']
    this.control.push(this.patchValues(1, '=', '', '', ''))

    this.journalService.updateIndexedJournals();
    this.store.pipe(select('indexedJournal')).subscribe(indexedJournals => {
      this.journals = indexedJournals;
      this.route.params.subscribe(params => {
        if ((params['id'] !== undefined) &&(params['id'] !== '')) {
          this.filterForm.controls['File'].setValue( { Operator: "=",  Value: parseInt(params['id'])})
          this.onSelectJournal()
        }
      })
    })

    this.route.queryParams.subscribe(params => {
      if ((params['global'] !== undefined) &&(params['global'] !== '')) {
        this.filterForm.controls['GlobalName'].setValue( {Operator: "=", Value: params['global'] })
      }
      if ((params['database'] !== undefined) &&(params['database'] !== '')) {
        this.filterForm.controls['DatabaseName'].setValue( {Operator: "=", Value: params['database'] })
      }
      if ((params['pid'] !== undefined) &&(params['pid'] !== '')) {
        this.filterForm.controls['ProcessID'].setValue( {Operator: "=", Value: params['pid'] })
      }
    })

  }

  // assign the values
  patchValues(position: number, operator:string, start: string, end: string, logical: string) {
    return this.formBuilder.group({
      Position: [position, Validators.pattern(/^[0-9]\d*$/)],
      Operator: [operator, Validators.required],
      Start: [start],
      End: [end],
      Logical: [logical]
    }, {
      validators: filterPropertiesValidator()
    })
  }
  onSubmit() {
    const filter: Filter = this.filterForm.value;
    this.showService.updateFilter(filter)

    if ((filter.TimeStamp?.Start === this.selectedJournal?.FirstRecordTS) && (filter.TimeStamp?.End === this.selectedJournal?.LastRecordTS)) {
      /// we can ignore this filter
      if (filter.TimeStamp !== undefined) {
        filter.TimeStamp.Start = ''
        filter.TimeStamp.End = ''
      }
    }

    if ((filter.Address?.Start === this.selectedJournal?.FirstRecord) && (filter.Address?.End === this.selectedJournal?.LastRecord)) {
      /// we can ignore this filter
      if (filter.Address !== undefined) {
        filter.Address.Start = ''
        filter.Address.End = ''
      }
    }

    if (this.selectedJournal !== undefined) {
      this.showService.setSelectedJournal(this.selectedJournal)
    }
    this.showFilter = false;
  }

  onSelectJournal() {
    let id = this.filterForm.controls['File'].value['Value']
    console.log('onselect', id)
    if (id == '0') return

    console.log(this.journals)
    this.selectedJournal = this.journals.find( (element: Journal) => element.ID == id )
    console.log('onselect', this.selectedJournal)
    if (this.selectedJournal === undefined) return;

    this.filterForm.controls['TimeStamp'].patchValue({Start: this.selectedJournal.FirstRecordTS, End: this.selectedJournal.LastRecordTS})
    this.filterForm.controls['Address'].patchValue({Start: this.selectedJournal.FirstRecord, End: this.selectedJournal.LastRecord})
    this.updateGlobalList()
    this.journalService.getDatabases(id).subscribe(databases => {
      this.dbList = databases
    })
    return
  }
  trackByFn(index:number, item:any) {
    return index;
  }

  addSubscriptFilter() {
    if (this.control === undefined) return

    this.control.push(this.patchValues(1, '=', '', '', 'AND'))
    return
  }

  deleteSubscriptFilter(i: number) {
    if (this.control === undefined) return

    this.control.removeAt(i)
    return
  }
  onSelectDB() {
    this.updateGlobalList()
  }

  updateGlobalList() {
    let id = this.filterForm.controls['File'].value['Value']
    if (id == '0') return
    let selectedDb = this.filterForm.controls['DatabaseName'].value['Value']
    this.journalService.getGlobals(id,selectedDb).subscribe(globals => {
      this.globalList = globals
    })
  }

  resetForm() {

    if (this.control !== undefined) {
      while (this.control.length > 1) {
        this.control.removeAt(this.control.length - 1)
      }
    }

    this.filterForm.reset({
      Subscripts:[{
        Operator: '=',
        Value: '',
        Start: '',
        End: '',
        Position: ''
      }]
    })
  }
}

export function filterPropertiesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    let filterProperties: FilterProperties = control.value
    let valid = true;
    let between: boolean = true;

    if (filterProperties.Operator === 'between') {
      valid = ((filterProperties.Start === '') && (filterProperties.End === ''))
        || ((filterProperties.Start !== '') && (filterProperties.End !== ''));

      if (valid) {
        if (!isNaN(Number(filterProperties.Start)) && !isNaN(Number(filterProperties.End))) {
          valid = !(Number(filterProperties.Start) > Number(filterProperties.End))
        } else {
          const order = [filterProperties.Start, filterProperties.End].sort()
          valid = (order[0] == filterProperties.Start)
        }
      }
      between = !valid
    }
    if (!valid) {
      control.setErrors({between: true})
    }

    return !valid ? { between: between} : null;
  }
}
