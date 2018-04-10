import { Component, OnInit } from '@angular/core';
import { PurposeService } from './purpose.service';
import { PortCallService } from '../../../../../../shared/services/port-call.service';

const OTHER_PURPOSE_ID = "100249";

@Component({
  selector: 'app-purpose',
  templateUrl: './purpose.component.html',
  styleUrls: ['./purpose.component.css'],
  providers: [PurposeService]
})
export class PurposeComponent implements OnInit {

  selectedPurposes: any;
  purposeList: any[];
  amountOfPurposes: number = 0;

  otherPurposeSelected: boolean = false;
  otherPurposeName: string = "";

  constructor(private purposeService: PurposeService, private portCallService: PortCallService) { }

  ngOnInit() {
    this.purposeService.getPurposes().subscribe(
      data => {
        this.purposeList = data;
        this.amountOfPurposes = Object.keys(this.purposeList).length;
      }
    );
    this.portCallService.portCallPurposeData$.subscribe(
      data => {
        if (data != null) {
          this.selectedPurposes = data;
          this.otherPurposeSelected = this.selectedPurposes.includes(OTHER_PURPOSE_ID);      
        }
      }
    );
    this.portCallService.otherPurposeName$.subscribe(
      data => {
        this.otherPurposeName = data;
      }
    );
  }

  purposeSelected() {
    this.otherPurposeSelected = this.selectedPurposes.includes(OTHER_PURPOSE_ID);

    this.portCallService.setPortCallPurposeData(this.selectedPurposes);
    if (this.otherPurposeSelected) {
      this.setOtherPurposeName();
    }
  }

  setOtherPurposeName() {
    this.portCallService.setOtherPurposeName(this.otherPurposeName);
  }

  getPurposeName(id: number) {
    if (this.purposeList != null) {
      let purpose = this.purposeList.find(p => p.portCallPurposeId == id);
      if (purpose.portCallPurposeId != OTHER_PURPOSE_ID) {
        return purpose != null ? purpose.name : null;
      } else {

        return this.otherPurposeName == "" ? "Other purpose is undefined" : "Other: \"" + this.otherPurposeName + "\"";
      }
    }
  }

}