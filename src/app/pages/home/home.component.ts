import { Component, OnInit } from "@angular/core";
import { Game } from "src/app/shared/models/api";
import { gameModel } from "../games/summary/model";
import { LoginComponent } from "../login/login.component";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css", "../../shared/styles/style.css"],
})
export class HomeComponent implements OnInit {
  visibleLogin: boolean = false;
  game: Game = gameModel;

  constructor() {}

  ngOnInit(): void {}

  createNew() {
    this.visibleLogin = true;
  }

  savePositions(event) {
    console.log("event", event);
  }
}
