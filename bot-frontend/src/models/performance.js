export class PerformanceNode{
    constructor(amount,date){
        this.amount = amount;
        this.date = date;
    }
}

export function jsonToPerformance(list){
    let perfList = []
    for(let i=0;i<list.length;i++){
        perfList.push(new PerformanceNode(list[i].amount,list[i].date))
    }
    return perfList;
}