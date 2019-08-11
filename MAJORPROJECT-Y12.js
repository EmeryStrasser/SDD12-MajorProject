
let playingMusic = true;

//Creation of the 2 main arrays used in the application
let usernamePasswordArray = [];
let quizArray = [];

//The variables needed to connect the application to the firebase database and to use the functionality of firebase
let database = firebase.database();
let UsernamePasswordRef = database.ref('/UsernamePassword');
let quizRef = database.ref('/quizDB');

//The default sorting mechansism of the quiz
let defaultSort = "alphabetical";

let quizName;
let quizDescription;


let questionArray = [];

let username;

let questionNumber;


let quizNumberCell;
let quiznameCell;
let quizDescCell;
let quizRatingCell;
let authorCell;

let currentQuestion;
let lastQuizId;
let questionCounter = 0;

let score;

let isSearchingBool = false;

UsernamePasswordRef.once('value').then(reloadUsername);
quizRef.once('value').then(reloadQuiz);
audioSection.play();


//This function is used, so that the application doesnt instantanously try and access the usernameDatabase before it grabbed the data from firebase database
function reloadUsername(data) {

  if (usernamePasswordArray == null) usernamePasswordArray = []; //If there is no data in the online database, it creates an empty array

  usernamePasswordArray = data.val();//Adding the incoming data into a object

  //Once the database has been accessed, each item in the database is checked to see if it is empty
  for (i = 0; i < usernamePasswordArray.length; i++) {

    //Checking the item to see if it has a value
    if (typeof usernamePasswordArray[i] == 'undefined') {

      //If the item doesnt have a value, that item is spliced out of the array so that there are no empty values int he databse because that could cause issues
      usernamePasswordArray.splice(i, 1);

    }

  }

  UsernamePasswordRef.set(usernamePasswordArray); //Once the appropiate empty fields are spliced from the array, the external firebase database is updated with the new array
}


//This function is used, so that the application doesnt instantanously try and access the quiz database before it grabbed the data from firebase database
function reloadQuiz(data) {

  //If there is no data in the online databse, it creates an empty array
  if (quizArray == null) quizArray = [];

  quizArray = data.val();//Adding the incoming data into a object

  //Once the database has been accessed, each item in the database is checked to see if it is empty
  for (i = 0; i < quizArray.length; i++) {

    //Checking the item to see if it has a value
    if (typeof quizArray[i] == 'undefined') {

      //If the item doesnt have a value, that item is spliced out of the array so that there are no empty values int he databse because that could cause issues
      quizArray.splice(i, 1);
      i--;

    }

  }

  quizRef.set(quizArray);//Once the appropiate empty fields are spliced from the array, the external firebase database is updated with the new array

  InsertionRate();  //Once all the empty quizzes are spliced, the array is then sorted via an insertion sort

}


//This function is used so that when you click the button to change the order of sorting, it will change the button to the oppisite method of sorting that is currently displayed so that it switched between the 2
function changeOrder() {

  //Checks what the next sort is supposed to be
  if (defaultSort === "alphabetical") {

    InsertionAlphabet(); //Sorts the array via alphebetical order

    defaultSort = "rate"; //Changes the next sort to sort by rating

    document.getElementById("changeOrderButton").innerHTML = "SORT RATING"; //Changed the label on the button to reflect the following sorting mechanism
  }
  else if (defaultSort === "rate") {
    InsertionRate(); //Sorts the array via rating
    defaultSort = "alphabetical";//Changes the next sort to sort by alphebetical order
    document.getElementById("changeOrderButton").innerHTML = "SORT ALPHABETICAL"; //Changed the label on the button to reflect the following sorting mechanism

  }
}


//This function is used to login to the application. It will loop through the username array and check for the value which the user has put in for there username and password. If it is found it will grant them access to the application
function Login() {

  let UserCheck = document.getElementById("loginUsername").value; //Creating a variable which has the evalue of the username which the user has put in
  let noSpaces = replaceSpace(UserCheck); //Creates a new variable which is the same as the userCheck variable but all the spaces have been replaced by underscores
  let passwordCheck = document.getElementById("loginPassword").value; //Creates a new variable to store the password which the user has placed in

  for (i = 0; i < usernamePasswordArray.length; i++) {//Looping through the array

    if (noSpaces === usernamePasswordArray[i][0]) {//Looping through all the usernames and checking if there are any matches

      //If the username has matched, it will then check if the passwords match
      if (passwordCheck === usernamePasswordArray[i][1]) {

        username = noSpaces; //If it does match then it will store the current username in a variable for later user
        goToPage(quizPage);//It will then access the main quiz page
        return;
      }
    }
  }
  alert("no matches found") //If there are no matches for the username and/or password, it will alert the user
}


//A function used to create a new member for the application adn check to see if it is already in use
function NewMember() {

  let UserCheck = document.getElementById("newUsername").value; //Creating a variable which has the evalue of the username which the user has put in
  let noSpaces = replaceSpace(UserCheck);//Creates a new variable which is the same as the userCheck variable but all the spaces have been replaced by underscores
  let passwordCheck = document.getElementById("newPassword").value; //Creates a new variable to store the password which the user has placed in

  if (noSpaces === "") {

    alert("Please input all fields");
    return
  }

  if (passwordCheck === "") {
    alert("Please input all fields");
    return
  }

  for (i = 0; i < usernamePasswordArray.length; i++) {//Looping through the array

    if (noSpaces === usernamePasswordArray[i][0]) {//Looping through all the usernames and checking if there are any matches

      alert("Username is already being used");//If there are username matches, then it will alret the user that the usename is already being used

      return;
    }

    username = noSpaces; //It will then store the current user for later use in the application

  }

  usernamePasswordArray.push([noSpaces, passwordCheck]); //Once it has checked that there are no matching usernames, it will push the new usenrame and password to the username array
  UsernamePasswordRef.update(usernamePasswordArray); //It will then update the external firebase databse with the new values

  goToPage(quizPage); //It will then grant the user access to the application, this function takes in the nae of the page which will be accesed

}

//This function is uses to replace all spaces within a username to underscores, it takes in a string and returns thr same string without spaces
//THIS IS THE STRING MANIPULATION
function replaceSpace(userString) {

  let tempString = ""; //It creates a temporary empty string which will later hold the actual string
  for (i = 0; i < userString.length; i++) { //Looping through each character of the username string

    if (userString[i] === " ") { //If the chracter is a space it will replace the temporary string with itself followed by an underscore
      tempString = tempString + "_"; //Replacing it with an underscore

    } else {

      tempString = tempString + userString[i]; //If the character is not a space, it will add the current letter to the temporray string

    }
  }

  return tempString; //Returning the new string which has been manipulated

}

//This function is used to create a new quiz, it is called via a button
function quizCreation() {

  quizName = document.getElementById("quizName").value; //Storing the name of the quiz in a variable
  quizDescription = document.getElementById("quizDescription").value; //Storing the description in a variablr

  questionNumber = 1; //The default starting quiz question number
  document.getElementById("questionNumber").innerHTML = questionNumber; //Replacing a heading with the current quiz number

}

//Once the quiz itself has been created, the user then adds questions to the quiz, it is called whenever the user creates a new question
function questionCreation() {

  //Storing all the appropiate data for the question inside variables
  let question = document.getElementById("quizQuestion").value;
  let answer1 = document.getElementById("answer1").value;
  let answer2 = document.getElementById("answer2").value;
  let answer3 = document.getElementById("answer3").value;
  let answer4 = document.getElementById("answer4").value;

  //Storing which answer is the correct answer
  let checkbox1 = document.getElementById("Answer1Correct").checked;
  let checkbox2 = document.getElementById("Answer2Correct").checked;
  let checkbox3 = document.getElementById("Answer3Correct").checked;
  let checkbox4 = document.getElementById("Answer4Correct").checked;
  if (question === "") {
    alert("Please input a questions") //If they are empty the user gets an alert and cannot proceed
    return


  }
  if (answer1 === "" || answer2 === "" || answer3 === "" || answer4 === "") { //Checking to see whether all answers have are not empty

    alert("Please input all answers") //If they are empty the user gets an alert and cannot proceed
    return
  }
  if (checkbox1 === false && checkbox2 === false && checkbox3 === false && checkbox4 === false) { //Checking whether at least 1 answer is correct

    alert("Please have at least one correct answer") //If none are correct then the user gets an alert and cant proceed
    return
  }
  questionNumber++; //Updating the current question number

  document.getElementById("questionNumber").innerHTML = questionNumber; //Updating the heading to reflect the current question number


  questionArray.push([question, [answer1, checkbox1], [answer2, checkbox2], [answer3, checkbox3], [answer4, checkbox4]]); //Adding a new record to the question array, which is composed of the question, the 4 answers, and which ones are correct.


  //Resetting the page back to blank for the next questions creaton
  document.getElementById("quizQuestion").value = "";
  document.getElementById("answer1").value = "";
  document.getElementById("answer2").value = "";
  document.getElementById("answer3").value = "";
  document.getElementById("answer4").value = "";
  document.getElementById("Answer1Correct").checked = false;
  document.getElementById("Answer2Correct").checked = false;
  document.getElementById("Answer3Correct").checked = false;
  document.getElementById("Answer4Correct").checked = false;

}

//Once all the questions have been created, this function 
function finishQuizCreation() {

  //Storing all the appropiate data for the question inside variables
  let question = document.getElementById("quizQuestion").value;
  let answer1 = document.getElementById("answer1").value;
  let answer2 = document.getElementById("answer2").value;
  let answer3 = document.getElementById("answer3").value;
  let answer4 = document.getElementById("answer4").value;

  //Storing which answer is the correct answer
  let checkbox1 = document.getElementById("Answer1Correct").checked;
  let checkbox2 = document.getElementById("Answer2Correct").checked;
  let checkbox3 = document.getElementById("Answer3Correct").checked;
  let checkbox4 = document.getElementById("Answer4Correct").checked;

  if (answer1 === "" || answer2 === "" || answer3 === "" || answer4 === "") { //Checking to see whether all answers have are not empty

    alert("Please input all answers") //If they are empty the user gets an alert and cannot proceed
    return
  }
  if (checkbox1 === false && checkbox2 === false && checkbox3 === false && checkbox4 === false) { //Checking whether at least 1 answer is correct

    alert("Please have at least one correct answer") //If none are correct then the user gets an alert and cant proceed
    return
  }

  //Adding a new record to the question array, which is composed of the question, the 4 answers, and which ones are correct.
  questionArray.push([question, [answer1, checkbox1], [answer2, checkbox2], [answer3, checkbox3], [answer4, checkbox4]]);

  //Resetting the page back to blank for the next questions creaton
  document.getElementById("quizQuestion").value = "";
  document.getElementById("answer1").value = "";
  document.getElementById("answer2").value = "";
  document.getElementById("answer3").value = "";
  document.getElementById("answer4").value = "";
  document.getElementById("Answer1Correct").checked = false;
  document.getElementById("Answer2Correct").checked = false;
  document.getElementById("Answer3Correct").checked = false;
  document.getElementById("Answer4Correct").checked = false;

  //Adding the entire quiz record into the quiz array, the record consists of the quiz name, description, rating, amount of players, the author and also the question array that has been created via creating questions
  quizArray.push([quizName, quizDescription, 0, username, questionArray, 0]);

  //Resetting the question array back to empty for the next quiz creation
  questionArray = [];

  quizRef.update(quizArray); //Updating the external quiz database with the new quiz data

  InsertionRate(); //Sorting the quiz by rating

  goToPage(quizPage); //Calls the function to display the main quiz page. Takes in the name of the page as the parameter

}


//This function takes in the paremeter of a row number in order to fill out all of the cells in the row with the appropiate data. This is used for displaying the quizzes in the quiz table
function fillCells(currentRow) {

  //In cell 1, a play button is placed with an onClick function that calls the playQuiz function with a parameter of the current row.
  quizNumberCell.innerHTML = "<i class='fas fa-play w3-button w3-xxlarge w3-round-xlarge' onclick='playQuiz(" + currentRow + ")'></i>"

  //In cell 2, it displays the quiz name of the current row
  quiznameCell.innerHTML = quizArray[currentRow][0];

  //In cell 3, it displays the quiz description
  quizDescCell.innerHTML = quizArray[currentRow][1];

  //In cell 4 it displays the rating
  quizRatingCell.innerHTML = quizArray[currentRow][2];

  //In cell 5 it dispays the author
  authorCell.innerHTML = quizArray[currentRow][3];

}

goToPage(mainPage);//Calls code to change page at beginning of program. it takes in the parameter of the page that is wanted.


function mute() { //Function to mute the music thats being played

  if (playingMusic === true) {
    audioSection.pause();
    playingMusic = false;
  } else {

    audioSection.play();
    playingMusic = true;
  }
}


function goToPage(pageNumber) {  //This function takes in a single parameter which is the name of the id of a div that is going to be displayed

  document.querySelectorAll('.pages').forEach((e) => e.hidden = true); //hides all pages with a class of pages
  pageNumber.hidden = false;//shows page needed


  //Resetting all input data such that it still isnt there when the user goes to that page again
  document.getElementById("newUsername").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("loginUsername").value = "";
  document.getElementById("loginPassword").value = "";
  document.getElementById("quizName").value = "";
  document.getElementById("quizDescription").value = "";

}

//THis function takes in a single parameter, which is the id of the quzi that is going to be played. 
function playQuiz(quizId) {

  score = 0; //Resetting the current score back to 0
  goToPage(questions); //Displaying the question page via this function that takes in a single parameter.
  currentQuestion = 0; //Restting the current question back to default
  questionCounter = 1 //Setting the amount of questions to 1 as there has to be at leats 1 question
  document.getElementById("quizQuestionNumber").innerHTML = questionCounter; //Displaying the current question on the top of the screen
  lastQuizId = quizId; //Storing the quizId variable to be used later on in the program

  //Setting the question and the 4 answers to the 1st questions data in the database
  document.getElementById("question").innerHTML = quizArray[quizId][4][currentQuestion][0];
  document.getElementById("q1").innerHTML = quizArray[quizId][4][currentQuestion][1][0];
  document.getElementById("q2").innerHTML = quizArray[quizId][4][currentQuestion][2][0];
  document.getElementById("q3").innerHTML = quizArray[quizId][4][currentQuestion][3][0];
  document.getElementById("q4").innerHTML = quizArray[quizId][4][currentQuestion][4][0];

}

//Once the user has completed a question, they press next to go to the nect question. THis function takes in the previous questions answer
function nextQuestion(answerChoice) {

  if (quizArray[lastQuizId][4][currentQuestion][answerChoice][1] === true) { //Checking to see if the answer that was given matches any of the answers for that question in the databse

    score++; //If it does match, then the score goes up by 1
    alert("Correct"); //An alert to tell the user they got it correct

  }
  else {
    alert("Wrong"); //If it does not match,an alert tells the user they got it wrong

  }

  currentQuestion++; //THe current question is then moved to the following question

  if (currentQuestion === quizArray[lastQuizId][4].length) { //This is checking to see of all the questions have been completed

    goToPage(results); //The function is called to go to the results page
    document.getElementById("result").innerHTML = score; //Displaying the score on the screen
    document.getElementById("amountOfQuestions").innerHTML = quizArray[lastQuizId][4].length //Showing how many questions were in the quiz
    return;

  }

  questionCounter++; //If the quiz is not yet finished, the questions counter goes up by 1
  document.getElementById("quizQuestionNumber").innerHTML = questionCounter;

  //The questions and the answers are updated to the next question
  document.getElementById("question").innerHTML = quizArray[lastQuizId][4][currentQuestion][0];
  document.getElementById("q1").innerHTML = quizArray[lastQuizId][4][currentQuestion][1][0];
  document.getElementById("q2").innerHTML = quizArray[lastQuizId][4][currentQuestion][2][0];
  document.getElementById("q3").innerHTML = quizArray[lastQuizId][4][currentQuestion][3][0];
  document.getElementById("q4").innerHTML = quizArray[lastQuizId][4][currentQuestion][4][0];

}


function finishQuiz() { //THis function is called once the user has finished the quiz and had finsihed rating the quiz


  let rate = document.getElementById("rate").value; //The given rating is stored in a variable for an average calculation

  if (document.getElementById("rate").value === "") { //Checking to see if the user gave a rating
    alert("Please input a rating"); //if they did not, an alert pops up which tells them to do so
    return;

  }

  if (rate < 0 || rate > 10) { //Making sure that the rating is between 0 and 10

    alert("Please input a number between 0 and 10"); //If it isnt, then an alert pops up
    return;

  }

  let currentAmountOfRatings = quizArray[lastQuizId][5]; //Stores the current amount of people who have played that quiz in a variable

  currentAmountOfRatings++; //Increases the current amount of players by 1 since user had just played it

  quizArray[lastQuizId][5] = currentAmountOfRatings;//Updating the array with the new amount of players

  quizRef.update(quizArray); //Updating the external database

  let currentAverageRate = quizArray[lastQuizId][2]; //Stores the current average rate in a variable

  let additionOfRates = currentAverageRate * (currentAmountOfRatings - 1); //Storing the addition of all the previos ratings in a variable

  let newAdditionOfRates = parseFloat(additionOfRates) + parseFloat(rate); //Adding the users given rating to the total addition of ratings

  let newAverageRate = (Math.round((newAdditionOfRates / currentAmountOfRatings) * 10)) / 10; //Creates a new average rating by dividing this new addion by the current amount of players

  quizArray[lastQuizId][2] = newAverageRate; //Updating the quiz array
  quizRef.update(quizArray);//Updating the external databse

  var quizRow = document.getElementById("quizTable").rows[lastQuizId + 2].cells; //Dispalyign the new average rating in the quiz table
  quizRow[3].innerHTML = newAverageRate;//Dispalyign the new average rating in the quiz table

  goToPage(quizPage); //Going back to the quiz page

  InsertionRate(); //Resorting the quiz via rating as the ratings have now been changed
}


//This function is used to sort the quiz array via rating

//INSERTION SORTING
function InsertionRate() {

  let first = 0; //Setting a variable called first to 0
  let last = quizArray.length - 1; //Setting the last variable to the length of the array
  let nextPos = last - 1; //Setting the item which the last variable will be compared with

  while (nextPos >= first) { //This loop runs until the comparision variable is 0 and the array has been fully sorted

    let nextSwapItem = quizArray[nextPos]; //setting the object that is to be sorted
    let nextItem = quizArray[nextPos][2]; //Creating a variable which has the value that will actually be used for comparison. I.e the rating
    let current = nextPos; //Setting the current item to the next position

    while (current < last && nextItem < quizArray[current + 1][2]) { // This loops until the swap has been accomplished

      current++; //Increasing the current item by 1
      quizArray[current - 1] = quizArray[current]; //Swapping the 2 items

    }

    quizArray[current] = nextSwapItem; //Swapping the 2 items
    nextPos--; //Moving the posistion down
  }

  quizRef.update(quizArray); //Updating the external database

  document.getElementById('tbody').innerHTML = ''; //Accesing the logBook
  var testRow = document.getElementById('tbody').insertRow(0);//Adding row to the table

  for (i = 0; i < quizArray.length; i++) { //Looping throught the array

    var quizTable = document.getElementById("quizTable"); //Accesing logbooks
    var row = quizTable.insertRow(quizTable.rows.length);//Inserting a new row
    quizNumberCell = row.insertCell(0); //Inserting the different cells 
    quiznameCell = row.insertCell(1);
    quizDescCell = row.insertCell(2);
    quizRatingCell = row.insertCell(3);
    authorCell = row.insertCell(4);

    fillCells(i); //calling function to fill the cells with appropiate data, takes parameter of the array index.

  }

}

//This function is used to sort the quiz array via alphabetical order

//INSERTION SORTING

function InsertionAlphabet() {

  let first = 0;//Setting a variable called first to 0
  let last = quizArray.length - 1;//Setting the last variable to the length of the array
  let nextPos = last - 1;//Setting the item which the last variable will be compared with

  while (nextPos >= first) {//This loop runs until the comparision variable is 0 and the array has been fully sorted

    let nextSwapItem = quizArray[nextPos];//setting the object that is to be sorted
    let nextItem = quizArray[nextPos][0];//Creating a variable which has the value that will actually be used for comparison. I.e the name
    let current = nextPos;//Setting the current item to the next position

    while (current < last && nextItem > quizArray[current + 1][0]) { // This loops until the swap has been accomplishedv

      current++;//Increasing the current item by 1
      quizArray[current - 1] = quizArray[current];//Swapping the 2 items

    }

    quizArray[current] = nextSwapItem;//Swapping the 2 items
    nextPos--; //Moving the posistion down
  }

  quizRef.update(quizArray); //Updating the xternal databse
  document.getElementById('tbody').innerHTML = ''; //Accesing the logBook
  var testRow = document.getElementById('tbody').insertRow(0);//Adding row to the table

  for (i = 0; i < quizArray.length; i++) { //Looping throught the array

    var quizTable = document.getElementById("quizTable"); //Accesing logbooks
    var row = quizTable.insertRow(quizTable.rows.length);//Inserting a new row
    quizNumberCell = row.insertCell(0); //Inserting the different cells 
    quiznameCell = row.insertCell(1);
    quizDescCell = row.insertCell(2);
    quizRatingCell = row.insertCell(3);
    authorCell = row.insertCell(4);


    fillCells(i); //calling function to fill the cells with appropiate data, takes parameter of the array index.

  }

}


//This function completes a binary search for a quiz name that the user wants

//BINARY SEARCH
function binarySearch() {

  InsertionAlphabet(); //Firstly putting the quiz into alphabetical order


  let searchItem = document.getElementById("search").value; //Creating a variable for the users input

  if (searchItem === "") { //If the user has not put in a search item, the list is resorted back to what it was before
    if (defaultSort === "alphabetical") { //
      InsertionRate();//list is resorted back to what it was before
    }
    else if (defaultSort === "rate") {
      InsertionAlphabet();//list is resorted back to what it was before
    }
    alert("Not found"); //An alert stating that there was no found results
    return;

  }

  //the main mechanics of the bianry search

  let low = 0;//Letting the lowest variable to 0
  let high = quizArray.length - 1; //Setting the highest variable
  let found = false;
  let middle;
  let bottom; //Creating the top, bottom variable in order to show all of the items that match the search
  let top;
  let searchedArray = []; //Creating the temp array to store the searching array

  while (high >= low && found === false) { //Looping until its been found

    middle = Math.round((low + high) / 2); //Setting the middle variabel to the middle of the sorted array

    if (startInclude(searchItem.toLowerCase(), quizArray[middle][0].toLowerCase()) === true) { //Checking to see if any of the quizzes start with the search text. startInclude function takes in the seach text converted to lowercase and also the current comparison quiz name in lowercase
      found = true; //Setting found to ture

    }
    else if (searchItem.toLowerCase() < quizArray[middle][0].toLowerCase()) { //Checking to see if its lower alphebetically
      console.log("search < middle");
      high = middle - 1; //if so it minues 1 from the high variable


    }
    else {//If its not equal and not higher then lower is increased by 1

      low = middle + 1;

    }

  }

  if (found === true) { //Once found, then it will check either side of that item to find all items that start with the search text

    if (middle === 0) {  //If the found item is at the bottom then there is no need to check on th elower side of the item

      bottom = middle;

    }
    else {
      for (a = 1; a < middle + 1; a++) { //If its not at the bottom, it will loop through every item below the item and check to see of it matches the search criterua


        if (startInclude(searchItem, quizArray[middle - a][0]) === true) { //If it does include the text then it continues checking

        }
        else {//If ot then it sets the lowest variable as the previous check

          bottom = middle - a + 1;
          break;

        }
      }
    }

    if (middle === quizArray.length - 1) {//If the found item is at the top then no need to search above

      top = middle;

    } else {
      for (u = 1; u < ((quizArray.length) - (middle)); u++) { //Looping through to find the highest variable


        if (startInclude(searchItem, quizArray[middle + u][0]) === true) { //Checking to see if it includes the text

        }
        else {

          //If not then it sets the highest variable to the previously found top
          top = middle + u - 1;
          break;

        }
      }
    }

    document.getElementById('tbody').innerHTML = ''; //Accesing the logBook
    var testRow = document.getElementById('tbody').insertRow(0);//Adding row to the table

    for (i = bottom; i < top + 1; i++) {
      console.log(i + " count");
      var quizTable = document.getElementById("quizTable"); //Accesing logbooks
      var row = quizTable.insertRow(quizTable.rows.length);//Inserting a new row
      quizNumberCell = row.insertCell(0); //Inserting the different cells 
      quiznameCell = row.insertCell(1);
      quizDescCell = row.insertCell(2);
      quizRatingCell = row.insertCell(3);
      authorCell = row.insertCell(4);

      //Accesing the cell and filling in the cell with values from the array and the objects
      quizNumberCell.innerHTML = "<i class='fas fa-play w3-button w3-xxlarge w3-round-xlarge' onclick='playQuiz(" + i + ")'></i>"
      quiznameCell.innerHTML = quizArray[i][0];
      quizDescCell.innerHTML = quizArray[i][1];
      quizRatingCell.innerHTML = quizArray[i][2];
      authorCell.innerHTML = quizArray[i][3];

    }
  }
  else {//If no results are found, it will put the quiz back to the sorted order it was before the quiz was serached
    if (defaultSort === "alphabetical") {
      InsertionRate();
    }
    else if (defaultSort === "rate") {
      InsertionAlphabet();
    }
    alert("Not found");
  }

}

function startInclude(searchText, includesText) { //This function takes in 2 variables in order to check if it begins with a piece of text. 
  //The searchText is the string that the user is searching for. The includes text is the quiz name being currently searched


  let searchTextArray = searchText.split(""); //Creating an array that is composed of all the letters in the serach text
  let includesTextArray = includesText.split("");//Creating an array that is composed of all the letters in the includes text text


  for (i = 0; i < searchTextArray.length; i++) {//Looping through the amount of letters in the searchText

    if (searchTextArray[i] !== includesTextArray[i]) {//Checking every letter of the search text with the letters of the includes text

      return false;//If at any stage it doesnt match then it returns false

    }

  }

  return true; //If it does match then it returns true
}
