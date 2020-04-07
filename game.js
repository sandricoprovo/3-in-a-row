(function () {
  let url = 'https://www.mikecaines.com/3inarow/puzzle.php'; // url to pull single puzzle
  let gameJsonData;
  let emptyState = "#EDECE7";
  let stateOne = "#0D3B66";
  let stateTwo = "#EE964B";
  // FUNCTION: This function makes a fetch call using the url variable to attain the json data needed to run the game. If passes the returned data to the setGameGrid function. 
  function startGame() {
    if (localStorage.getItem('3-in-A-Row-Game-Data') === null) {
      // fetch call to get new game data
      fetch(url)
        .then(res => res.status === 200 ? res.json() : null)
        .then(data => {
          gameJsonData = data;
          createGameElements(gameJsonData);
        })
        .catch(err => console.log(err + ": There was an issue loading the data."));
    }
    else {
      // used to delay game load until HTML is loaded in browser.
      setTimeout(() => {
        gameJsonData = loadGameSave(); // function returns json from local storage
        createGameElements(gameJsonData);
      }, 100);
    }
  };
  // FUNCTION: This function takes in the rows array from the data returned from the fetch call within the startGame function. It then creates a table, and assigns each table cell td tag two attributes. These two attributes combined references the index of the corresponding object within the rows array.
  function createGameElements({ rows: gameRows }) {
    let newGameTable = document.createElement('table');
    gameRows.forEach((row, index) => {
      // creates a new table row for each row of object
      let newRow = document.createElement('tr');
      for (let i = 0; i < row.length; i++) {
        let newSquare = setTileDefaults(row[i]); // function returns styled and clickable tile
        newSquare.setAttribute('data-row', index);
        newSquare.setAttribute('data-cell', i);
        newRow.appendChild(newSquare);
      }
      newGameTable.appendChild(newRow); // adds new row to game table
    });
    // Inserting game elements to DOM
    // header
    let gameHeader = document.createElement('H1');
    gameHeader.appendChild(document.createTextNode("3-In-A-Row"));
    // game grid size
    let gridSizeIndicator = document.createElement('H3');
    gridSizeIndicator.appendChild(document.createTextNode(`Grid Size: ${gameRows.length} / ${gameRows.length}`));
    // label
    let checkboxLabel = document.createElement('label')
    checkboxLabel.appendChild(document.createTextNode("Check Status "));
    // check status button
    let statusCheckButton = document.createElement('button');
    statusCheckButton.addEventListener('click', () => { checkProgress(); });
    statusCheckButton.appendChild(document.createTextNode("Check Your Progress"));
    // Save button
    let saveButton = document.createElement('button');
    saveButton.classList.add('gamebtn__save');
    saveButton.addEventListener('click', () => { createGameSave(gameJsonData); });
    saveButton.appendChild(document.createTextNode("Save Your Game"));
    // clear save data button
    let clearButton = document.createElement('button');
    clearButton.classList.add('gamebtn__clear');
    clearButton.addEventListener('click', () => { clearSaveGame(); });
    clearButton.appendChild(document.createTextNode("Erase Save Data"));
    // Buttons Div
    let buttonContainer = document.createElement('div');
    buttonContainer.appendChild(statusCheckButton);
    buttonContainer.appendChild(saveButton);
    buttonContainer.appendChild(clearButton);
    // Error showing checkbox
    let errorCheckbox = document.createElement('input');
    errorCheckbox.addEventListener('change', () => { displayIncorrectSquares(); });
    errorCheckbox.setAttribute('type', 'checkbox');
    let errorCheckboxLabel = document.createElement('label');
    errorCheckboxLabel.appendChild(document.createTextNode("Show incorrect Squares "));
    errorCheckboxLabel.appendChild(errorCheckbox);
    buttonContainer.appendChild(errorCheckboxLabel);
    // inserting elements to DOM
    document.querySelector('#theGame').appendChild(gameHeader);
    document.querySelector('#theGame').appendChild(gridSizeIndicator);
    document.querySelector('#theGame').appendChild(newGameTable);
    document.querySelector('#theGame').appendChild(buttonContainer);
  };
  // FUNCTION: This function takes in each object of the rows array and uses it as a reference for styling the grid and adding the click events to each sqaure. A styled tile as a td element is returned from the function. 
  function setTileDefaults(rowObject) {
    let newTile = document.createElement('td');
    // Setting color or non toggle tiles
    if (!rowObject.canToggle) {
      if (rowObject.currentState === 1) {
        newTile.style.backgroundColor = stateOne;
      } else if (rowObject.currentState === 2) {
        newTile.style.backgroundColor = stateTwo;
      }
    } else {
      // add color to tiles 
      if (rowObject.currentState === 0) {
        newTile.style.backgroundColor = emptyState;
      } else if (rowObject.currentState === 1) {
        newTile.style.backgroundColor = stateOne;
      } else if (rowObject.currentState === 2) {
        newTile.style.backgroundColor = stateTwo;
      }
      //  add click event to tiles that are clickable 
      newTile.addEventListener('click', () => {
        setTileState(newTile, rowObject);
        displayIncorrectSquares();
      });
    }
    return newTile;
  }
  // FUNCTION: This function takes in the current td element tile and its corresponding object from the rows array. It uses the passed in object to update the clicked tiles state, and clicking on the tile changes the currentState property of the matching object. The color of the tile is also changes the indicate the state change to the user. The updated tile is returned from the function. 
  function setTileState(tile, tileObject) {
    let clickedTile = tile;
    let matchObject = tileObject;
    if (matchObject.currentState === 2) {
      matchObject.currentState = 0;
      clickedTile.style.backgroundColor = emptyState;
    } else {
      matchObject.currentState = matchObject.currentState + 1
      if (matchObject.currentState === 1) {
        clickedTile.style.backgroundColor = stateOne;
      } else if (matchObject.currentState === 2) {
        clickedTile.style.backgroundColor = stateTwo;
      }
    }
    return clickedTile;
  }
  // FUNCTION: The following function goes through the row objects and checks if the current state matches the correct state. If all are a match, the game is won and a success message is inserted into the DOM, else a continue message is inserted. 
  function checkProgress() {
    let totalTiles = document.querySelectorAll('td');
    let currentCorrectTiles = []; // array to hold correct answer tiles
    let currentIncorrectTiles = []; // array to hold incorrect answer tiles
    gameJsonData.rows.forEach((row, indexA) => {
      row.forEach((object, indexB) => {
        if (object.currentState === object.correctState) {
          // correct answer tile
          currentCorrectTiles.push(document.querySelector(`[data-row="${indexA}"], [data-Square="${indexB}"]`));
        } else if (object.currentState !== 0) {
          currentIncorrectTiles.push(document.querySelector(`[data-row="${indexA}"], [data-Square="${indexB}"]`))
        }
      })
    })
    // writing success, continue or failure message to DOM
    let phraseNode = document.createElement('h2');
    let phraseText;
    if (currentCorrectTiles.length !== totalTiles.length && currentIncorrectTiles.length === 0) {
      phraseText = document.createTextNode('So far so good!');
    } else if (currentCorrectTiles.length !== totalTiles.length) {
      phraseText = document.createTextNode('There are still incorrect tiles. Keep going!');
    } else {
      phraseText = document.createTextNode("Congradulations! You've solved the puzzle!");
    }
    phraseNode.appendChild(phraseText);
    if (document.querySelector('#theGame').lastElementChild.tagName === 'H2') {
      document.querySelector('#theGame').replaceChild(phraseNode);
    } else {
      document.querySelector('#theGame').appendChild(phraseNode);
    }
    // remove message from DOM after amount of time. 
    if (document.querySelector('#theGame').children = 'h2') {
      setTimeout(() => {
        document.querySelector('#theGame').lastElementChild.remove();
      }, 3000);
    }
  }
  // FUNCTION: This function loops through all of the tiles on the page and uses the current tiles dataset values to find its corresponsing object in the rows array. It then uses that object to see if the current tile is correct. If it is not correct an error indicator is inserted into the tile. Once the checkbox has been turned off the loop removes error indicators. 
  function displayIncorrectSquares() {
    document.querySelectorAll('td').forEach(tile => {
      let tileObject = gameJsonData.rows[tile.attributes[0].value][tile.attributes[1].value];
      // checks to see if the show errors checkbox is checked
      if (document.querySelector('input[type="checkbox"]').checked) {
        // removes current nodes from all tiles
        if (tile.childNodes.length > 0) {
          tile.removeChild(tile.lastChild);
        }
        // Adds indicator that tile is incorrect
        if (tileObject.currentState !== tileObject.correctState) {
          let errorTextElement = document.createElement('p');
          errorTextElement.appendChild(document.createTextNode("🥺"));
          tile.appendChild(errorTextElement);
        }
      }
      // if checkbox is not checked it removes error indicators
      else {
        if (tile.childNodes.length > 0) {
          tile.removeChild(tile.lastChild);
        }
      }
    });
  }
  // Prompts user to confirm reload to prevent losing game progress.
  window.addEventListener('beforeunload', (e) => {
    e.preventDefault();
    // source: https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onbeforeunload
    e.returnValue = "";
  });
  // FUNCTION: This function takes in the current object holding the rows array and saves it to local storage. 
  function createGameSave(gameData) {
    let saveMessage = document.createElement('h2');
    let saveMessageText;
    try {
      // sets current game data objects to local storage
      localStorage.setItem('3-in-A-Row-Game-Data', JSON.stringify(gameData));
      // successfull save message
      saveMessageText = document.createTextNode("Game Save successful!");
    } catch {
      // error save message
      saveMessageText = document.createTextNode("There was an issue saving your game. Please try again.");
    }
    saveMessage.appendChild(saveMessageText);
    document.querySelector('#theGame').appendChild(saveMessage);
    // removes save game message from DOM
    if (document.querySelector('#theGame').children = 'h2') {
      setTimeout(() => { document.querySelector('#theGame').lastElementChild.remove(); }, 5000);
    }
  };
  // FUNCTION: This function retreives the locally stored json string, parsings it back to an object, and then returns it from the function. 
  function loadGameSave() {
    // Parse json back to object and return from function
    return JSON.parse(localStorage.getItem('3-in-A-Row-Game-Data'));
  };
  // FUNCTION: This function removes the saved game data from the browsers local storage. 
  function clearSaveGame() {
    // confirms erase with user and then removes save data from local storage
    if (confirm("Do you really want to erase your save?")) {
      localStorage.removeItem('3-in-A-Row-Game-Data');
    }
  }
  startGame(); // function that loads the game. 
})();