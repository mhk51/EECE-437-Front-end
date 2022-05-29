export class Wallet{
    constructor(id,usd,bitcoin,ethereum,bnb){
        this.id = id;
        this.usd = usd;
        this.bitcoin = bitcoin;
        this.ethereum = ethereum;
        this.bnb = bnb;
    }
}

export function jsonToWallet(walletData){
    return new Wallet(walletData.id,walletData.usd,walletData.bitcoin,walletData.ethereum,walletData.bnb)
}

export function walletToChart(wallet,exchangeRate){
    return [
        {title:'Bitcoin',value:wallet.bitcoin*exchangeRate.bitcoin,color:'#FFAF27'},
        {title:'Ethereum',value:wallet.ethereum*exchangeRate.ethereum,color:'#C13C37'},
        {title:'USD',value:wallet.usd,color:'#9199FF'},
    ]
}