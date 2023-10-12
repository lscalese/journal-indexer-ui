import { Injectable } from '@angular/core';
import {environment} from "../../environments/environment";
import {HttpClient, HttpEvent, HttpEventType} from "@angular/common/http";
import {Store} from "@ngrx/store";
import {AppState} from "../app-state";
import {catchError, map, Observable, of, throwError} from "rxjs";
import {IndexStarted} from "../models/index-started";
import {IndexerProgression} from "../models/indexer-progression";
import {UpdateProgression} from "../journals/journal.actions";

@Injectable({
  providedIn: 'root'
})
export class JournalFileService {

  private apiUrl = environment.apiUrl

  private webApp = environment.webApp

  progress: number = 0;

  constructor(private http: HttpClient,
              private store: Store<AppState>) {

  }
  index(path: string, userDefinedName: string): Observable<IndexStarted> {
    return this.http.post<IndexStarted>(this.apiUrl + this.webApp + "/file", {
      "path": path,
      "userDefinedName": userDefinedName,
      "runTuneTable": false});
  }

  progression(token: string) {
    this.http.get<IndexerProgression>(this.apiUrl + this.webApp + "/file/progression/" + token)
      .subscribe(
      progression => {
        console.log(progression)
        this.store.dispatch(UpdateProgression(progression))
      })
  }

  files(): Observable<[]> {
    return this.http.get<[]>(this.apiUrl+"/jrnindexer/api/serverjrnfile");
  }



  upload(file:File, userDefinedName: string): Observable<HttpEvent<IndexStarted>> {

      /*this.readFile(file).then(fileContents => {
          // Put this string in a request body to upload it to an API.
          console.log(fileContents);
      })*/

    const formData = new FormData();
    formData.append("journalfile", file);
    console.log("before post")
      return this.http.post<IndexStarted>(this.webApp + "/upload", formData, {
          reportProgress: true,
          observe: "events"
        })
        /*.pipe(
            map((event: any) => {
              if (event.type == HttpEventType.UploadProgress) {
                this.progress = Math.round((100 / event.total) * event.loaded);
                console.log(this.progress)
              } else if (event.type == HttpEventType.Response) {
                this.progress = 0;
              }
            }),
            catchError((err: any) => {
              this.progress = 0;
              alert(err.message);
              return throwError(err.message);
            })
        )*/
  }

    private async readFile(file: File): Promise<string | ArrayBuffer> {
        return new Promise<string | ArrayBuffer>((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = e => {
                // @ts-ignore
                return resolve((e.target as FileReader).result);
            };

            reader.onerror = e => {
                console.error(`FileReader failed on file ${file.name}.`);
                return reject(null);
            };

            if (!file) {
                console.error('No file to read.');
                return reject(null);
            }

            reader.readAsDataURL(file);
        });
    }

}
