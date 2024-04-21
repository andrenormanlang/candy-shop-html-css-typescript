
import { IOrderRequest, IOrderResponse } from './interfaces'

// const urlProducts = 'https://www.bortakvall.se/api/v2/products';
// const urlOrders = 'https://www.bortakvall.se/api/v2/orders'
const urlProducts = 'https://candy-shop-rest-api.onrender.com/products';
const urlOrders = 'https://candy-shop-rest-api.onrender.com/orders'

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
  console.log("Response fetch statusText", resp.statusText);

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
