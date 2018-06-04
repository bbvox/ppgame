(function() {
  // DOM element with id are global variable and 
  // can be access directly from window object
  let getId = elementID =>
    (document.getElementById(elementID) || false);

  //deleteGame is global 
  // and call from onClick button
  deleteGame = (rowID, ev) => {
    let rowElem = getId("game" + rowID);

    if (rowID !== undefined && rowElem) {
      rowElem.remove();
      ev.preventDefault();
    }
  };

})();