// Create split and double down functionality
//      - [ ] Double down
//      - [ ] Split
// Clean up DOM
//      - [ ] Show popup of "You win!" or "You lose!" or "It's a push!" on each player's hand
//      - [ ] Show "Blackjack!", "Busted!" in DOM as appropriate
//      - [x] Get bet info printing to the DOM
// Need to get DOM hiding/showing buttons at appropriate times
//      - [x] move bet DOM creation to fetchDeck()
//      - [x] allow update of wager in dealCards()
// Before making app more complex, figure out how to add additional players
//      - [x] Get proper number of cards dealt in the dealCards function
//      - [x] Get DOM to print the right amount of player divs... probably need to un-hardcode the HTML and put all in JS
//      - [x] Get win conditions working for each player
//      - [x] Get bets working for each player
// settle() may make more sense as a separate function than as part of the Bet class?

document.querySelector('#get-deck').addEventListener('click', fetchDeck)
document.querySelector('#deal').addEventListener('click', dealCards)

let deckID
let addCard
let dealerHits = 1
let dealerCard
let hits = 2
let numOfPlayers
let playerHand = []
let playerCards = []
let playerBet = []
let playerNum = 0
let betForm = []
let betInput = []
let bankroll = []
let dealerCards

const playerCount = document.querySelector('#player-count')

  ///////////////
 //  CLASSES  //
///////////////
class Hand{
    constructor(card1, card2){
        this.card1 = card1
        this.card2 = card2
        this.natural = false
        this.bust = false
        this.aces = 0
        this.handValue = this.calculateValue()
    }

    hitCard(user){
        console.log(user)
        fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`)
            .then(res => res.json()) // parse response as JSON
            .then(data => {
                hits = hits+1
                addCard = `card${hits}`
                
                if (user.includes('playerHand')){
                    playerNum = user.substr(-1, 1)
                    document.querySelector(`#player-cards${playerNum}`).innerHTML += `<img src="${data.cards[0].image}" class="player-cards">`                               
                    playerHand[playerNum][addCard] = data.cards[0].value
                    playerHand[playerNum].calculateValue()
                    if (playerHand[playerNum].handValue > 21){
                        const busted = document.createElement('h2')
                        busted.textContent = 'You Busted!'
                        document.querySelector(`#player${playerNum}`).appendChild(busted)
                        playerHand[playerNum].stand()
                        passTurn()
                    }
                }else if (user.includes('dealerHand')){
                    dealerHits++
                    dealerCard = `card${dealerHits}`
                    dealerCards.innerHTML += `<img src="${data.cards[0].image}">`
                    dealerHand[dealerCard] = data.cards[0].value
                    dealerHand.calculateValue()
                    if (dealerHand.handValue < 17) this.hitCard('dealerHand')
                    if (dealerHand.handValue >= 17) {
                        playerBet[0].settle()
                    }
                }               
            })
            .catch(err => {
                console.log(`error ${err}`)
            });
    }
    stand(){
        playerNum++
        passTurn()
        if (playerNum === playerHand.length){
            if (dealerHand.handValue < 17 || dealerHand.handValue == undefined){
                dealerHand.hitCard('dealerHand')        
            }
        }
    }
    calculateValue(){
        this.handValue = 0
        this.aces = 0
        for (const [prop, value] of Object.entries(this)){
            if (prop.includes('card') && value !== undefined){
                if (value === "JACK" ||
                value === "QUEEN" ||
                value === "KING") { this.handValue += 10
                }else if (value === "ACE"){ 
                    this.handValue += 11
                    this.aces++
                }else if (value !== undefined) this.handValue += Number(value)
            }
        }  
        while (this.handValue > 21 && this.aces > 0){
            this.handValue -= 10
            this.aces--
        }
        // Bust function //
        if (this.handValue > 21) {
            this.bust = true
        }
        return this.handValue
    }
}

class Bet{
    constructor(wager){
        this.bankroll = 1000
        this.wager = wager
    }
    settle(){
        console.log(this)
        console.log(this.wager)

        for (let i = 0; i < numOfPlayers; i++){
            console.log('settling... for player '+i)
            if (playerHand[i].bust === true) console.log("You busted!")
            if (playerHand[i].natural === true && dealerHand.natural === false) playerBet[i].bankroll += (playerBet[i].wager) * 2.5
            else if ((dealerHand.bust === true && playerHand[i].bust === false) || 
                (playerHand[i].handValue > dealerHand.handValue && playerHand[i].bust === false)){
                    console.log(`Player ${i+1} wins!`)
                    playerBet[i].bankroll += playerBet[i].wager * 2
            }else if (playerHand[i].handValue === dealerHand.handValue && playerHand[i].bust === false){
                console.log(`It's a push for Player ${i+1}`)
                playerBet[i].bankroll += playerBet[i].wager
            }else if (playerHand[i].handValue < dealerHand.handValue || playerHand[i].bust === true){
                console.log(`Player ${i+1}, you lose!`)
            }
            console.log(playerBet[i].bankroll)
            // Print bankroll update to DOM
            document.querySelector(`#bankroll${i}`).innerText = 'Bankroll: $'+playerBet[i].bankroll
        }
    }
}

  /////////////////
 //  FUNCTIONS  //
/////////////////

// FETCH DECK/SET NUMBER OF PLAYERS
function fetchDeck(){
    const deckNum = document.querySelector('#deck-quantity').value
    numOfPlayers = Number(playerCount.value)
    
    fetch('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count='+deckNum)
    .then(res => res.json()) // parse response as JSON
    .then(data => {
        console.log(data)
        deckID = data.deck_id
        console.log(deckID)
    })
    .catch(err => {
        console.log(`error ${err}`)
    });

    let div = []
    let label = []
    
    for (let i = 0; i < numOfPlayers; i++){
        // Create DOM elements //
        const header = document.createElement('h2')
        header.innerText = `Player ${i+1}`

        const bankroll = document.createElement('h3')
        bankroll.setAttribute('id', `bankroll${i}`)
        bankroll.innerText = `Bankroll: $1000`
        
        div[i] = document.createElement('div')
        div[i].setAttribute('id', `player${i}`)
        
        playerCards[i] = document.createElement('figure')
        playerCards[i].setAttribute('id', `player-cards${i}`)
        // playerCards[i].setAttribute('class', 'player-cards')
        
        label[i] = document.createElement('label')
        label[i].setAttribute('for', `bet-amount${i}`)
        label[i].textContent = "Bet: "
        
        betForm[i] = document.createElement('form')
        betForm[i].setAttribute('id', `bet${i}`)
        
        betInput[i] = document.createElement('input')
        betInput[i].setAttribute('id', `bet-amount${i}`)
        betInput[i].setAttribute('type', 'number')
        betInput[i].setAttribute('min', 10)
        betInput[i].setAttribute('max', 1000)
        betInput[i].setAttribute('step', 10)
        betInput[i].setAttribute('value', 10)
        
        // Insert elements into DOM //
        document.querySelector('#players').appendChild(div[i])
        document.querySelector(`#player${i}`).appendChild(header)
        document.querySelector(`#player${i}`).appendChild(bankroll)
        document.querySelector(`#player${i}`).appendChild(playerCards[i])
        document.querySelector(`#player${i}`).appendChild(betForm[i])
        document.querySelector(`#bet${i}`).appendChild(label[i])
        document.querySelector(`#bet${i}`).appendChild(betInput[i])

        // Handle bets //
        // if (playerBet[i] == undefined) {
        //     playerBet[i] = new Bet(Number(betInput[i].value))
        // }
        // playerBet[i].wager = Number(betInput[i].value)
        // if (playerBet[i] != undefined) {
        //     playerBet[i].bankroll -= Number(betInput[i].value)
        // }else playerBet[i].bankroll = 1000
    }
}
    
// DEAL INITIAL HANDS
function dealCards(){
    init()
    const numOfCards = (numOfPlayers*2) + 1
    

    fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=`+numOfCards)
        .then(res => res.json()) // parse response as JSON
        .then(data => {
            console.log(data)
            
            // Handle Dealer //
            const dealerFig = document.createElement('figure')
            dealerFig.setAttribute('id', 'dealer-cards')            
            dealerFig.innerHTML = `<img src="${data.cards[0].image}">`
            
            document.querySelector('h2').classList.remove('hidden')
            document.querySelector('#dealer').appendChild(dealerFig)
            dealerCards = document.querySelector('#dealer-cards')
            
            dealerHand = new Hand(data.cards[0].value)     
            
            // Handle Players //
            let cardNum = 1
            
            for (let i = 0; i < numOfPlayers; i++){
                /////////////////////////////////
                // This is one way of printing cards to DOM //
                // const cardOne = document.createElement('img')
                // cardOne.src = `${data.cards[cardNum].image}`
                // cardOne.setAttribute('class', 'player-cards')
                // cardNum++
                // const cardTwo = document.createElement('img')
                // cardTwo.src = `${data.cards[cardNum].image}`
                // cardTwo.setAttribute('class', 'player-cards')

                // document.querySelector(`#player-cards${i}`).appendChild(cardOne)
                // document.querySelector(`#player-cards${i}`).appendChild(cardTwo)
                /////////////////////////
                // Print cards to DOM //
                document.querySelector(`#player-cards${i}`).innerHTML += `<img src="${data.cards[cardNum].image}" class="player-cards">`
                cardNum++
                document.querySelector(`#player-cards${i}`).innerHTML += `<img src="${data.cards[cardNum].image}" class="player-cards">` 

                // Handle hands //
                playerHand[i] = new Hand(data.cards[cardNum - 1].value, data.cards[cardNum].value)
                cardNum++
                
                if (playerHand[i].handValue === 21) {
                    playerHand[i].natural = true
                    console.log(`Player ${i + 1} has BLACKJACK!`)
                }
                if (playerHand[i].card1 === playerHand[i].card2) {
                    console.log(`Player ${i + 1} has the option to split`)
                }
                if (playerHand[i].handValue === 9 || playerHand[i].handValue === 10 || playerHand.handValue === 11){
                    console.log(`Player ${i + 1} has the option to doubledown`)
                }
                if (dealerHand.card1 === "ACE" || dealerHand.card1 === "10") console.log('insurance option')
                
                // Handle bets //
                if (playerBet[i] == undefined) {
                    playerBet[i] = new Bet(Number(betInput[i].value))
                }
                playerBet[i].wager = Number(betInput[i].value)
                if (playerBet[i] != undefined) {
                    playerBet[i].bankroll -= Number(betInput[i].value)
                }else playerBet[i].bankroll = 1000

                // Print bankroll update to DOM //
                document.querySelector(`#bankroll${i}`).innerText = 'Bankroll: $'+playerBet[i].bankroll
            }
            passTurn()
        })
        .catch(err => {
            console.log(`error ${err}`)
        });

}

// PASS TURN 
function passTurn(){
    if (document.querySelector('#hit')) document.querySelector('#hit').remove()
    if (document.querySelector('#stand')) document.querySelector('#stand').remove()

    if (playerNum !== numOfPlayers){
        const hitButton = document.createElement('input')
        hitButton.setAttribute('id', 'hit')
        hitButton.setAttribute('type', 'button')
        hitButton.setAttribute('value', 'Hit Me!')
        document.querySelector(`#bet${playerNum}`).appendChild(hitButton).addEventListener('click', playerHand[playerNum].hitCard.bind(event, `playerHand${playerNum}`))
        
        const standButton = document.createElement('input')
        standButton.setAttribute('id', 'stand')
        standButton.setAttribute('type', 'button')
        standButton.setAttribute('value', 'Stand.')
        document.querySelector(`#bet${playerNum}`).appendChild(standButton).addEventListener('click', playerHand[playerNum].stand)
    }
}

// CLEAR DOM/HANDS
function init(){
    playerHand = []
    playerNum = 0
    if (document.querySelector('#dealer-cards')) document.querySelector('#dealer-cards').remove()
    for (let i = 0; i < numOfPlayers; i++){
        document.querySelector(`#player-cards${i}`).innerHTML = ''
    }
}