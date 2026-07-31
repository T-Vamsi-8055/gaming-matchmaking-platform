export default class queueObj{
    constructor(){
        this.gameScore=0;
        this.userId="";
        this.joinTime=0;
        this.queueType=0;
    }
    setGameScore(value){
        this.gameScore=value;
    }
    setUserId(value){
        this.userId=value;
    }
    setJoinTime(value){
        this.joinTime=value;
    }
    setQueueType(value){
        this.queueType=value;
    }
    getQueueType(){
        return this.queueType;
    }
    getGameScore(){
        return this.gameScore;
    }
    getUserId(){
        return this.userId;    
    }
    getJoinTime(){
        return this.joinTime;    
    }
}