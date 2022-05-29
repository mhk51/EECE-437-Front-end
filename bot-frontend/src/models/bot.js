export class Bot{
    constructor(coin_name="bitcoin",buy_percentage=1,is_active=false,risk=0.5){
        this.coin_name = coin_name;
        this.buy_percentage = buy_percentage;
        this.is_active = is_active;
        this.risk = risk;
    }

}


export function jsonToBot(data){
    return new Bot(data.coin_name,data.buy_percentage*100,data.is_active,data.risk*100);
}