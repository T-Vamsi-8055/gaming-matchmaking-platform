import queueObj from "./queueObjClass.js";
import {penaltyRange} from "./GameLogic.js";


export default class queue{
    constructor(game,queueType){
        this.queueArray=[];
        this.gameName=game;
        this.queueType=queueType;
    }
    addUserToQueue(queueObj){
        let objPos=0;
        for(let i=0;i<this.queueArray.length;i++){
            if(this.queueArray[i].getGameScore()<queueObj.getGameScore())objPos++;
            else break;
        }
        this.queueArray.splice(objPos,0,queueObj);
    }
    deleteUserFromQueue(userId){
        
        for(let i=0;i<this.queueArray.length;i++){
            if(this.queueArray[i].getUserId()==userId){
                this.queueArray.splice(i,1);
                break;
            }
            
        }
        
    }
    deleteMatchUsersFromQueue(userId){
        
        for(let i=0;i<this.queueArray.length;i++){
            if(this.queueArray[i].getUserId()==userId){
                this.queueArray.splice(i,matchSize);
                break;
            }
            
        }
        
    }
    checkBestMatch(){
        for(let i=0;i<(this.queueArray.length-matchSize+1);i++){
            let maxTime=0;
            for(let k=i;k<i+matchSize;k++){
                const presentUserTime=Date.now()-this.queueArray[k].getJoinTime();
                if(presentUserTime>maxTime)maxTime=presentUserTime;
            }
            const penaltyRangeValue=penaltyRange(maxTime);
            let matchConditions=false;
            for(let k=i;k<i+matchSize-1;k++){
                if((this.queueArray[k].getGameScore()-this.queueArray[k+1].getGameScore())<penaltyRangeValue){
                    matchConditions=true;
                }else{ matchConditions=false;break;}
            }
            if(matchConditions){    
                let finalArray=[];
                for(let k=i;k<i+matchSize;k++){
                    finalArray.push(this.queueArray[k])
                }
                const finalDividedArray=teamDivider(finalArray);
                finalMatches.push(finalDividedArray)
                this.deleteMatchUsersFromQueue(this.queueArray[i].getUserId());
            }
            
        }
    }
    getGameName(){return this.gameName;}
    getQueueType(){return this.queueType;}
    getNumberOfPlayers(){return this.queueArray.length}
}