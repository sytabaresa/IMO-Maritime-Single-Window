import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from 'app/shared/components/confirmation-modal/confirmation-modal.component';
import { CONTENT_NAMES } from 'app/shared/constants/content-names';
import { ShipContactModel } from 'app/shared/models/ship-contact-model';
import { ShipModel } from 'app/shared/models/ship-model';
import { ContactService } from 'app/shared/services/contact.service';
import { ContentService } from 'app/shared/services/content.service';
import { OrganizationService } from 'app/shared/services/organization.service';
import { ShipService } from 'app/shared/services/ship.service';
import { CertificateOfRegistryModel } from 'app/shared/models/certificate-of-registry-model';
import { CertificateOfRegistryComponent } from './certificate-of-registry/certificate-of-registry.component';

const RESULT_SUCCESS = 'Ship was successfully saved to the database.';
const RESULT_FAILURE = 'There was a problem when trying to save the ship to the database. Please try again later.';
// tslint:disable-next-line:max-line-length
const RESULT_SAVED_WITHOUT_CONTACT = 'Ship was saved to the database, but there was an error when trying to save the ship\'s contact information. Please provide this information later.';

@Component({
  selector: 'app-register-ship',
  templateUrl: './register-ship.component.html',
  styleUrls: ['./register-ship.component.css'],
  providers: [ShipModel]
})
export class RegisterShipComponent implements OnInit, AfterViewInit {
  @ViewChild(CertificateOfRegistryComponent) certificateComponent: CertificateOfRegistryComponent;
  newShip = false;
  shipHeader: string;
  confirmHeader: string;
  confirmButtonTitle: string;
  shipFlagCodeSelected: boolean;
  organizationSelected: boolean;
  contactSelected: boolean;
  portLocationSelected: boolean;
  certificateSelected = false;

  hullTypeSelected = false;
  lengthTypeSelected = false;
  breadthTypeSelected = false;
  powerTypeSelected = false;
  shipStatusSelected = false;

  shipTypeList: any[];
  hullTypeList: any[];
  lengthTypeList: any[];
  breadthTypeList: any[];
  powerTypeList: any[];
  shipStatusList: any[];

  selectedShipType: any;
  shipTypeSelected = false;
  shipTypeSearchFailed = false;

  hullTypeDropdownString = 'Select hull type';
  lengthTypeDropdownString = 'Select type';
  breadthTypeDropdownString = 'Select type';
  powerTypeDropdownString = 'Select type';
  shipStatusDropdownString = 'Select status';

  shipFlagCodeModel: any;
  organizationModel: any;
  selectedContactModels: ShipContactModel[];
  certificateModel: CertificateOfRegistryModel;
  datePickerModel: { year: number, month: number, day: number };
  certificateDateString: string;
  portName: string;
  certificateNumber: number;
  validCertificateDateFormat = true;


  // shipModel should be private, but Angular's AoT compilation can't handle it. Will be fixed in Angular 6.0
  constructor(
    public shipModel: ShipModel,
    private shipService: ShipService,
    private contactService: ContactService,
    private contentService: ContentService,
    private modalService: NgbModal,
    private organizationService: OrganizationService,
  ) { }

  // for development purposes, remove before prod
  setFast() {
    this.shipModel.name = 'TJOHEI';
    this.shipModel.callSign = 'tjo123';
    this.shipModel.imoNo = 1234567;
    this.shipModel.mmsiNo = 7654321;
    this.selectShipType(this.shipTypeList[0]);
    this.shipModel.yearOfBuild = 1234;
    this.selectLengthType(this.lengthTypeList[0]);
    this.shipModel.length = 100;
    this.selectBreadthType(this.breadthTypeList[0]);
    this.shipModel.breadth = 50;
    this.selectPowerType(this.powerTypeList[0]);
    this.shipModel.power = 1000;
    this.selectHullType(this.hullTypeList[0]);
    this.selectShipStatus(this.shipStatusList[0]);
    this.shipModel.height = 20;
    this.shipModel.draught = 10;
    this.shipModel.grossTonnage = 500;
    this.shipModel.deadweightTonnage = 600;
    this.shipModel.hasSideThrusters = true;
    this.shipModel.remark = 'Remark';
  }

  ngOnInit() {
    this.certificateModel = new CertificateOfRegistryModel();
    this.subscribeToData();
    this.shipService.shipOverviewData$.subscribe(
      data => {
        if (data) {
          this.setAllValues(data);
        } else if (!this.newShip) {
          this.organizationService.setOrganizationData(null);
          this.shipService.setShipFlagCodeData(null);
          this.contactService.setContactData(null);
          this.newShip = true;
          this.shipHeader = 'Register New Ship';
          this.confirmHeader = 'Confirm Ship Registration';
          this.confirmButtonTitle = 'Register Ship';
        }
      }
    );
    this.shipService.getShipTypes().subscribe(
      data => this.shipTypeList = data
    );
    this.shipService.getHullTypes().subscribe(
      data => this.hullTypeList = data
    );
    this.shipService.getLengthTypes().subscribe(
      data => this.lengthTypeList = data
    );
    this.shipService.getBreadthTypes().subscribe(
      data => this.breadthTypeList = data
    );
    this.shipService.getPowerTypes().subscribe(
      data => this.powerTypeList = data
    );
    this.shipService.getShipStatusList().subscribe(
      data => this.shipStatusList = data
    );
  }

  ngAfterViewInit() {

    this.certificateComponent.getService().certificateData$.subscribe(
      data => {
        this.certificateModel = data;
        if (data) {
          if (this.certificateModel.dateOfIssue) {
            this.certificateDateString = this.dateString(new Date(this.certificateModel.dateOfIssue));
          }
          if (this.certificateModel.dateOfIssue && this.certificateModel.portLocationId && this.certificateModel.certificateNumber && this.certificateModel.dateOfIssue) {
            this.portName = this.certificateModel.portLocation.name;
            this.certificateNumber = this.certificateModel.certificateNumber;
            this.certificateSelected = true;
          } else {
            this.certificateSelected = false;
          }
        } else {
          this.certificateSelected = false;
        }
      }
    );

    this.certificateComponent.getService().validDateFormatData$.subscribe(
      data => {
        if (data) {
          this.validCertificateDateFormat = data;
        }
      }
    );

    setTimeout(() => {
      if (this.shipModel) {
        this.certificateComponent.getService().setCertificateData(this.shipModel.certificateOfRegistry);
      }
    });
  }

  subscribeToData() {
    this.shipService.shipFlagCodeData$.subscribe(
      data => {
        if (data) {
          this.shipFlagCodeModel = data;
          this.shipModel.shipFlagCodeId = data.shipFlagCodeId;
          this.shipFlagCodeSelected = true;
        } else {
          this.shipFlagCodeSelected = false;
        }
      });

    this.organizationService.organizationData$.subscribe(
      data => {
        if (data) {
          this.organizationModel = data;
          this.shipModel.organizationId = data.organizationId;
          this.organizationSelected = true;
        } else {
          this.organizationSelected = false;
        }
      });

    this.contactService.contactData$.subscribe(
      data => {
        if (data && data.length !== 0) {
          this.selectedContactModels = data;
          this.contactSelected = true;
        } else {
          this.contactSelected = false;
        }
      });
  }

  setAllValues(ship: ShipModel) {
    this.newShip = false;
    this.shipHeader = 'Edit Ship';
    this.confirmHeader = 'Confirm Ship Changes';
    this.confirmButtonTitle = 'Apply Changes';
    this.shipModel = ship;
    this.selectedShipType = ship.shipType;
    this.shipTypeSelected = (ship.shipType != null);
    this.organizationModel = ship.organization;
    this.organizationSelected = (ship.organization != null);
    this.selectedContactModels = ship.shipContact;

    this.hullTypeSelected = (ship.shipHullType != null);
    if (this.hullTypeSelected) {
      this.hullTypeDropdownString = ship.shipHullType.name;
    }
    this.lengthTypeSelected = (ship.shipLengthType != null);
    if (this.lengthTypeSelected) {
      this.lengthTypeDropdownString = ship.shipLengthType.name;
    }
    this.hullTypeSelected = (ship.shipHullType != null);
    if (this.hullTypeSelected) {
      this.hullTypeDropdownString = ship.shipHullType.name;
    }
    this.breadthTypeSelected = (ship.shipBreadthType != null);
    if (this.breadthTypeSelected) {
      this.breadthTypeDropdownString = ship.shipBreadthType.name;
    }
    this.powerTypeSelected = (ship.shipPowerType != null);
    if (this.powerTypeSelected) {
      this.powerTypeDropdownString = ship.shipPowerType.name;
    }
    this.shipStatusSelected = (ship.shipStatus != null);
    if (this.shipStatusSelected) {
      this.shipStatusDropdownString = ship.shipStatus.name;
    }
    this.organizationService.setOrganizationData(ship.organization);
    this.shipService.setShipFlagCodeData(ship.shipFlagCode);
    this.contactService.setContactData(ship.shipContact);
    this.contactSelected = (ship.shipContact != null);
  }

  selectShipType($event: any) {
    this.shipModel.shipTypeId = $event.shipTypeId;
    this.shipTypeSelected = true;
  }

  deselectShipType() {
    this.shipModel.shipTypeId = null;
    this.selectedShipType = null;
    this.shipTypeSelected = false;
  }

  deselectOrganization() {
    this.organizationService.setOrganizationData(null);
  }

  selectHullType(hullType: any) {
    this.shipModel.shipHullTypeId = hullType.shipHullTypeId;
    this.hullTypeDropdownString = hullType.name;
    this.hullTypeSelected = true;
  }

  selectLengthType(lengthType: any) {
    this.shipModel.shipLengthTypeId = lengthType.shipLengthTypeId;
    this.lengthTypeDropdownString = lengthType.name;
    this.lengthTypeSelected = true;
  }

  selectBreadthType(breadthType: any) {
    this.shipModel.shipBreadthTypeId = breadthType.shipBreadthTypeId;
    this.breadthTypeDropdownString = breadthType.name;
    this.breadthTypeSelected = true;
  }

  selectPowerType(powerType: any) {
    this.shipModel.shipPowerTypeId = powerType.shipPowerTypeId;
    this.powerTypeDropdownString = powerType.name;
    this.powerTypeSelected = true;
  }

  selectShipStatus(shipStatus: any) {
    this.shipModel.shipStatusId = shipStatus.shipStatusId;
    this.shipStatusDropdownString = shipStatus.name;
    this.shipStatusSelected = true;
  }


  registerShip() {
    const safeCertificate = new CertificateOfRegistryModel();
    safeCertificate.certificateNumber = this.certificateModel.certificateNumber;
    safeCertificate.dateOfIssue = this.certificateModel.dateOfIssue;
    safeCertificate.portLocationId = this.certificateModel.portLocationId;
    this.shipModel.certificateOfRegistry = safeCertificate;
    if (this.newShip) {
      this.shipService.registerShip(this.shipModel).subscribe(
        result => {
          this.shipModel.shipId = result.shipId;
          const shipContactList = this.selectedContactModels.map(contactModel => {
            const shipContact = new ShipContactModel();
            shipContact.shipId = this.shipModel.shipId;
            shipContact.contactMediumId = contactModel.contactMedium.contactMediumId;
            shipContact.contactValue = contactModel.contactValue;
            shipContact.isPreferred = contactModel.isPreferred;
            shipContact.comments = contactModel.comments;
            return shipContact;
          });
          this.saveShipContactList(shipContactList);
        }, error => {
          console.log(error);
          this.openConfirmationModal(ConfirmationModalComponent.TYPE_FAILURE, RESULT_FAILURE);
        }
      );
    } else {
      // remove child dependencies
      this.shipModel.certificateOfRegistryId = this.certificateModel.certificateOfRegistryId;
      this.shipModel.organization = null;
      this.shipModel.shipStatus = null;
      this.shipModel.shipPowerType = null;
      this.shipModel.shipBreadthType = null;
      this.shipModel.shipLengthType = null;
      this.shipModel.shipSource = null;
      this.shipModel.shipFlagCode = null;
      this.shipModel.shipType = null;
      this.shipModel.shipContact = null;
      // update
      this.shipService.updateShip(this.shipModel).subscribe(
        result => {
          const shipContactList = this.selectedContactModels.map(contactModel => {
            const shipContact = new ShipContactModel();
            shipContact.shipId = this.shipModel.shipId;
            shipContact.contactMediumId = contactModel.contactMedium.contactMediumId;
            shipContact.contactValue = contactModel.contactValue;
            shipContact.isPreferred = contactModel.isPreferred;
            shipContact.comments = contactModel.comments;
            return shipContact;
          });
          this.saveShipContactList(shipContactList);
        }, error => {
          console.log(error);
          this.openConfirmationModal(ConfirmationModalComponent.TYPE_FAILURE, RESULT_FAILURE);
        }
      );
    }
  }

  saveShipContactList(shipContactList: ShipContactModel[]) {
    this.shipService.saveShipContactList(shipContactList).subscribe(
      result => {
        if (result) {
          this.openConfirmationModal(ConfirmationModalComponent.TYPE_SUCCESS, RESULT_SUCCESS);
        }
      }, error => {
        console.log(error);
        this.openConfirmationModal(ConfirmationModalComponent.TYPE_WARNING, RESULT_SAVED_WITHOUT_CONTACT);
      }
    );
  }

  private goBack() {
    this.contentService.setContent(CONTENT_NAMES.VIEW_SHIPS);
  }

  dateString(date: Date) {
    return date.getFullYear() + '-' + this.dateTimeFormat(date.getMonth() + 1) + '-' + this.dateTimeFormat(date.getDate());
  }

  dateTimeFormat(number: number) {
    if (number <= 9) {
      return '0' + number;
    } else {
      return number;
    }
  }

  private hasValidDateFormat(model): boolean {
    return typeof model !== 'string' && model != null;
  }

  private openConfirmationModal(modalType: string, bodyText: string) {
    const modalRef = this.modalService.open(ConfirmationModalComponent);
    modalRef.componentInstance.modalType = modalType;
    modalRef.componentInstance.bodyText = bodyText;
    modalRef.result.then(
      result => {
        if (modalType !== ConfirmationModalComponent.TYPE_FAILURE) {
          this.goBack();
        }
      },
      reason => {
        if (modalType !== ConfirmationModalComponent.TYPE_FAILURE) {
          this.goBack();
        }
      }
    );
  }
}
