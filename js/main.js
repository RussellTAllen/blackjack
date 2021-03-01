
document.querySelector('#get-deck').addEventListener('click', fetchDeck)
document.querySelector('#deal').addEventListener('click', dealCards)
// document.querySelector('#hit').addEventListener('click', playerHand.hitCard)
// document.querySelector('#calculate').addEventListener('click',)


let deckID
let addCard
let hits = 2
const playerCards = document.querySelector('#player-cards')
const dealerCards = document.querySelector('#dealer-cards')


class Hand{
    constructor(card1, card2){
        this.card1 = card1
        this.card2 = card2
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
                }
                
                
                // console.log(data.cards[0].value)

                // if (data.cards[0].value === "JACK" ||
                //     data.cards[0].value === "QUEEN" ||
                //     data.cards[0].value === "KING") { this.handValue += 10
                //     }else if (data.cards[0].value === "ACE"){ this.handValue += 11
                //     }else if (data.cards[0].value !== undefined) this.handValue += Number(data.cards[0].value)
                    
                
            
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
                }else if (value === "ACE"){ this.handValue += 11
                }else if (value !== undefined) this.handValue += Number(value)
            }
        }  
        
        // This works, trying to streamline it above
        // Need to calculate the hit cards now ... if key.includes 'card' value+=cardvalue  
        // calculateValue(){
        // if (this.card1 === "JACK" ||
        //     this.card1 === "QUEEN" ||
        //     this.card1 === "KING") {this.value = 10
        // }else if (this.card1 === "ACE"){ this.value = 11
        // }else this.value = Number(this.card1)

        // console.log(this.value)
        
        // if (this.card2 === "JACK" ||
        //     this.card2 === "QUEEN" ||
        //     this.card2 === "KING") { this.value += 10
        // }else if (this.card2 === "ACE") { this.value += 11
        // }else this.value += Number(this.card2)

        // if (this.value > 21 && (this.card1 === "ACE" || this.card2 === "ACE")) this.value -= 10
        
        return this.handValue
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
    if (dealerHand.handValue < 17){
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
