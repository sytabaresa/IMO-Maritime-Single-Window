import { Component, OnInit } from '@angular/core';
import { PortCallShipStoresService } from 'app/shared/services/port-call-ship-stores.service';
import { PortCallShipStoresModel } from 'app/shared/models/port-call-ship-stores-model';

import { PortCallService } from 'app/shared/services/port-call.service';

@Component({
  selector: 'app-save-ship-stores',
  templateUrl: './save-ship-stores.component.html',
  styleUrls: ['./save-ship-stores.component.css']
})
export class SaveShipStoresComponent implements OnInit {

  shipStoresModel: PortCallShipStoresModel = new PortCallShipStoresModel();
  reportingModel: any;
  portCallId: number;

  portCallShipStoresList: PortCallShipStoresModel[] = [];

  listIsPristine: Boolean = true;

  constructor(
    private shipStoresService: PortCallShipStoresService,
    private portCallService: PortCallService) { }

  ngOnInit() {

    // Database Identification
    this.portCallService.detailsIdentificationData$.subscribe(results => {
      if (results) {
        this.portCallId = results.portCallId;
        console.log('Port call ID: ' + results.portCallId);
      }
    });

    // Get original ship stores list belonging to this port call

    // Get updated list of ship stores
    this.shipStoresService.shipStoresList$.subscribe(shipStoresList => {
      if (shipStoresList) {
        this.portCallShipStoresList = shipStoresList;
      }

      this.shipStoresService.dataIsPristine$.subscribe(isPristine => {
        this.listIsPristine = isPristine;
      });

    });

  }

  saveShipStores() {
    console.log('Save Ship Component: Saving...');
      this.portCallShipStoresList = this.shipStoresService.setSequenceNumbers(this.portCallShipStoresList);
      this.shipStoresService.updateShipStores(this.portCallShipStoresList).
      subscribe(res => {
        console.log(res);
      });
  }

}
