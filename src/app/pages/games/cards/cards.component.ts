import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { AppService } from "src/app/services/app.service";
import { CardService } from "src/app/services/cards.service";
import { GameService } from "src/app/services/game.service";
import { getErrors } from "src/app/shared/helpers/get-message-errors";
import { Card, Deck, Game } from "src/app/shared/models/api";

@Component({
  selector: "app-cards",
  templateUrl: "./cards.component.html",
  styleUrls: [
    "./cards.component.css",
    "../../../shared/styles/style.css",
    "../../../shared/styles/cardsAndDecks.css",
    "../../../shared/styles/card.css",
  ],
})
export class CardsComponent implements OnInit {
  deckSelected: Deck;
  cardSelected: Card;
  cardDefault: Card;
  isBack: boolean = false;
  isCardSelected: boolean = false;
  game: Game;

  @ViewChild("cardContainer") cardContainer: ElementRef;
  cardWidth: number = window.innerWidth / 5;

  deckIndex: number;
  cardIndex: number = -1;

  constructor(private appService: AppService, private cardService: CardService, private gameService: GameService) {}

  ngOnInit(): void {
    this.clearCardRequest();

    this.gameService.getGame().subscribe((game) => {
      if (game !== this.game) {
        this.game = game;
        this.selectDeck(0);
        this.initCards();
      }
    });

    this.appService.setGlobalLoading(false);
  }

  clearCardRequest() {
    this.cardSelected = this.mockNewCard();
  }

  initCards() {
    this.appService.setGlobalLoading(true);

    try {
      this.cardService.pullCards(this.game);
    } catch (errors) {
      console.log("errors", errors);
      this.appService.setAppAlerts(getErrors(errors).map((error) => ({ message: error, type: "danger" })));
    }

    this.appService.setGlobalLoading(false);
  }

  selectDeck(index: number) {
    if (index >= this.game.decks.length) {
      this.appService.setAppAlerts([{ message: "Invalid card index. Please, reload the page", type: "danger" }]);
      return;
    }
    if (this.game.decks && this.game.decks[this.deckIndex]) this.selectCard(-1);
    this.deckIndex = index;
    this.deckSelected = this.game.decks[this.deckIndex];
  }

  selectCard(index: number) {
    this.cardIndex = index;
    if (index < 0) {
      this.isCardSelected = false;
      this.cardSelected = this.mockNewCard();
      return;
    }
    this.isCardSelected = true;
    this.cardSelected = this.deckSelected.cards[this.cardIndex];
  }

  mockNewCard(cardIndex: number = -1): Card {
    var newCard: Card = {
      _id: null,
      deck: this.game ? this.game.decks[this.deckIndex]._id : null,
      repetitions: cardIndex < 0 ? 1 : this.game.decks[this.deckIndex].cards[cardIndex].repetitions,
      cardFront: {
        title: cardIndex < 0 ? "" : this.game.decks[this.deckIndex].cards[cardIndex].cardFront.title,
        art: cardIndex < 0 ? "" : this.game.decks[this.deckIndex].cards[cardIndex].cardFront.art,
        description: cardIndex < 0 ? "" : this.game.decks[this.deckIndex].cards[cardIndex].cardFront.description,
        effect: cardIndex < 0 ? "" : this.game.decks[this.deckIndex].cards[cardIndex].cardFront.effect,
        cost: cardIndex < 0 ? 0 : this.game.decks[this.deckIndex].cards[cardIndex].cardFront.cost,
        level: cardIndex < 0 ? 0 : this.game.decks[this.deckIndex].cards[cardIndex].cardFront.level,
        earning: cardIndex < 0 ? 0 : this.game.decks[this.deckIndex].cards[cardIndex].cardFront.earning,
      },
      cardBack: {
        title: cardIndex < 0 ? "" : this.game.decks[this.deckIndex].cards[cardIndex].cardBack.title,
        answers: cardIndex < 0 ? "" : this.game.decks[this.deckIndex].cards[cardIndex].cardBack.answers,
        effect: cardIndex < 0 ? "" : this.game.decks[this.deckIndex].cards[cardIndex].cardBack.effect,
        cost: cardIndex < 0 ? 0 : this.game.decks[this.deckIndex].cards[cardIndex].cardBack.cost,
        level: cardIndex < 0 ? 0 : this.game.decks[this.deckIndex].cards[cardIndex].cardBack.level,
        earning: cardIndex < 0 ? 0 : this.game.decks[this.deckIndex].cards[cardIndex].cardBack.earning,
      },
    };

    return newCard;
  }

  isCardValid(): string[] {
    var errors: string[] = [];

    if (this.cardSelected.repetitions > 30) {
      errors.push(`Card repetitions must be up to 30`);
    }

    if (this.cardSelected.repetitions < 1) {
      errors.push(`Card repetitions must be greater than 0`);
    }

    Object.keys(this.cardSelected.cardFront).forEach((key, index) => {
      if (key != "art" && this.deckSelected.deckFront[key]) {
        if (!this.cardSelected.cardFront[key] || this.cardSelected.cardFront[key] === "" || this.cardSelected.cardFront[key] === 0) {
          errors.push(`Front's ${key} is invalid`);
        }
      }
    });

    Object.keys(this.cardSelected.cardBack).forEach((key, index) => {
      if (this.deckSelected.deckBack[key]) {
        if (!this.cardSelected.cardBack[key] || this.cardSelected.cardBack[key] === "" || this.cardSelected.cardBack[key] === 0) {
          errors.push(`Back's ${key} is invalid`);
        }
      }
    });

    return errors;
  }

  saveCard() {
    var errors = this.isCardValid();
    if (errors.length > 0) {
      this.appService.setAppAlerts(errors.map((error) => ({ message: error, type: "danger" })));
      return;
    }

    this.appService.setGlobalLoading(true);
    if (this.cardIndex < 0) {
      console.log("when save", this.game.decks[this.deckIndex]);
      this.cardSelected.deck = this.game.decks[this.deckIndex]._id;
      console.log("when save 2", this.cardSelected);

      this.cardService.createCard(this.cardSelected).subscribe(
        (card) => {
          this.game.decks[this.deckIndex].cards.push(card);
          this.gameService.setGame(this.game);
          this.selectCard(-1);
          this.appService.setAppAlerts([{ message: "Saved", type: "success" }]);
        },
        (errors: Object) => {
          console.log("errors", errors);
          this.appService.setAppAlerts(getErrors(errors).map((error) => ({ message: error, type: "danger" })));
        }
      );
    } else {
      this.cardService.updateCard(this.cardSelected).subscribe(
        (card) => {
          this.game.decks[this.deckIndex].cards[this.cardIndex] = this.cardSelected;
          this.gameService.setGame(this.game);
          this.selectCard(-1);
          this.appService.setAppAlerts([{ message: "Saved", type: "success" }]);
        },
        (errors: Object) => {
          console.log("errors", errors);

          this.appService.setAppAlerts(getErrors(errors).map((error) => ({ message: error, type: "danger" })));
        }
      );
    }
    this.appService.setGlobalLoading(false);
  }

  onEdit(index: number) {
    this.selectCard(index);
  }

  onDelete(index: number) {
    this.isCardSelected = false;
    this.cardIndex = -1;
    this.game.decks[this.deckIndex].cards.splice(index);
    this.cardSelected = this.mockNewCard();
  }

  onCreateFrom(index: number) {
    this.isCardSelected = false;
    this.cardIndex = -1;
    this.cardSelected = this.mockNewCard(index);
  }
}
