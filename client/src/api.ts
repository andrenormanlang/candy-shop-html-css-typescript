
import { IOrderRequest, IOrderResponse } from './interfaces'

const urlProducts = 'https://bortakvall.se/api/products';
const urlOrders = 'https://bortakvall.se/api/orders'

export const fetchProducts = async () => {
        const resp = await fetch(urlProducts)
        console.log("Response fetch status", resp.status);

        if(!resp.ok){
            throw new Error(`No response from server: ${resp.status} ${resp.statusText}`)
        }

        console.log("Response", resp);
        return await resp.json()
}


export const fetchProduct = async (id:string) => {
 
    const resp = await fetch(urlProducts+`/${id}`)
    console.log("Response fetch status", resp.status);

    if(!resp.ok){
        throw new Error(`No response from server: ${resp.status} ${resp.statusText}`)
    }

    console.log("Response", resp);
    return await resp.json()
}


export const createOrders = async(submitOrder: IOrderRequest) =>{
    const resp = await fetch(urlOrders,{
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitOrder),
    })

    if(!resp.ok) {
        throw new Error(`Could't post to server: ${resp.status} ${resp.statusText}`);
    }

    if(resp.status === 200) {
        console.log("Congrats, server responded");
    }else{
        console.log("That didnt go that well");
    }

    console.log(resp.status);

    return await resp.json() as IOrderResponse
}


// export const fetchOrder = async() =>{
//    const resp = fetch('/https://bortakvall.se/api/orders')
    
//     const text = await (await resp).text()
//     document.querySelector('#order-confirmation')!.innerHTML = text;
   
// }


// export const fetchOrder = async() =>{
//     const resp = await fetch(urlOrders)
//     return await resp.json() as IOrderResponse;
// }