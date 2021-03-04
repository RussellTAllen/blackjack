// Before making app more complex, figure out how to add additional players
//          - [x] Get proper number of cards dealt in the dealCards function
//          - [x] Get DOM to print the right amount of player divs... probably need to un-hardcode the HTML and put all in JS
//          - [ ] Get win conditions working for each player
//          - [ ] Get bets working for each player
// Need to get DOM hiding/showing buttons at appropriate times

document.querySelector('#get-deck').addEventListener('click', fetchDeck)
document.querySelector('#deal').addEventListener('click', dealCards)

let deckID
let addCard
let hits = 2
let numOfPlayers
let playerHand = []
let playerBet = []
let betForm = []

const dealerCards = document.querySelector('#dealer-cards')
const playerCount = document.querySelector('#player-count')

///////////
// CLASSES
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
        console.log(this)
        fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`)
            .then(res => res.json()) // parse response as JSON
            .then(data => {
                console.log(this)
                hits = hits+1
                addCard = `card${hits}`
                
                if (this === 'playerHand'){
                    playerCards.innerHTML += `<img src="${data.cards[0].image}">`                               
                    playerHand[addCard] = data.cards[0].value
                    playerHand.calculateValue()
                }else if (user === 'dealerHand'){
                    dealerCards.innerHTML += `<img src="${data.cards[0].image}">`
                    dealerHand[addCard] = data.cards[0].value
                    dealerHand.calculateValue()
                    if (dealerHand.handValue < 17) this.hitCard('dealerHand')
                    if (dealerHand.handValue > 17) playerBet.settle()
                }               
            })
            .catch(err => {
                console.log(`error ${err}`)
            });
    }   
    calculateValue(){
        this.handValue = 0
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
        // BUST FUNCTION!
        if (this.handValue > 21) {
            this.bust = true
            playerBet.settle()
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
        console.log(this.wager)
        console.log('settling...')
        if (playerHand.bust === true) console.log("You busted!")
        if ((dealerHand.bust === true && playerHand.bust === false) || 
            (playerHand.handValue > dealerHand.handValue && playerHand.bust === false)){
                console.log('You win!')
                this.bankroll += this.wager + this.wager
        }else if (playerHand.handValue === dealerHand.handValue && playerHand.bust === false){
            console.log("It's a push")
            this.bankroll += this.wager
        }else if (playerHand.handValue < dealerHand.handValue || playerHand.bust === true){
            console.log("You lose!")
        }
        console.log(playerBet.bankroll)
    }
}

/////////////
// FUNCTIONS
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
}

// DEAL INITIAL HANDS
function dealCards(){
    init()
    const numOfCards = (numOfPlayers*2) + 1

    fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=`+numOfCards)
        .then(res => res.json()) // parse response as JSON
        .then(data => {
            console.log(data)
            
            dealerCards.innerHTML = `<img src="${data.cards[0].image}">`
            dealerHand = new Hand(data.cards[0].value)     
            
            let div = []
            let betForm = []
            let betInput = []
            let cardNum = 1
            let label = []
            
            
            for (let i = 0; i < numOfPlayers; i++){
                // Create DOM elements
                const header = document.createElement('h2')
                header.innerText = `Player ${i+1}`

                div[i] = document.createElement('div')
                div[i].setAttribute('id', `player${i}`)                
                
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
                
                // Insert elements into DOM
                document.querySelector('#players').appendChild(div[i])
                document.querySelector(`#player${i}`).appendChild(header)
                div[i].innerHTML += `<img src="${data.cards[cardNum].image}">`
                cardNum++
                div[i].innerHTML += `<img src="${data.cards[cardNum].image}">`  
                document.querySelector(`#player${i}`).appendChild(betForm[i])
                document.querySelector(`#bet${i}`).appendChild(label[i])
                document.querySelector(`#bet${i}`).appendChild(betInput[i])

                // Handle hands
                playerHand[i] = new Hand(data.cards[cardNum - 1].value, data.cards[cardNum].value)
                
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
                
                cardNum++
                
                // Handle bets
                playerBet[i] = new Bet(Number(betForm.value))
                playerBet[i].wager = Number(betForm.value)
                if (playerBet[i] != undefined) {
                    playerBet[i].bankroll -= Number(betForm.value)
                }else playerBet[i].bankroll = 1000
            }

            //////////////////////////////////////////////////
            // CODE FOR ONE PLAYER ONLY VERSION
            // playerCards.innerHTML = `<img src="${data.cards[1].image}">`
            // playerCards.innerHTML += `<img src="${data.cards[2].image}">`
            // playerHand = new Hand(data.cards[1].value, data.cards[2].value)
            // playerHand.calculateValue()
            
            // console.log(playerBet)
            // playerBet = new Bet(Number(betAmount.value))
            // if (playerBet != undefined) {
            //     playerBet.wager = Number(betAmount.value)
            //     playerBet.bankroll -= Number(betAmount.value)
            // }

            // if (playerHand.handValue === 21) playerHand.natural = true

            // if (playerHand.card1 === playerHand.card2) console.log('option to split') // OPTION TO SPLIT

            // if (playerHand.handValue === 9 || playerHand.handValue === 10 || playerHand.handValue === 11) console.log('option to doubledown')// OPTION TO DOUBLEDOWN


            // document.querySelector('#hit').addEventListener('click', playerHand.hitCard.bind('playerHand'))
            // document.querySelector('#stand').addEventListener('click', stand) 
            ////////////////////////////////////////////////////
        })
        .catch(err => {
            console.log(`error ${err}`)
        });

        hitButton = document.createElement('button')
        hitButton.innerHTML = `<input id="hit" type="button" value="Hit Me!"></input>`
        // document.querySelector('#hit').addEventListener('click', playerHand[0].hitCard.bind('playerHand0'))
        // document.querySelector('#stand').addEventListener('click', stand) 

}
// Got to change this to pass turn to the next player and then have it automagically have dealer hit/stand after all players' turns
// Player stands, automagically have dealer hit/stand
function stand(){
    console.log(dealerHand.handValue)
    if (dealerHand.handValue < 17 || dealerHand.handValue == undefined){
        dealerHand.hitCard('dealerHand')        
    }
}
// CLEAR DOM/HANDS
function init(){
    playerHand = []
    document.querySelector('#players').innerHTML = ''
}