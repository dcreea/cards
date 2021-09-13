import { Component, OnInit } from "@angular/core";
import { AppService } from "src/app/services/app.service";
import { GameService } from "src/app/services/game.service";
import { StateService } from "src/app/services/states.service";
import { getErrors } from "src/app/shared/helpers/get-message-errors";
import { ConditionalRule, EffectRule, Game, State, StatementRule } from "src/app/shared/models/api";

@Component({
  selector: "app-state",
  templateUrl: "./state.component.html",
  styleUrls: ["./state.component.css", "../../../shared/styles/style.css"],
})
export class StateComponent implements OnInit {
  showStatementForm: boolean = false;
  showConditionalForm: boolean = false;
  showTransitionForm: boolean = false;
  showEffectForm: boolean = false;
  show: boolean = false;
  showStateForm: boolean = false;
  showDeletePopup: boolean = false;
  isConditionalRule: boolean = false;

  game: Game; // = gameModel;

  gameId: string;

  conditionalRuleRequest: ConditionalRule;
  effectRuleRequest: EffectRule;
  statementRuleRequest: StatementRule;

  stateSelected: State;

  stateIndex: number = -1;

  constructor(private appService: AppService, private stateService: StateService, private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.getGame().subscribe((game) => {
      this.game = game;
      this.gameId = game._id;
    });

    this.clear();
  }

  onEdit(index: number) {
    this.stateSelected = this.game.states[index];
    this.stateIndex = index;
  }

  onDelete(index: number) {
    this.showDeletePopup = true;
    this.stateSelected = this.game.states[index];
  }

  deleteState() {
    //...

    this.clearRequest();
  }

  //////////////////

  isStateValid() {
    var errors: string[] = [];

    if (!this.stateSelected) {
      return ["No data to save"];
    }

    if (!this.stateSelected.transition && !this.stateSelected.conditionalRule) {
      errors.push("Please, create a transition or a conditional rule to this state");
    }

    if (this.stateSelected.label === "Game Start" || this.stateSelected.label === "Game Over") {
      errors.push("You can't create or edit neither states 'Game Start' or 'Game Over'");
    }

    return errors.length > 0 ? errors : null;
  }

  saveState() {
    this.appService.setGlobalLoading(true);

    var errors = this.isStateValid();
    if (errors) {
      this.appService.setAppAlerts(errors.map((error) => ({ message: error, type: "danger" })));
      return;
    }

    if (this.stateIndex >= 0) {
      // update
      this.stateService.updateState(this.stateSelected).subscribe(
        (res) => {
          if (res) {
            this.game.states[this.stateIndex] = res;
            this.clearRequest();
            this.appService.setGlobalLoading(false);
            this.appService.setAppAlerts([{ message: "State Updated", type: "success" }]);
          }
        },
        (errors: string[]) => {
          console.log("errors when create", errors);
          this.appService.setGlobalLoading(false);
          this.appService.setAppAlerts(getErrors(errors).map((error) => ({ message: error, type: "danger" })));
        }
      );
    } else {
      //save

      this.stateService.createState(this.stateSelected).subscribe(
        (res) => {
          if (res) {
            this.game.states.push(res);
            this.clearRequest();
            this.appService.setGlobalLoading(false);
            this.appService.setAppAlerts([{ message: "State Created", type: "success" }]);
          }
        },
        (errors: string[]) => {
          console.log("errors when create", errors);
          this.appService.setGlobalLoading(false);
          this.appService.setAppAlerts(getErrors(errors).map((error) => ({ message: error, type: "danger" })));
        }
      );
    }
  }

  onSaveStatementRule(rule: StatementRule) {
    this.stateSelected.statementRules.push(rule);
    this.appService.setAppAlerts([{ message: "Rule added to state", type: "success" }]);
  }

  onSaveConditionalRule(rule: ConditionalRule) {
    this.stateSelected.transition = null;
    this.stateSelected.conditionalRule = rule;
    this.appService.setAppAlerts([{ message: "Rule added to state", type: "success" }]);
  }

  onSaveEffectRule(rule: EffectRule) {
    // this.stateSelected.effectRule = rule;
    this.appService.setAppAlerts([{ message: "Rule added to state", type: "success" }]);
  }

  onDeleteStatementRule(index: number) {
    this.stateSelected.statementRules = this.stateSelected.statementRules.filter((res, i) => i != index);
    console.log(this.stateSelected.statementRules);
  }

  onSaveTransitionRule() {
    this.stateSelected.conditionalRule = null;
    this.appService.setAppAlerts([{ message: "Rule added to state", type: "success" }]);
  }

  //////////////////////////

  mockNewState(index?: number) {
    var state: State = {
      _id: null,
      game: this.game._id,
      color: "#dedede",
      purpose: index >= 0 && index < this.game.states.length ? this.game.states[index].purpose : "",
      label: index >= 0 && index < this.game.states.length ? this.game.states[index].label : "",
      conditionalRule: index >= 0 && index < this.game.states.length ? this.game.states[index].conditionalRule : null,
      statementRules: index >= 0 && index < this.game.states.length ? this.game.states[index].statementRules : [],
      transition: index >= 0 && index < this.game.states.length ? this.game.states[index].transition : null,
      width: 160,
      height: 80,
      x: 30,
      y: 30,
    };
    return state;
  }

  ////////////////////////////

  showStatementRule() {
    this.hideAllRules();
    this.showStatementForm = true;
  }

  showEffectRule() {
    this.hideAllRules();
    this.showEffectForm = true;
  }

  showConditionalRule() {
    this.hideAllRules();
    this.showConditionalForm = true;
  }

  showTransitionRule() {
    this.hideAllRules();
    this.showTransitionForm = true;
  }

  hideAll() {
    this.hideAllRules();
    this.show = false;
    this.showStateForm = false;
    this.showDeletePopup = false;
  }

  hideAllRules() {
    this.showStatementForm = false;
    this.showConditionalForm = false;
    this.showTransitionForm = false;
    this.showEffectForm = false;
  }

  clearRequest() {
    this.stateSelected = this.mockNewState();
    this.stateIndex = -1;
  }

  clear() {
    this.clearRequest();
    this.hideAll();
  }
}
