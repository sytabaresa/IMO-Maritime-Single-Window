import { Injectable } from "@angular/core";
import { Http } from "@angular/http";

@Injectable()
export class PurposeService {
    private purposeUrl = "api/portcallpurpose/all";

    constructor(private http: Http) { }

    getPurposes() {        
        return this.http.get(this.purposeUrl)
            .map(res => res.json());
    }
}