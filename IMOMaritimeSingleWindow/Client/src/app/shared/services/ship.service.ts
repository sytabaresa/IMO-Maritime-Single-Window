import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { of } from "rxjs/observable/of";
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable()
export class ShipService {
    constructor(private http: Http) {
        this.actionUrl = 'api/ship/search/';
    }

    private actionUrl: string;

    private companyDataSource = new BehaviorSubject<any>(null);
    companyData$ = this.companyDataSource.asObservable();

    setCompanyData(data) {
        this.companyDataSource.next(data);
    }

    public search(term: string) {
        if (term === '') {
            return of([]);
        }

        return this.http.get(this.actionUrl + term)
            .map(res => res.json())
            .toPromise();
    }
    
}