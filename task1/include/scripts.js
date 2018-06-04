(function() {
  var getId;

  deleteGame = function(rowID, ev) {
    var rowElem;

    rowElem = getId("game" + rowID);

    if (rowID !== undefined && rowElem) {
      rowElem.remove();

      ev.preventDefault();
    }
  };

  // DOM element with id are global variables and 
  // can be access directly from window object
  getId = function(elementID) {
    return document.getElementById(elementID) || false;
  }
})();