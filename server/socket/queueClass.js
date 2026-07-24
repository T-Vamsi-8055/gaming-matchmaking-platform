import queueObj from "./queueObjClass.js";
import {penaltyRange, teamDivider} from "./GameLogic.js";
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

        
        
    
    checkBestMatch(){
        for(let i=0;i<(this.partyQueueArray.length-matchSize+1);i++){
            let maxTime=0;
            for(let k=i;k<i+matchSize;k++){
                const presentUserTime=Date.now()-this.partyQueueArray[k].getJoinTime();
                if(presentUserTime>maxTime)maxTime=presentUserTime;
            }
            const penaltyRangeValue=penaltyRange(maxTime);
            let matchConditions=false;
            for(let k=i;k<i+matchSize-1;k++){
                if((this.partyQueueArray[k].getGameScore()-this.partyQueueArray[k+1].getGameScore())<penaltyRangeValue){
                    matchConditions=true;
                }else{ matchConditions=false;break;}
            }
            if(matchConditions){    
                let finalArray=[];
                for(let k=i;k<i+matchSize;k++){
                    finalArray.push(this.partyQueueArray[k])
                }
                const finalDividedArray=teamDivider(finalArray);
                finalMatches.push(finalDividedArray)
                this.deleteMatchUsersFromQueue(this.partyQueueArray[i].getUserId());
            }
            
        }
    }
    checkFeasibleMatches(){
        this.backTrack(this.partyQueueArray,[],0);
    }
    backTrack(array,curr,startIndex){
        let currSize=0;
        curr.forEach((party)=>{
            currSize+=party.getLength();
        })
        if(currSize>matchSize)return;
        if(currSize==matchSize){
            let maxTime=0;
            curr.forEach(party=>{
                const waitingTime = Date.now() - party.getJoinTime();

                if(waitingTime > maxTime){
                    maxTime = waitingTime;
                }
            })
            const penaltyRangeValue=penaltyRange(maxTime);
            let matchConditions=true;
            curr.forEach(party=>{
                if(matchConditions){
                curr.forEach(party2=>{
                    if(party2.getGameScore()-party.getGameScore()>penaltyRangeValue)matchConditions=true;
                    else{matchConditions=false;break;}
                })}
            })
            if(matchConditions){    
                
                finalMatches.push(curr)
                this.deleteMatchPartiesFromQueue(curr);
            }
        }
        for(let i=startIndex;i<array.length;i++){
            curr.push(array[i]);
            this.backTrack(array,i+1,curr);
            curr.pop();
        }
    }
    getGameName(){return this.gameName;}
    getQueueType(){return this.queueType;}
    getNumberOfParties(){return this.partyQueueArray.length}
}