import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ViewCell } from 'ng2-smart-table';
import { PortCallClaims } from '../../../../../shared/constants/port-call-claims';
import { PortCallStatusTypes } from '../../../../../shared/constants/port-call-status-types';
import { PortCallDetailsModel } from '../../../../../shared/models/port-call-details-model';
import { AccountService } from '../../../../../shared/services/account.service';
import { ConstantsService } from '../../../../../shared/services/constants.service';
import { ContentService } from '../../../../../shared/services/content.service';
import { PortCallOverviewService } from '../../../../../shared/services/port-call-overview.service';
import { PortCallService } from '../../../../../shared/services/port-call.service';

@Component({
  selector: 'app-button-row',
  templateUrl: './button-row.component.html',
  styleUrls: ['./button-row.component.css'],
  providers: [ConstantsService]
})
export class ButtonRowComponent implements ViewCell, OnInit {

  @Input() value: string | number;
  @Input() rowData: any;

  @Output() edit: EventEmitter<any> = new EventEmitter();

  overviewData: any[];
  draftOverviewData: any[];
  clearedOverviewData: any[];

  permissions = PortCallClaims.buttonRowPermissions;
  portCallIsDraft: boolean = false;
  portCallIsCancelled: boolean = false;

  constructor(private constantsService: ConstantsService, private accountService: AccountService, private overviewService: PortCallOverviewService, private contentService: ContentService, private portCallService: PortCallService, private modalService: NgbModal) { }

  ngOnInit() {
    this.portCallIsDraft = (this.rowData.overviewModel.status == PortCallStatusTypes.DRAFT);
    this.portCallIsCancelled = (this.rowData.overviewModel.status == PortCallStatusTypes.CANCELLED);
    this.accountService.userClaimsData$.subscribe(
      userClaims => {
        if (userClaims) {
          let userClaimsTypePortCall = userClaims.filter(claim => claim.type == PortCallClaims.TYPE); // Find user claims where claim type is Port Call
          var keys = Object.keys(this.permissions);
          keys.forEach(key => {
            this.permissions[key] = (userClaimsTypePortCall.some(claim => claim.value.toUpperCase() == key.toString().toUpperCase()));
          });
        }
      }
    );

    this.overviewService.overviewData$.subscribe(
      results => {
        if (results) this.overviewData = results;
      }
    );
    this.overviewService.draftOverviewData$.subscribe(
      results => {
        if (results) this.draftOverviewData = results;
      }
    );
    this.overviewService.clearedByUserAgencyOverviewData$.subscribe(
      results => {
        if (results) this.clearedOverviewData = results;
      }
    )
  }

  onViewClick() {
    this.setContent('View Port Call');
  }

  onEditClick() {
    this.setContent('Register Port Call');
  }

  onClearanceClick() {
    this.setContent('Port Call Clearance');
  }

  onCancelClick(content: any) {
    this.modalService.open(content);
  }

  onDeleteClick(content: any) {
    this.modalService.open(content);
  }

  cancelPortCall() {
    let pcId = this.rowData.overviewModel.portCall.portCallId;
    this.rowData.overviewModel.status = PortCallStatusTypes.CANCELLED;
    if (this.overviewData.find(r => r.overviewModel.portCall.portCallId == pcId)) {
      this.overviewData.find(r => r.overviewModel.portCall.portCallId == pcId).status = `<div class="text-danger">` + this.rowData.overviewModel.status + `</div>`;
      this.overviewService.setOverviewData(this.overviewData);
    }
    if (this.draftOverviewData.find(r => r.overviewModel.portCallId == pcId)) {
      this.overviewData.find(r => r.overviewModel.portCall.portCallId == pcId).status = `<div class="text-danger">` + this.rowData.overviewModel.status + `</div>`;
      this.overviewService.setDraftData(this.draftOverviewData);
    }
    if (this.clearedOverviewData.find(r => r.overviewModel.portCallId == pcId)) {
      this.overviewData.find(r => r.overviewModel.portCall.portCallId == pcId).status = `<div class="text-danger">` + this.rowData.overviewModel.status + `</div>`;
      this.overviewService.setClearedData(this.clearedOverviewData);
    }
    this.portCallService.updatePortCallStatusCancelled(this.rowData.overviewModel.portCall.portCallId);

  }

  deletePortCall() {
    this.portCallService.deletePortCallDraft(this.rowData.overviewModel.portCall).subscribe(
      deleteResponse => {
        if (deleteResponse) {
          let newOverviewData = this.overviewData.filter(row => row != this.rowData);
          let newDraftData = this.draftOverviewData.filter(row => row != this.rowData);
          let newClearedData = this.clearedOverviewData.filter(row => row != this.rowData);
          this.overviewService.setOverviewData(newOverviewData);
          this.overviewService.setDraftData(newDraftData);
          this.overviewService.setClearedData(newClearedData);
        }
      }, error => {
        console.log(error);
      }
    );
  }

  private setContent(content: string) {  // NEW CLEANUP
    this.setPortCall(content);
  }

  // NEW CLEANUP - Set methods
  setPortCall(content) {
    this.portCallService.setPortCall(this.rowData.overviewModel);
    this.setPurpose(content);
  }
  setPurpose(content) {
    this.portCallService.getPurposeByPortCallId(this.rowData.overviewModel.portCall.portCallId).subscribe(
      purposeData => {
        if (purposeData) {
          if (purposeData.find(p => p.name == "Other")) {
            this.portCallService.getOtherName(this.rowData.overviewModel.portCall.portCallId).subscribe(
              otherNameData => {
                this.portCallService.setOtherPurposeName(otherNameData);
                this.portCallService.setPortCallPurposeData(purposeData);
                this.setDetails(content)
              }
            );
          } else {
            this.portCallService.setPortCallPurposeData(purposeData);
            this.setDetails(content);
          }
        } else {
          console.log("No purpose information has been registered for this port call.");
        }
      },
      error => {
        console.log("Get Purpose Error: ", error);
      }
    );
  }
  setDetails(content) {
    this.portCallService.getDetailsByPortCallId(this.rowData.overviewModel.portCall.portCallId).subscribe(
      detailsData => {
        if (detailsData) {
          this.portCallService.setDetails(detailsData)
        }
        else {
          console.log("No details information has been registered for this port call.");
          let portCallDetails = new PortCallDetailsModel();
          portCallDetails.portCallDetailsId = this.rowData.overviewModel.portCall.portCallId;
          portCallDetails.portCallId = this.rowData.overviewModel.portCall.portCallId;
          this.portCallService.setDetails(portCallDetails);
        }
        this.contentService.setContent(content);

      },
      error => {
        console.log("Get Details Error: ", error);
      }
    );
  }

}
