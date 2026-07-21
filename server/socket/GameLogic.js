export function FindGameScore(player){
    const rankWeight = {
        "Iron": 100,
        "Bronze": 200,
        "Silver": 300,
        "Gold": 400,
        "Gold Nova": 450,
        "Platinum": 500,
        "Diamond": 650,
        "Ascendant": 800,
        "Master": 850,
        "Immortal": 950,
        "Radiant": 1000
    };

    const rankScore = rankWeight[player.rank] || 0;

    const winRate =
        player.games_played === 0
            ? 0
            : player.wins / player.games_played;

    return (
        rankScore +
        player.skill_rating +
        winRate * 300 +
        Math.min(player.games_played, 200) * 0.5
    );

}
export function teamDivider(finalArray){
    if(finalArray[0].getQueueType()==1){
        return [
            [finalArray[0]],[ finalArray[2]],
            [finalArray[1]],[finalArray[3]]
        ];
    }

    if(finalArray[0].getQueueType()==2){
        return [
            [finalArray[0], finalArray[2]],
            [finalArray[1], finalArray[3]]
        ];
    }

    return [];
}

export function startMatch(gameMatch,queueType,io){
    if(queueType==1){
        gameMatch.forEach((solo)=>{
            io.to(solo[0].getUserId()).emit("joined-match",gameMatch);
        })
    }
    if(queueType==2){
        gameMatch.forEach((duo)=>{
            io.to(duo[0].getUserId()).emit("joined-match",gameMatch);
            io.to(duo[1].getUserId()).emit("joined-match",gameMatch);
        })
    }
    if(queueType==4){
        gameMatch.forEach((squad)=>{
            io.to(squad[0].getUserId()).emit("joined-match",gameMatch);
            io.to(squad[1].getUserId()).emit("joined-match",gameMatch);
            io.to(squad[2].getUserId()).emit("joined-match",gameMatch);
            io.to(squad[3].getUserId()).emit("joined-match",gameMatch);
        })
    }
}

export function penaltyRange(time){
    if(time<10000)return 50;
    if(time<20000)return 100;
    if(time<30000)return 200;
    if(time<45000)return 300;
    return 1000000;
}

export const matchSize=4;
export let finalMatches=[];
