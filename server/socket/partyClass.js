
export default class partyClass{
    constructor(partyId,queueType,queueObjArray,joinTime,gameScore){
        this.partyId=partyId;
        this.queueType=queueType;
        this.queueObjArray=queueObjArray;
        this.joinTime=joinTime;
        this.gameScore=gameScore;
    }
    getPartyId(){
        return this.partyId
    }
    getQueueType(){
        return this.queueType
    }
    getQueueObjArray(){
        return this.queueObjArray
    }
    getLength(){
        return this.queueObjArray.length
    }
    getJoinTime(){
        return this.joinTime;
    }
    getGameScore(){
        return this.gameScore;
    }
}