var Game = Game || {};
(function() {
  var list = {
    players: [],
    games: []
  };

  //Constructor
  Game = function(elementID, disableFlag) {
    if (!elementID || !this.getId(elementID)) {
      return new Error("Missing argument or element.");
    }

    this.init(elementID, disableFlag);
  }

  // input fields from add Game form
  Game.prototype.fields = {
    ids: ["player1", "player2"],
    element: []
  }
  Game.prototype.blankImage = "src/images/paint.png";
  Game.prototype.tmpResult = {
    player1: [],
    player2: [],
    cnt: 0
  };

  Game.prototype.init = function(elementID, disableFlag) {
    this.getElements(elementID);

    this.renderGames();
    if (!disableFlag) {
      this.renderPlayer(0);
      this.renderPlayer(1);
    }
  }

  /**
   * Get & store main DOM elements
   * @call from constructor
   *
   * @param {string} elementID - DOM element id.
   *
   */
  Game.prototype.getElements = function(elementID) {
    this.el = this.getId(elementID);

    this.fields.element[0] = this.getId(this.fields.ids[0]);
    this.fields.element[1] = this.getId(this.fields.ids[1]);
  }

  // 
  Game.prototype.renderGames = function() {
    var gamesHtml = "<ul>";

    for (var i = 0; i < list.games.length; i++) {
      gamesHtml += this.htmlRow(i);
    }

    gamesHtml += "</ul>";

    this.el.innerHTML = gamesHtml;
  }

  // renderPlayer field
  Game.prototype.renderPlayer = function(fieldID) {
    var playersHtml;

    playersHtml = "<option value=''>Look for player</option>";

    for (var i = 0; i < list.players.length; i++) {
      playersHtml += this.htmlOption(i);
    }

    this.fields.element[fieldID].innerHTML = playersHtml;
  }

  Game.prototype.htmlOption = function(playerID) {
    var tmpl = `
    <option value="${playerID}">
    ${list.players[playerID]}
    </option>
    `;

    return tmpl;
  }

  Game.prototype.htmlRow = function(gameID) {
    var tmpl, gameData, gameClass, gamePlayers;
    if (!list.games[gameID]) {
      return;
    }

    if (list.games[gameID].winner == list.games[gameID].id1) {
      gameClass = "win";
    } else {
      gameClass = "lose";
    }

    tmpl = `
    <li class="${gameClass}" id="game${gameID}">
      <a href="#" class="delbtn" onClick="game.deleteGame(${gameID}, event)"></a>
      ${this.htmlGame(gameID)}
    </li>`;

    return tmpl;
  }

  Game.prototype.htmlGame = function(gameID) {
    var tmpl, gameData, playersData;

    if (gameID === undefined || !list.games[gameID]) {
      return;
    }

    gameData = list.games[gameID];
    playersData = [
      list.players[gameData.id1],
      list.players[gameData.id2]
    ];

    tmpl = `
      <ul class="flex game">
        <li><img src="${this.blankImage}" alt=""></li>
          <li>
            ${playersData[0]} ${gameData.result} ${playersData[1]}
            <p class="score">${gameData.scores.join(" | ")}</p>
          </li>
          <li><img src="${this.blankImage}"></li>
        </ul>`;

    return tmpl;
  }

  Game.prototype.addGame = function() {
    var result, gameData = {};

    gameData.id1 = this.fields.element[0].value;
    gameData.id2 = this.fields.element[1].value;

    if (gameData.id1 === "" || gameData.id2 === "" || gameData.id1 === gameData.id2) {
      return new Error("Choose players should be different each other.");
    } else if (isNaN(gameData.id1) && isNaN(gameData.id2)) {
      gameData.id1 = list.players.indexOf(gameData.id1);
      gameData.id2 = list.players.indexOf(gameData.id2);
    }

    this.resetTmp();
    result = this.getResult();
    gameData.result = result.player1.length + " - " + result.player2.length;
    gameData.scores = result.player1.concat(result.player2);

    //winner player1    
    if (result.player1.length > result.player2.length) {
      gameData.winner = gameData.id1;
    } else {
      gameData.winner = gameData.id2;
    }

    //add game at the beggining of the list
    list.games.unshift(gameData);

    this.renderGames();
  }

  Game.prototype.resetTmp = function() {
    this.tmpResult = {
      player1: [],
      player2: [],
      cnt: 0
    }
  }

  /**  Generate random result
   *
   */
  Game.prototype.getResult = function() {
    var result, win1, win2;

    result = this.getSet();

    if (result.player1) {
      this.tmpResult.player1.push(result.player1.join("-"))
    } else if (result.player2) {
      this.tmpResult.player2.push(result.player2.join("-"))
    }
    this.tmpResult.cnt++;
    win1 = this.tmpResult.player1.length;
    win2 = this.tmpResult.player2.length;

    if ((win1 - win2 >= 2) || (win2 - win1 >= 2) || this.tmpResult.cnt === 5) {
      return this.tmpResult;
    } else {
      return this.getResult();
    }
  }

  /**
   * getSet method
   * get random score for set with random winner
   *
   * @return {object} {player1:} || {player2:}
   */
  Game.prototype.getSet = function() {
    var oneSet = [];

    oneSet[0] = this.random();
    oneSet[1] = this.random();

    if (oneSet[0] >= 11 && (oneSet[0] - oneSet[1] > 2)) {
      return { "player1": oneSet };
    } else if (oneSet[1] >= 11 && (oneSet[1] - oneSet[0] > 2)) {
      return { "player2": oneSet };
    } else {
      return this.getSet();
    }
  }

  Game.prototype.random = function() {
    return Math.floor(Math.random() * 12);
  }

  Game.prototype.deleteGame = function(gameID, ev) {
    var rowElement;

    rowElement = this.getId("game" + gameID);
    if (gameID === undefined || !rowElement) {
      return new Error("Missing gameID or element.");
    }

    rowElement.remove();
    ev && ev.preventDefault();

    this.deleteGameList(gameID);
  }

  Game.prototype.deleteGameList = function(gameID) {
    list.games = list.games.filter(function(value, key) {
      return key !== gameID;
    });
  }

  /* Excercise 3 */
  Game.prototype.onChange = function(event) {
    var fieldID, searchTerm;

    fieldID = event.target.id;
    searchTerm = event.target.value;

    if (!searchTerm) {
      return this.clearPlayersList(fieldID);
    }

    var foundPlayers = this.filterPlayers(searchTerm);

    this.renderPlayersList(foundPlayers, fieldID);
  }

  Game.prototype.filterPlayers = function(searchStr) {
    var foundPlayers;
    searchStr = searchStr.toLowerCase();
    foundPlayers = list.players.filter(function(value) {
      var lowerCase = value.toLowerCase();

      return lowerCase.indexOf(searchStr) === 0;
    });

    return foundPlayers;
  }

  Game.prototype.renderPlayersList = function(playersList, fieldID) {
    var playersHtml;

    playersHtml = "<ul>";
    playersList.forEach(player => {
      playersHtml += `<li>`;
      playersHtml += `<a href="#" onClick="game.setPlayer(event, '${fieldID}')">${player}</a>`
      playersHtml += `</li>`;
    });
    playersHtml += "</ul>";

    this.getId(fieldID + "List").innerHTML = playersHtml;
  }

  Game.prototype.setPlayer = function(event, fieldID) {
    var playerName, elementKey;

    playerName = event.target.text;
    elementKey = (fieldID === "player1") ? 0 : 1;

    this.fields.element[elementKey].value = playerName;

    this.clearPlayersList(fieldID);

    event.preventDefault();
  }

  Game.prototype.clearPlayersList = function(playerFieldID) {
    this.getId(playerFieldID + "List").innerHTML = "";
  }

  // DOM element with id are global variables and 
  // can be access directly from window object
  Game.prototype.getId = function(elementID) {
    return document.getElementById(elementID) || false;
  }

  list.players = [
    "Achanta Sharath Kamal",
    "Alamiyan Noshad",
    "Apolonia Tiago",
    "Aruna Quadri",
    "Assar Omar",
    "Boll Timo",
    "Calderano Hugo",
    "Chen Chien-An",
    "Cho Seungmin",
    "Chuang Chih-Yuan",
    "Drinkhall Paul",
    "Duda Benedikt",
    "Fan Zhendong",
    "Fang Bo",
    "Fagerl Stefan",
    "Falore Tristan",
    "Fareitas Marcos",
    "Filus Ruwen",
    "Franziska Patrick",
    "Gacina Andrej",
    "Gao Ning",
    "Gardos Robert",
    "Gauzy Simon",
    "Gerassimenko Kirill",
    "Gionis Panagiotis",
    "Gnanasekaran Sathiyan",
    "Groth Jonathan",
    "Habesohn Daniel",
    "Harimoto Tomokazu",
    "Ho Kwan Kit",
    "Jang Woojin",
    "Jeong Sangeun",
    "Jeoung Youngsik",
    "Karlsson Kristian",
    "Karlsson Mattias",
    "Kou Lei",
    "Lebesson Emmanuel",
    "Lee Sangsu",
    "Liao Cheng-Ting",
    "Lim Jonghoon",
    "Lin Gaoyuan"
  ];

  list.games = [
    { id1: 3, id2: 5, winner: 5, result: "2-4", "scores": ["11-8", "12-14", "6-11", "4-11"] },
    { id1: 1, id2: 2, winner: 1, result: "4-2", "scores": ["11-8", "12-14", "6-11", "4-11"] },
  ];
})();

if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = Game;
}