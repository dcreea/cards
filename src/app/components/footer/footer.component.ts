import { Component, OnInit } from "@angular/core";
import "@cds/core/icon/register.js";
import { ClarityIcons, userIcon } from "@cds/core/icon";

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.css"],
})
export class FooterComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    ClarityIcons.addIcons(userIcon);
  }
}
