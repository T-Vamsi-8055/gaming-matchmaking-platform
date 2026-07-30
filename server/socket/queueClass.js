import queueObj from "./queueObjClass.js";
import {penaltyRange} from "./GameLogic.js";
import { matchSize,finalMatches } from "./GameLogic.js";


export default class queue{
    constructor(game,queueType){
        this.partyQueueArray=[];
        this.gameName=game;
        this.queueType=queueType;
    }
    addPartyToQueue(partyObj){
        this.partyQueueArray.push(partyObj);
    }
    deletePartyFromQueue(partyId){
        
        for(let i=0;i<this.partyQueueArray.length;i++){
            if(this.partyQueueArray[i].getPartyId()==partyId){
                this.partyQueueArray.splice(i,1);
                break;
            }
            
        }
        
    }
    deleteMatchPartiesFromQueue(parties){
            const partyIdArray=parties.map(parties=>{return parties.getPartyId()})
            this.partyQueueArray = this.partyQueueArray.filter(
                party => !partyIdArray.includes(party.getPartyId())
            );
            
    }
    checkFeasibleMatches() {
    return this.backTrack(this.partyQueueArray, [], 0);
    }

    backTrack(array, curr, startIndex) {
        let currSize = 0;

        curr.forEach((party) => {
            currSize += party.getLength();
        });

        if (currSize > matchSize) {
            return null;
        }

        if (currSize === matchSize) {
            let maxTime = 0;

            curr.forEach((party) => {
                const waitingTime = Date.now() - party.getJoinTime();

                if (waitingTime > maxTime) {
                    maxTime = waitingTime;
                }
            });

            const penaltyRangeValue = penaltyRange(maxTime);

            for (let i = 0; i < curr.length; i++) {
                for (let j = i + 1; j < curr.length; j++) {
                    if (
                        Math.abs(
                            curr[i].getGameScore() -
                            curr[j].getGameScore()
                        ) > penaltyRangeValue
                    ) {
                        return null;
                    }
                }
            }

            return [...curr];
        }

        for (let i = startIndex; i < array.length; i++) {
            curr.push(array[i]);

            const result = this.backTrack(array, curr, i + 1);

            if (result) {
                return result;
            }

            curr.pop();
        }

        return null;
    }
    checkLatePeople(){
        this.partyQueueArray.forEach((party)=>{
            const waitingTime = Date.now() - party.getJoinTime();

                if (waitingTime > maxTime) {
                    maxTime = waitingTime;
                }
        })
    }
    getGameName(){return this.gameName;}
    getQueueType(){return this.queueType;}
    getNumberOfParties(){return this.partyQueueArray.length}
}