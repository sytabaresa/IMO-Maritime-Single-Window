import { Injectable } from "@angular/core";
import { Http, Headers, RequestOptions } from "@angular/http";
import { BehaviorSubject } from "rxjs";
import { ShipContactModel } from "../models/ship-contact-model";
import { SearchService } from "./search.service";
import { AuthRequest } from "./auth.request.service";

@Injectable()
export class ShipService {

    private searchService: SearchService;
    private shipSearchUrl: string;
    private shipTypeUrl: string;
    private hullTypeUrl: string;
    private lengthTypeUrl: string;
    private breadthTypeUrl: string;
    private powerTypeUrl: string;
    private shipSourceUrl: string;
    private shipStatusListUrl: string;
    private registerShipUrl: string;
    private flagCodeSearchUrl: string;
    private getContactListForShipUrl: string;
    private saveShipContactListUrl: string;

    constructor(
        private http: Http,
        private authRequest: AuthRequest
    ) {
        this.searchService = new SearchService(http);
        this.shipSearchUrl = 'api/ship/search';
        this.shipTypeUrl = 'api/shiptype/getall';
        this.hullTypeUrl = 'api/shiphulltype/getall';
        this.lengthTypeUrl = 'api/shiplengthtype/getall';
        this.breadthTypeUrl = 'api/shipbreadthtype/getall';
        this.powerTypeUrl = 'api/shippowertype/getall';
        this.shipSourceUrl = 'api/shipsource/getall';
        this.shipStatusListUrl = 'api/shipstatus/getall';
        this.registerShipUrl = 'api/ship/register';
        this.flagCodeSearchUrl = 'api/shipflagcode/search';
        this.getContactListForShipUrl = 'api/shipcontact/ship';
        this.saveShipContactListUrl = 'api/shipcontact/savelist'
    }



    private organizationDataSource = new BehaviorSubject<any>(null);
    organizationData$ = this.organizationDataSource.asObservable();

    private countryDataSource = new BehaviorSubject<any>(null);
    countryData$ = this.countryDataSource.asObservable();

    private shipFlagCodeDataSource = new BehaviorSubject<any>(null);
    shipFlagCodeData$ = this.shipFlagCodeDataSource.asObservable();

    private shipOverviewDataSource = new BehaviorSubject<any>(null);
    shipOverviewData$ = this.shipOverviewDataSource.asObservable();

    setShipOverviewData(data) {
        this.shipOverviewDataSource.next(data);
    }

    registerShip(newShip: any) {
        const auth_header = this.authRequest.GetHeaders();
        const options = new RequestOptions({ headers: auth_header });
        return this.http.post(this.registerShipUrl, newShip, options)
            .map(res => res.json());
    }

    saveShipContactList(shipContactList: ShipContactModel[]) {
        console.log(shipContactList);
        return this.http.post(this.saveShipContactListUrl, shipContactList).map(res => res.json());
    }

    setOrganizationData(data) {
        this.organizationDataSource.next(data);
    }

    setCountryData(data) {
        this.countryDataSource.next(data);
    }

    setShipFlagCodeData(data) {
        this.shipFlagCodeDataSource.next(data);
        console.log(data);
    }

    searchShip(term: string) {
        return this.searchService.search(this.shipSearchUrl, term);
    }

    searchFlagCode(term: string) {
        return this.searchService.search(this.flagCodeSearchUrl, term);
    }

    getShipTypes() {
        return this.http.get(this.shipTypeUrl)
            .map(res => res.json());
    }

    getHullTypes() {
        return this.http.get(this.hullTypeUrl)
            .map(res => res.json());
    }

    getLengthTypes() {
        return this.http.get(this.lengthTypeUrl)
            .map(res => res.json());
    }

    getBreadthTypes() {
        return this.http.get(this.breadthTypeUrl)
            .map(res => res.json());
    }

    getPowerTypes() {
        return this.http.get(this.powerTypeUrl)
            .map(res => res.json());
    }

    getShipSources() {
        return this.http.get(this.shipSourceUrl)
            .map(res => res.json());
    }

    getShipStatusList() {
        return this.http.get(this.shipStatusListUrl)
            .map(res => res.json());
    }

    getContactList(shipId: number) {
        let uri: string = [this.getContactListForShipUrl, shipId].join('/');
        return this.http.get(uri)
            .map(res => res.json());
    }



}