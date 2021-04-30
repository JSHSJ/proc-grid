import { html, css, LitElement } from 'lit';
import {query, state, property, customElement} from "lit/decorators.js"

interface Cell {
  active: boolean;
  index: number;
}


@customElement('proc-grid')
export class ProcGrid extends LitElement {
  static styles = css`
    :host {
      display: block;
      padding: 4%;
      background-color: #131313;
    }

    .grid {
      display: grid;
      width: 100%;
      grid-template: repeat(var(--cellCount), 1fr) / repeat(var(--cellCount), 1fr);
      gap: 0;
    }

    .cell {
      position: relative;
      height: 0;
      min-width: 0;
      padding-bottom: 100%;
      background-color: #131313;
    }

    .cell::after {
      content: '';
      width: 80%;
      height: 80%;
      left: 10%;
      top: 10%;
      background-color: #131313;
      display: block;
      position: absolute;
    }

    .cell.-active::after {
      background-color: pink;
    }
  `;

  @property({type: Number})
  size!: number;

  @state()
  cells: Cell[] = [];

  @state()
  cellCount!: number;

  @state()
  lastActiveCell!: Cell;

  @state()
  remainingSteps!: number;


  @query('.grid')
  grid!: HTMLDivElement;



  firstUpdated() {

    this.cellCount = this.size * this.size;

    this.cells = Array.from(Array(this.cellCount)).map((v, idx) => ({
      active: false,
      index: idx
    }))

    this.remainingSteps = this.size * this.size - 1;
    window.requestAnimationFrame(() => this.animationStep(1))

    // console.log(this.calculateNeighbours(5))

    const startingPoint = ProcGrid.randomNumberBetween(0, this.cellCount-1);
    this.cells[startingPoint].active = true;
    this.lastActiveCell = this.cells[startingPoint];
  }


  animationStep(timer: number) {
    if (this.remainingSteps <= 0) {
      return
    }

    // next step
    if (timer % 15 !== 0) {
      window.requestAnimationFrame(() => this.animationStep(timer+1))
      return;
    }

    const neighbours = this.calculateNeighbours(this.lastActiveCell.index);
    const randomNeighbour = ProcGrid.getRandomNeighbourThatIsntActive(neighbours);

    if (!randomNeighbour) {
      console.log('game over')
      return
    }

    randomNeighbour.active = true;
    this.lastActiveCell = randomNeighbour;
    this.remainingSteps -=1;

    window.requestAnimationFrame(() => this.animationStep(1))

  }

  calculateNeighbours(cellIndex: number) {
    // return [top, left, bottom, right]
    // if doesnt exist, leave it out
    const neighbours: Cell[] = []

    // top neighbours
    if (cellIndex >= this.size) {
      neighbours.push(this.cells[cellIndex - this.size]);
    }
    // right neighbours
    if ((cellIndex + 1) % 5 !== 0) {
      neighbours.push(this.cells[cellIndex+1]);
    }
    // bottom neighbours
    if (cellIndex < this.size * (this.size - 1)) {
      neighbours.push(this.cells[cellIndex + this.size])
    }
    // left neighbours
    if (cellIndex % 5 !== 0) {
      neighbours.push(this.cells[cellIndex - 1])
    }

    return neighbours;
  }

  static getRandomNeighbourThatIsntActive(neighbours: Cell[]): Cell {
    const randomNeighboursThatArentActive = neighbours.filter(n => !n.active);
    const randomNumber = ProcGrid.randomNumberBetween(0, randomNeighboursThatArentActive.length-1)
    console.log(neighbours, randomNeighboursThatArentActive, randomNumber)

    return randomNeighboursThatArentActive[randomNumber]
  }

  static randomNumberBetween(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min);

  }


  render() {
    return html`
      <div class="grid" style="--cellCount: ${this.size}">
        ${this.cells.map((c) => html`<div class="cell${c.active ? ' -active' : ''}"></div>`)}

      </div>
    `;
  }
}
