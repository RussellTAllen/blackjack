// Got dealing sorted out, need to handle turning aces into 1's.  Maybe an 'aces' variable on the object that counts the aces, and if aces > 0, then you can turn 11 into 1 and aces--


document.querySelector('#get-deck').addEventListener('click', fetchDeck)
document.querySelector('#deal').addEventListener('click', dealCards)
// document.querySelector('#hit').addEventListener('click', playerHand.hitCard)
// document.querySelector('#calculate').addEventListener('click',)


let deckID
let addCard
let hits = 2
const playerCards = document.querySelector('#player-cards')
const dealerCards = document.querySelector('#dealer-cards')
const betAmount = document.querySelector('#bet-amount')


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

// FETCH DECK
function fetchDeck(){
    const deckNum = document.querySelector('#deck-quantity').value
    
    console.log(deckNum)

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
// may need to pass number of cards to deal as argument and integrate the hitCard function into this function
function dealCards(){
    fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=3`)
        .then(res => res.json()) // parse response as JSON
        .then(data => {
            console.log(data)
            
            dealerCards.innerHTML = `<img src="${data.cards[2].image}">`
            dealerHand = new Hand(data.cards[2].value)      
            
            playerCards.innerHTML = `<img src="${data.cards[0].image}">`
            playerCards.innerHTML += `<img src="${data.cards[1].image}">`
            playerHand = new Hand(data.cards[0].value, data.cards[1].value)
            playerHand.calculateValue()
            
            // console.log(playerBet)
            playerBet = new Bet(Number(betAmount.value))
            if (playerBet != undefined) {
                playerBet.wager = Number(betAmount.value)
                playerBet.bankroll -= Number(betAmount.value)
            }

            if (playerHand.handValue === 21) playerHand.natural = true

            if (playerHand.card1 === playerHand.card2) console.log('option to split') // OPTION TO SPLIT

            if (playerHand.handValue === 9 || playerHand.handValue === 10 || playerHand.handValue === 11) console.log('option to doubledown')// OPTION TO DOUBLEDOWN

            if (dealerHand.card1 === "ACE") console.log('insurance option') // INSURANCE OPTION

            document.querySelector('#hit').addEventListener('click', playerHand.hitCard.bind('playerHand'))
            document.querySelector('#stand').addEventListener('click', stand) 
        })
        .catch(err => {
            console.log(`error ${err}`)
        });
}

// Player stands, automagically have dealer hit/stand
function stand(){
    console.log(dealerHand.handValue)
    if (dealerHand.handValue < 17 || dealerHand.handValue == undefined){
        dealerHand.hitCard('dealerHand')        
    }
}



// Maybe should put this in the hand class so that we can change it to "this" to allow hitting dealer object
// function hitCard(){
//     fetch(`https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=1`)
//         .then(res => res.json()) // parse response as JSON
//         .then(data => {
//             hits = hits+1
//             addCard = `card${hits}`
            
//             console.log(data)
//             playerCards.innerHTML += `<img src="${data.cards[0].image}">`
            
//             playerHand[addCard] = data.cards[0].value
//             console.log(playerHand)
//             console.log(playerHand.calculateValue())
//         })
//         .catch(err => {
//             console.log(`error ${err}`)
//         });
// }
