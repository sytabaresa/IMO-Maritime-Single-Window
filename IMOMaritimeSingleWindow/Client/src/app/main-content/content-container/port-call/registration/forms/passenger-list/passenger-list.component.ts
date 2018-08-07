import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { PortCallPassengerListService } from 'app/shared/services/port-call-passenger-list.service';
import { LocalDataSource } from 'ng2-smart-table';
import { PersonOnBoardModel } from 'app/shared/models/person-on-board-model';
import { SmartTableModel } from './smartTableModel';
import { PortModel } from './portModel';
import { Observable } from 'rxjs/Observable';
import { GenderModel } from 'app/shared/models/gender-model';
import { IdentityDocumentModel } from 'app/shared/models/identity-document-model';
import { Subscription } from 'rxjs/Subscription';
import { PortCallService } from 'app/shared/services/port-call.service';
import { IdentityDocumentService } from 'app/shared/services/identtity-document.service';
import { ActionButtonsComponent } from '../shared/action-buttons/action-buttons.component';
import { PassengerModalComponent } from './passenger-modal/passenger-modal.component';

@Component({
  selector: 'app-passenger-list',
  templateUrl: './passenger-list.component.html',
  styleUrls: ['./passenger-list.component.css']
})
export class PassengerListComponent implements OnInit {
  portCallPassengerList: PersonOnBoardModel[] = [];
  identityDocumentList: IdentityDocumentModel[] = [];

  portCallPassengerModel: PersonOnBoardModel = new PersonOnBoardModel();

  portCallId: number;

  genderList: Observable<any>;
  selectedGender: GenderModel;
  identityDocTypeList: Observable<any>;
  identityDocumentModel: IdentityDocumentModel = new IdentityDocumentModel();
  // selectedIdentityDocType: IdentityDocumentModel;

  modalModel: PersonOnBoardModel = new PersonOnBoardModel();
  listIsPristine: Boolean = true;

  @ViewChild(PassengerModalComponent) passengerModalComponent;

  @ViewChild(NgForm) mainForm: NgForm;

  booleanList: string[] = ['Yes', 'No'];
  booleanModel = {
    'Yes': true,
    'No': false
  };
  inTransit: boolean = null;

  formValid = false;

  passengerListDataSource: LocalDataSource = new LocalDataSource();
  smartTableList = [];

  tableSettings = {
    actions: false,
    attr: {
      class: 'table table-bordered'
    },
    editor: {
      config: {
        completer: {
          descriptionField: 'Search here'
        }
      }
    },
    noDataMessage: 'There are no passengers in this list.',
    columns: {
      sequenceNumber: {
        title: 'ID'
      },
      familyName: {
        title: 'Family Name',
      },
      givenName: {
        title: 'Given Name'
      },
      nationality: {
        title: 'Nationality'
      },
      gender: {
        title: 'Gender'
      },
      dateOfBirth: {
        title: 'Date of Birth'
      },
      portOfEmbarkation: {
        title: 'Port of Embarkation'
      },
      portOfDisembarkation: {
        title: 'Port of Disembarkation'
      },
      delete: {
        title: 'Actions',
        // deleteButtonContent: 'Delete',
        type: 'custom',
        filter: false,
        sort: false,
        renderComponent: ActionButtonsComponent,
        onComponentInitFunction: (instance) => {
          instance.view.subscribe(row => {
            this.openViewPassengerModal(row);
          });
          instance.edit.subscribe(row => {
            this.openEditPassengerModal(row);
          });
          instance.delete.subscribe(row => {
            this.deletePassenger(row);
          });
        }
      },
    }
  };

  passengerListSubscription: Subscription;
  detailsIdentificationDataSubscription: Subscription;

  constructor(
    private passengerListService: PortCallPassengerListService,
    private portCallService: PortCallService,
    private identityDocumentService: IdentityDocumentService
  ) {}


  ngOnInit() {
    // Generate smart table list from existing data
    this.portCallPassengerModel = new PersonOnBoardModel();
    this.identityDocumentModel = new IdentityDocumentModel();

    // Subscribe to port call
    this.detailsIdentificationDataSubscription = this.portCallService.detailsIdentificationData$.subscribe(element => {
      if (element) {
        this.portCallPassengerModel.portCallId = element.portCallId;
        this.portCallId = element.portCallId;

        this.identityDocumentService.identityDocumentList$.subscribe(list => {
          if (list) {
            this.identityDocumentList = list;
          }
        });

        this.passengerListService.dataIsPristine$.subscribe(isPristine => {
          this.listIsPristine = isPristine;
        });
        // Get gender list
        if (!this.genderList) {
          this.passengerListService.getGenderList().subscribe(results => {
            this.genderList = results;
          });
        }

        this.passengerListSubscription = this.passengerListService.passengerList$.subscribe(list => {
          if (list) {
            console.log(list);
            this.portCallPassengerList = list;
            this.portCallPassengerModel.portCallId = element.portCallId;
            this.passengerListDataSource.load(this.generateSmartTable(list));
          }
        });
      }

    });
    // On start
/*     this.passengerListService.getPassengerListByPortCallId(this.portCallId).subscribe(list => {

      this.passengerListDataSource = new LocalDataSource();
      this.portCallPassengerList = [];

      if (list) {
        this.passengerListService.setPassengersList(list);
      }
    }); */
  }

  addPassenger() {
    // Modify
    this.portCallPassengerModel.personOnBoardTypeId = 2;
    this.portCallPassengerModel.identityDocument.push(this.identityDocumentModel);

    // Add
    this.portCallPassengerList.push(this.portCallPassengerModel);
    // this.identityDocumentList.push(this.identityDocumentModel);

    // Update values in service
    this.passengerListService.setPassengersList(
      this.portCallPassengerList
    );
    // this.identityDocumentService.setIdentityDocumentList(this.identityDocumentList);

    // Reset
    this.portCallPassengerModel = new PersonOnBoardModel();
    this.identityDocumentModel = new IdentityDocumentModel();
    this.deselectIssuingNation();
    this.deselectCountryOfBirth();
    this.deselectNationality();
  }

/*   ngOnDestroy()  {
    this.detailsIdentificationDataSubscription.unsubscribe();
  } */

  generateSmartTable(passengerList): any[] {
    const newList = [];
    if (passengerList) {
      passengerList.forEach(passenger => {
        newList.push(this.makeSmartTableEntry(passenger));
      });
    }
    return newList;
  }

  makeSmartTableEntry(passenger) {
    const modifiedPassenger = new SmartTableModel();
    if (passenger.personOnBoardId) {
      modifiedPassenger.personOnBoardId = passenger.personOnBoardId;
    }
    modifiedPassenger.sequenceNumber = passenger.sequenceNumber;
    modifiedPassenger.givenName = passenger.givenName;
    modifiedPassenger.familyName = passenger.familyName;
    console.log(passenger.dateOfBirth);
    if (passenger.dateOfBirth) {
      if (typeof passenger.dateOfBirth === 'string') {
        modifiedPassenger.dateOfBirth = passenger.dateOfBirth.split('T')[0];
      } else {
        modifiedPassenger.dateOfBirth = passenger.dateOfBirth.getFullYear() + '-' + passenger.dateOfBirth.getMonth() + '-' + passenger.dateOfBirth.getDate();
      }
    }
    if (passenger.portOfEmbarkation) {
      modifiedPassenger.portOfEmbarkation = passenger.portOfEmbarkation.name;
    }
    if (passenger.portOfDisembarkation) {
      modifiedPassenger.portOfDisembarkation = passenger.portOfDisembarkation.name;
    }
    if (passenger.nationality) {
      modifiedPassenger.nationality = passenger.nationality.name;
    }
    if (passenger.gender) {
      modifiedPassenger.gender = passenger.gender.description;
    }

    /*Object.keys(this.booleanModel).forEach(key => {
      if (this.booleanModel[key] === passenger.inTransit) {
        modifiedPassenger.inTransit = key;
      }
    });*/
    return modifiedPassenger;
  }

  isValid(valid: Boolean): Boolean {
    this.sendMetaData();
    return valid;
  }

  private sendMetaData(): void {
    this.passengerListService.setPassengerListMeta({ valid: this.mainForm.valid });
  }

  makePortModel($event) {
    const tempPortModel = new PortModel();
    tempPortModel.locationId = $event.locationId;
    tempPortModel.country = $event.country;
    tempPortModel.countryId = $event.countryId;
    tempPortModel.name = $event.name;

    return tempPortModel;
  }

  setPortData(portdata) {
    const portModel = new PortModel();
    portModel.locationId = portdata.locationId;
    portModel.countryId = portdata.countryId;
    portModel.name = portdata.name;

    return portModel;
  }

  // Select Methods
  setIdentityDocumentModel($event) {
    this.identityDocumentModel = $event;
    console.log(this.identityDocumentModel);
  }

  setPortOfEmbarkation($event) {
    this.portCallPassengerModel.portOfEmbarkation = this.makePortModel($event);
    this.portCallPassengerModel.portOfEmbarkationId = $event.locationId;
  }

  setPortOfDisembarkation($event) {
    this.portCallPassengerModel.portOfDisembarkation = this.makePortModel($event);
    this.portCallPassengerModel.portOfDisembarkationId = $event.locationId;
  }

  setDateOfBirth($event) {
    if ($event) {
      this.portCallPassengerModel.dateOfBirth = this.getDateFormat($event);
    } else {
      this.resetDateOfBirth();
    }
    console.log($event);
    console.log(this.portCallPassengerModel.dateOfBirth);
    console.log(this.portCallPassengerModel);
  }

  selectGender($event) {
    this.portCallPassengerModel.gender = $event;
    this.portCallPassengerModel.genderId = $event.genderId;
  }

  setCountryOfBirth($event) {
    this.portCallPassengerModel.countryOfBirth = $event.item;
    this.portCallPassengerModel.countryOfBirthId = $event.item.countryId;
  }

  setNationality($event) {
    this.portCallPassengerModel.nationality = $event.item;
    this.portCallPassengerModel.nationalityId = $event.item.countryId;
  }

  selectTransit($event) {
    this.inTransit = $event;
    Object.keys(this.booleanModel).forEach(key => {
      if (key === $event) {
        this.portCallPassengerModel.inTransit = this.booleanModel[key];
        return;
      }
    });
  }

  // Deselect Methods
  deselectPortOfDisembarkation() {
    this.portCallPassengerModel.portOfDisembarkation = null;
    this.portCallPassengerModel.portOfDisembarkationId = null;
  }

  deselectPortOfEmbarkation() {
    this.portCallPassengerModel.portOfEmbarkation = null;
    this.portCallPassengerModel.portOfEmbarkationId = null;
  }

  deselectNationality() {
    this.portCallPassengerModel.nationality = null;
    this.portCallPassengerModel.nationalityId = null;
  }

  deselectCountryOfBirth() {
    this.portCallPassengerModel.countryOfBirth = null;
    this.portCallPassengerModel.countryOfBirthId = null;
  }

  deselectIssuingNation() {
    this.identityDocumentModel.issuingNation = null;
    this.identityDocumentModel.issuingNationId = null;
  }

  resetDateOfBirth() {
    this.portCallPassengerModel.dateOfBirth = null;
  }

  // Helper methods

  getDateFormat(date) {
    if (date.year && date.month && date.day) {
      const dateString = date.year + '-' + ('0' + date.month).slice(-2) + '-' + ('0' + date.day).slice(-2) + 'T00:00:00';
      return dateString;
    } else {
      return null;
    }
  }

  getDisplayDateFormat(date) {
    return date.split('T')[0];
  }

  getNgbDateFormat(date) {
    const newDate = new Date(date);
    return {
      year: newDate.getFullYear(),
      month: newDate.getMonth() + 1,
      day: newDate.getDate()
    };
  }

  openViewPassengerModal(row) {
      this.portCallPassengerList.forEach(passenger => {
        if (passenger.sequenceNumber === row.sequenceNumber) {
          this.passengerModalComponent.openViewModal(passenger);
          return;
        }
      });
  }

  openEditPassengerModal(row) {
    console.log(this.portCallPassengerList);
    // set editPassengerId?
    this.portCallPassengerList.forEach(passenger => {
      if (passenger.sequenceNumber === row.sequenceNumber) {
        console.log(passenger);
        this.passengerModalComponent.openEditModal(passenger);
        return;
      }
    });
  }

  editPassenger($event) {
    this.portCallPassengerList.forEach((passenger, index) => {
      if (passenger.sequenceNumber === $event.sequenceNumber) {
        this.portCallPassengerList[index] = $event;
        this.portCallPassengerList[index].identityDocument[0] = $event.identityDocument[0];
        console.log(this.portCallPassengerList);
        return;
      }
    });
    this.passengerListService.setPassengersList(this.portCallPassengerList);
  }

  deletePassenger(row) {
    this.passengerListService.deletePassengerEntry(row);
  }

  savePassengers() {
    console.log(this.portCallPassengerList);
    this.passengerListService.updatePassengerList(this.portCallPassengerList, this.portCallId).subscribe(res => console.log(res));
  }

  addMockData() {
    const mockportCallPassengerModel = new PersonOnBoardModel();
    // const mockIdentityDocumentModel = new IdentityDocumentModel();
    mockportCallPassengerModel.familyName = 'Karlsen';
    mockportCallPassengerModel.givenName = 'Unni';
    // mockIdentityDocumentModel.issuingNation = 'Norway';

    mockportCallPassengerModel.genderId = 3;

    mockportCallPassengerModel.dateOfBirth = this.getDateFormat({year: 1994, month: 7, day: 13});

    const mockPortOfEmbakrationModel = new PortModel();
    mockPortOfEmbakrationModel.name = 'Porsgrunn';

    const mockPortOfDisembakrationModel = new PortModel();
    mockPortOfDisembakrationModel.name = 'Kiel';

    this.portCallPassengerModel = mockportCallPassengerModel;
    // this.identityDocumentModel = mockIdentityDocumentModel;
    this.addPassenger();
  }

    mockFillForm() {
      this.portCallPassengerModel.familyName = 'Dalan';
      this.portCallPassengerModel.givenName = 'Camilla';
      this.portCallPassengerModel.dateOfBirth = new Date();
      this.portCallPassengerModel.placeOfBirth = 'Oslo';
      this.identityDocumentModel.identityDocumentNumber = 4232;
      this.identityDocumentModel.visaOrResidencePermitNumber = 421;
    }
}
