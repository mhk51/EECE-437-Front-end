export class ExchangeRate{
    constructor(bitcoin,ethereum){
        this.bitcoin = bitcoin;
        this.ethereum = ethereum;
    }
}

export function jsonToExchangeRate(data){
    return new ExchangeRate(data.bitcoin,data.ethereum)
}