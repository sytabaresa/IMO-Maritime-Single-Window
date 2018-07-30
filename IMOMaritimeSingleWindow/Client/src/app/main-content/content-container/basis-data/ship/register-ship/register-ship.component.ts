import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmationModalComponent } from 'app/shared/components/confirmation-modal/confirmation-modal.component';
import { CONTENT_NAMES } from 'app/shared/constants/content-names';
import { OrganizationProperties } from 'app/shared/constants/organization-properties';
import { ShipFlagCodeProperties } from 'app/shared/constants/ship-flag-code-properties';
import { CertificateOfRegistryModel } from 'app/shared/models/certificate-of-registry-model';
import { OrganizationModel } from 'app/shared/models/organization-model';
import { ShipContactModel } from 'app/shared/models/ship-contact-model';
import { ShipFlagCodeModel } from 'app/shared/models/ship-flag-code-model';
import { ShipModel } from 'app/shared/models/ship-model';
import { ContentService } from 'app/shared/services/content.service';
import { ShipService } from 'app/shared/services/ship.service';
import { Subscription } from 'rxjs/Subscription';

const RESULT_SUCCESS = 'Ship was successfully saved to the database.';
const RESULT_FAILURE = 'There was a problem when trying to save the ship to the database. Please try again later.';
const RESULT_SAVED_WITHOUT_CONTACT = 'Ship was saved to the database, but there was an error when trying to save the ship\'s contact information. Please provide this information later.';
const INITIAL_DATA_IS_PRISTINE_TEXT = 'There are no unsaved changes in this page.';
const UPDATED_DATA_IS_PRISTINE_TEXT = 'Your changes have been saved.';

@Component({
  selector: 'app-register-ship',
  templateUrl: './register-ship.component.html',
  styleUrls: ['./register-ship.component.css']
})
export class RegisterShipComponent implements OnInit, OnDestroy {

  shipModel = new ShipModel();

  newShip = false;
  shipHeader: string;
  confirmHeader: string;
  confirmButtonTitle: string;

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

  shipFlagCodeSelected: boolean;
  shipFlagCodeModel: ShipFlagCodeModel;
  shipFlagCodeProperties = new ShipFlagCodeProperties().getPropertyList();

  contactSelected: boolean;
  selectedContactModelList: ShipContactModel[];

  organizationSelected: boolean;
  organizationModel: OrganizationModel;
  organizationProperties = new OrganizationProperties().getPropertyList();

  certificateSelected = false;
  certificateModel: CertificateOfRegistryModel;
  certificateDateString: string;

  dataIsPristine = true;
  dataIsPristineText: string;

  shipOverviewDataSubscription: Subscription;

  shipTypesSubscription: Subscription;
  hullTypesSubscription: Subscription;
  lengthTypesSubscription: Subscription;
  breadthTypesSubscription: Subscription;
  powerTypesSubscription: Subscription;
  shipStatusListSubscription: Subscription;

  constructor(
    private shipService: ShipService,
    private contentService: ContentService,
    private modalService: NgbModal
  ) { }

  // for development purposes, remove before prod
  setInfoShortcut() {
    this.shipModel.name = 'TJOHEI';
    this.shipModel.callSign = 'tjo123';
    this.shipModel.imoNo = 1234567;
    this.shipModel.mmsiNo = 7654321;
    // this.selectShipType(this.shipTypeList[0]);
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
    this.dataIsPristineText = INITIAL_DATA_IS_PRISTINE_TEXT;
    this.certificateModel = new CertificateOfRegistryModel();
    this.shipOverviewDataSubscription = this.shipService.shipOverviewData$.subscribe(data => {
      if (data) {
        this.setAllValues(data);
      } else if (!this.newShip) {
        this.newShip = true;
        this.shipHeader = 'Register New Ship';
        this.confirmHeader = 'Confirm Ship Registration';
        this.confirmButtonTitle = 'Register Ship';
      }
    });
    this.shipTypesSubscription = this.shipService.getShipTypes().subscribe(data => (this.shipTypeList = data));
    this.hullTypesSubscription = this.shipService.getHullTypes().subscribe(data => (this.hullTypeList = data));
    this.lengthTypesSubscription = this.shipService.getLengthTypes().subscribe(data => (this.lengthTypeList = data));
    this.breadthTypesSubscription = this.shipService.getBreadthTypes().subscribe(data => (this.breadthTypeList = data));
    this.powerTypesSubscription = this.shipService.getPowerTypes().subscribe(data => (this.powerTypeList = data));
    this.shipStatusListSubscription = this.shipService.getShipStatusList().subscribe(data => (this.shipStatusList = data));
  }

  ngOnDestroy() {
    this.shipOverviewDataSubscription.unsubscribe();
    this.shipTypesSubscription.unsubscribe();
    this.hullTypesSubscription.unsubscribe();
    this.lengthTypesSubscription.unsubscribe();
    this.breadthTypesSubscription.unsubscribe();
    this.powerTypesSubscription.unsubscribe();
    this.shipStatusListSubscription.unsubscribe();
  }

  setAllValues(ship: ShipModel) {
    this.newShip = false;
    this.shipHeader = 'Edit Ship';
    this.confirmHeader = 'Confirm Ship Changes';
    this.confirmButtonTitle = 'Apply Changes';
    this.shipModel = ship;
    this.selectedShipType = ship.shipType;
    this.shipTypeSelected = ship.shipType != null;
    this.organizationModel = ship.organization;
    this.organizationSelected = ship.organization != null;
    this.selectedContactModelList = ship.shipContact;

    this.hullTypeSelected = ship.shipHullType != null;
    if (this.hullTypeSelected) {
      this.hullTypeDropdownString = ship.shipHullType.name;
    }
    this.lengthTypeSelected = ship.shipLengthType != null;
    if (this.lengthTypeSelected) {
      this.lengthTypeDropdownString = ship.shipLengthType.name;
    }
    this.hullTypeSelected = ship.shipHullType != null;
    if (this.hullTypeSelected) {
      this.hullTypeDropdownString = ship.shipHullType.name;
    }
    this.breadthTypeSelected = ship.shipBreadthType != null;
    if (this.breadthTypeSelected) {
      this.breadthTypeDropdownString = ship.shipBreadthType.name;
    }
    this.powerTypeSelected = ship.shipPowerType != null;
    if (this.powerTypeSelected) {
      this.powerTypeDropdownString = ship.shipPowerType.name;
    }
    this.shipStatusSelected = ship.shipStatus != null;
    if (this.shipStatusSelected) {
      this.shipStatusDropdownString = ship.shipStatus.name;
    }
    this.setShipFlagCode(ship.shipFlagCode);
    this.setOrganization(ship.organization);
    this.setCertificateOfRegistry(ship.certificateOfRegistry);
    this.setContactData(ship.shipContact);

  }

  selectShipType($event: any) {
    this.shipModel.shipTypeId = $event.shipTypeId;
    this.shipTypeSelected = true;
    this.touchData();
  }

  deselectShipType() {
    this.shipModel.shipTypeId = null;
    this.selectedShipType = null;
    this.shipTypeSelected = false;
  }

  selectLengthType(lengthType: any) {
    this.shipModel.shipLengthTypeId = lengthType.shipLengthTypeId;
    this.lengthTypeDropdownString = lengthType.name;
    this.lengthTypeSelected = true;
    this.touchData();
  }

  selectBreadthType(breadthType: any) {
    this.shipModel.shipBreadthTypeId = breadthType.shipBreadthTypeId;
    this.breadthTypeDropdownString = breadthType.name;
    this.breadthTypeSelected = true;
    this.touchData();
  }

  selectPowerType(powerType: any) {
    this.shipModel.shipPowerTypeId = powerType.shipPowerTypeId;
    this.powerTypeDropdownString = powerType.name;
    this.powerTypeSelected = true;
    this.touchData();
  }

  selectHullType(hullType: any) {
    this.shipModel.shipHullTypeId = hullType.shipHullTypeId;
    this.hullTypeDropdownString = hullType.name;
    this.hullTypeSelected = true;
    this.touchData();
  }

  selectShipStatus(shipStatus: any) {
    this.shipModel.shipStatusId = shipStatus.shipStatusId;
    this.shipStatusDropdownString = shipStatus.name;
    this.shipStatusSelected = true;
    this.touchData();
  }

  onShipFlagCodeResult(shipFlagCodeResult) {
    this.setShipFlagCode(shipFlagCodeResult);
    this.touchData();
  }

  setShipFlagCode(shipFlagCodeData: ShipFlagCodeModel) {
    this.shipFlagCodeModel = shipFlagCodeData;
    if (shipFlagCodeData) {
      this.shipModel.shipFlagCodeId = shipFlagCodeData.shipFlagCodeId;
      this.shipFlagCodeSelected = true;
      ShipFlagCodeProperties.setShipFlagCodeData(this.shipFlagCodeProperties, this.shipFlagCodeModel);
      const twoCharCode = this.shipFlagCodeModel.country.twoCharCode.toLowerCase() || 'xx';
      const countryFlag = twoCharCode + '.png';
      ShipFlagCodeProperties.setCountry(this.shipFlagCodeProperties, this.shipFlagCodeModel.country.name, countryFlag);
    }
  }

  deselectShipFlagCode() {
    this.shipFlagCodeSelected = false;
    this.shipFlagCodeModel = null;
    this.shipModel.shipFlagCodeId = null;
  }

  onContactDataResult(contactData: ShipContactModel[]) {
    this.setContactData(contactData);
    this.touchData();
  }

  setContactData(contactData) {
    this.selectedContactModelList = contactData;
    this.shipModel.shipContact = this.selectedContactModelList;
    this.contactSelected = contactData.length !== 0;
  }

  onOrganizationResult(organizationResult) {
    this.setOrganization(organizationResult);
    this.touchData();
  }

  setOrganization(organizationData: OrganizationModel) {
    this.organizationModel = organizationData;
    if (organizationData) {
      this.shipModel.organizationId = organizationData.organizationId;
      this.organizationSelected = true;
      OrganizationProperties.setOrganizationData(
        this.organizationProperties,
        this.organizationModel
      );
    }
  }

  deselectOrganization() {
    this.organizationSelected = false;
    this.organizationModel = null;
    this.shipModel.organizationId = null;
  }

  onCertificateOfRegistryResult(certificateResult) {
    this.setCertificateOfRegistry(certificateResult);
    this.touchData();
  }

  setCertificateOfRegistry(certificateData: CertificateOfRegistryModel) {
    this.certificateModel = certificateData;
    if (certificateData) {
      if (this.certificateModel.dateOfIssue) {
        this.certificateDateString = this.dateString(new Date(this.certificateModel.dateOfIssue));
      }
      if (this.certificateModel.dateOfIssue && this.certificateModel.portLocationId
          && this.certificateModel.portLocation && this.certificateModel.certificateNumber) {
        this.certificateSelected = true;
      } else {
        this.certificateSelected = false;
      }
    } else {
      this.certificateSelected = false;
    }
  }

  touchData() {
    this.dataIsPristine = false;
  }

  private updateCertificate() {
    // safeCertificate is used for removing unnecessary location objects within the certificate
    const safeCertificate = new CertificateOfRegistryModel();
    safeCertificate.certificateNumber = this.certificateModel.certificateNumber;
    safeCertificate.dateOfIssue = this.certificateModel.dateOfIssue;
    safeCertificate.portLocationId = this.certificateModel.portLocationId;
    this.shipModel.certificateOfRegistry = safeCertificate;
  }

  registerShip() {
    this.updateCertificate();
    if (this.newShip) {
      this.shipService.registerShip(this.shipModel).subscribe(
        result => {
          this.shipModel.shipId = result.shipId;
          const shipContactList = this.selectedContactModelList.map(
            contactModel => {
              const shipContact = new ShipContactModel();
              shipContact.shipId = this.shipModel.shipId;
              shipContact.contactMediumId = contactModel.contactMedium.contactMediumId;
              shipContact.contactValue = contactModel.contactValue;
              shipContact.isPreferred = contactModel.isPreferred;
              shipContact.comments = contactModel.comments;
              return shipContact;
            }
          );
          this.saveShipContactList(shipContactList);
        },
        error => {
          console.log(error);
          this.openConfirmationModal(
            ConfirmationModalComponent.TYPE_FAILURE,
            RESULT_FAILURE
          );
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
          const shipContactList = this.selectedContactModelList.map(
            contactModel => {
              const shipContact = new ShipContactModel();
              shipContact.shipId = this.shipModel.shipId;
              shipContact.contactMediumId = contactModel.contactMedium.contactMediumId;
              shipContact.contactValue = contactModel.contactValue;
              shipContact.isPreferred = contactModel.isPreferred;
              shipContact.comments = contactModel.comments;
              return shipContact;
            }
          );
          this.saveShipContactList(shipContactList);
        },
        error => {
          console.log(error);
          this.openConfirmationModal(
            ConfirmationModalComponent.TYPE_FAILURE,
            RESULT_FAILURE
          );
        }
      );
    }
    this.dataIsPristineText = UPDATED_DATA_IS_PRISTINE_TEXT;
  }

  saveShipContactList(shipContactList: ShipContactModel[]) {
    this.shipService.saveShipContactList(shipContactList).subscribe(
      result => {
        if (result) {
          this.openConfirmationModal(
            ConfirmationModalComponent.TYPE_SUCCESS,
            RESULT_SUCCESS
          );
        }
      },
      error => {
        console.log(error);
        this.openConfirmationModal(
          ConfirmationModalComponent.TYPE_WARNING,
          RESULT_SAVED_WITHOUT_CONTACT
        );
      }
    );
  }

  private goBack() {
    this.contentService.setContent(CONTENT_NAMES.VIEW_SHIPS);
  }

  dateString(date: Date) {
    return (
      date.getFullYear() +
      '-' +
      this.dateTimeFormat(date.getMonth() + 1) +
      '-' +
      this.dateTimeFormat(date.getDate())
    );
  }

  dateTimeFormat(number: number) {
    if (number <= 9) {
      return '0' + number;
    } else {
      return number;
    }
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
