if (typeof require !== "undefined") {
  var expect = require("chai").expect;
  var sinon = require("sinon");
  var Game = require("../src/scripts");
}

let testData = {
  element: "listGames",
  elPlayer1: "player1",
  elPlayer2: "player2",
  searchStr: "as",
  searchStrUpper: "AS",
  searchExpect: ["Assar Omar"],
  player: "Assar Omar",
  noop: function () {}
};

describe("Constructor initialization", () => {
  let game, spies = {};

  it("should throw Error w/o argument", () => {
    game = new Game();
    expect(game).to.be.an.instanceof(Error);
  });

  it("should throw Error with missing element", () => {
    sinon.stub(Game.prototype, 'getId').returns(false);

    game = new Game();
    expect(game).to.be.an.instanceof(Error);
  });

  it("should be OK and call init method", () => {
    sinon.stub(Game.prototype, 'getId').returns(true);

    spies.init = sinon.spy(Game.prototype, 'init');

    game = new Game(testData.element);

    expect(spies.init.called).to.be.true;
    spies.init.restore();
  });

  it("should be OK and instanceof Game", () => {
    sinon.stub(Game.prototype, 'getId').returns(true);

    game = new Game(testData.element);
    expect(game).to.be.an.instanceof(Game);
  });

  afterEach(() => {
    if (Game.prototype.getId.restore) {
      Game.prototype.getId.restore();
    }
  });
});


describe("Delete game method", () => {
  let game, stubs = {};

  beforeEach(() => {
    stubs.getId = sinon.stub(Game.prototype, 'getId');
    stubs.getId.onCall(0).returns(true);
    stubs.init = sinon.stub(Game.prototype, 'init');

    game = new Game(testData.element);
  });

  it("should return Error when elementID is missing", () => {
    stubs.getId.onCall(1).returns(false);
    let delGame = game.deleteGame(2);

    expect(delGame).to.be.an.instanceof(Error);
  });

  it("should be OK and call element remove function", () => {
    let spy = sinon.spy();
    stubs.getId.onCall(1).returns({ remove: spy });
    
    game.deleteGame(2);
    expect(spy.called).to.be.true;
  });

  afterEach(() => {
    stubs.getId.restore();
    stubs.init.restore();
  });
});

describe("Add game method", () => {
  let game, stubs = {},
    spies = {};

  beforeEach(() => {
    stubs.getId = sinon.stub(Game.prototype, 'getId');
    stubs.getId.onCall(0).returns(true);
    stubs.init = sinon.stub(Game.prototype, 'init');

    game = new Game(testData.element);
  });

  it("should return Error when players2 is the same as player1", () => {
    game.fields.element = [{ value: 1 }, { value: 1 }];
    
    const addGame = game.addGame();
    expect(addGame).to.be.an.instanceof(Error);
  });

  it("should be OK and call resetTmp, getResult & renderGames", () => {
    spies.resetTmp = sinon.spy(game, 'resetTmp');
    spies.getResult = sinon.spy(game, 'getResult');

    stubs.renderGames = sinon.stub(game, 'renderGames');

    game.fields.element[0] = { value: 1 };
    game.fields.element[1] = { value: 2 };

    game.addGame();
    expect(spies.resetTmp.called).to.be.true;
    expect(spies.getResult.called).to.be.true;

    expect(stubs.renderGames.called).to.be.true;
  });

  afterEach(() => {
    stubs.getId.restore();
    stubs.init.restore();
  });
});

describe("Get result & getSet method", () => {
  let game, stubs = {},
    spies = {};

  beforeEach(() => {
    stubs.getId = sinon.stub(Game.prototype, 'getId');
    stubs.getId.onCall(0).returns(true);
    stubs.init = sinon.stub(Game.prototype, 'init');

    game = new Game(testData.element);
  });

  it("should return set winner: player1 or player2", () => {
    const setResult = game.getSet();

    expect(setResult).to.have.any.keys('player1', 'player2');
  });

  it("should return winner set score at least 11 points and diff at least 2", () => {
    let winScore, loseScore;

    const setResult = game.getSet();
    if (setResult.player1) {
      winScore = setResult.player1[0];
      loseScore = setResult.player1[1];
    } else if (setResult.player2) {
      winScore = setResult.player2[1];
      loseScore = setResult.player2[0];
    }

    expect(winScore).to.be.at.least(11);
    expect(winScore - loseScore).to.be.at.least(2);
  })

  it("should call method X times for X sets(max 5)", () => {
    spies.getResult = sinon.spy(game, 'getResult');

    const gameResult = game.getResult();
    const totalSets = gameResult.player1.length + gameResult.player2.length;

    expect(spies.getResult.callCount).to.be.equal(totalSets);
    expect(spies.getResult.callCount).to.be.below(6);
  });

  afterEach(() => {
    stubs.getId.restore();
    stubs.init.restore();
  });
});

/* EXERCISE 3 */
describe("Handle on Player fields change - autocomplete", () => {
  let game, stubs = {},
    spies = {};

  beforeEach(() => {
    stubs.getId = sinon.stub(Game.prototype, 'getId');
    stubs.getId.onCall(0).returns(true);
    stubs.init = sinon.stub(Game.prototype, 'init');

    game = new Game(testData.element);
  });

  it("should clean player fields on empty string", () => {
    spies.clearPlayersList = sinon.spy(game, 'clearPlayersList');
    stubs.getId.onCall(1).returns(true);

    game.onChange({ target: { id: testData.player1, value: "" } });

    expect(spies.clearPlayersList.called).to.be.true;
    expect(spies.clearPlayersList.calledWith(testData.player1)).to.be.true;
  });

  it("should call filterPlayers with searchString & renderPlayersList with fieldID", () => {
    spies.filterPlayers = sinon.spy(game, 'filterPlayers');
    spies.renderPlayersList = sinon.spy(game, 'renderPlayersList');
    stubs.getId.onCall(1).returns(true);

    game.onChange({ target: { id: testData.elPlayer1, value: testData.searchStr } });

    expect(spies.filterPlayers.calledWith(testData.searchStr)).to.be.true;
    expect(spies.renderPlayersList.args[0][1]).to.be.equal(testData.elPlayer1);
  });

  it("should search be case insensitive and return", () => {
    const searcLowerCase = game.filterPlayers(testData.searchStr);
    const searchUpperCase = game.filterPlayers(testData.searchStrUpper);

    expect(searcLowerCase).to.deep.equal(searchUpperCase);
    expect(searcLowerCase).to.deep.equal(testData.searchExpect);
  });

  it("should set field value and clear playerList", () => {
    spies.clearPlayersList = sinon.spy(game, 'clearPlayersList');
    stubs.getId.onCall(1).returns(true);

    game.setPlayer({ target: { text: testData.player }, preventDefault: testData.noop}, testData.elPlayer1);

    expect(game.fields.element[0].value).to.be.equal(testData.player);
    expect(stubs.getId.secondCall.args[0]).to.be.equal(testData.elPlayer1 + "List");
  });


  afterEach(() => {
    stubs.getId.restore();
    stubs.init.restore();
  });
});