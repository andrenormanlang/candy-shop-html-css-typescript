import axios from 'axios';
import { IOrderRequest, IOrderResponse } from './interfaces'

// const urlProducts = 'https://www.bortakvall.se/api/v2/products';
// const urlOrders = 'https://www.bortakvall.se/api/v2/orders'
const urlProducts = 'https://candy-shop-rest-api.onrender.com/products';
const urlOrders = 'https://candy-shop-rest-api.onrender.com/orders'

export const fetchProducts = async () => {
  try {
    const response = await axios.get(urlProducts);
    console.log("Response fetch status", response.status);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`No response from server: ${error.response?.status} ${error.response?.statusText}`);
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

export const fetchProduct = async (id: string) => {
  try {
    const response = await axios.get(`${urlProducts}/${id}`);
    console.log("Response fetch status", response.status);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`No response from server: ${error.response?.status} ${error.response?.statusText}`);
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

export const createOrders = async (submitOrder: IOrderRequest) => {
  try {
    const response = await axios.post(urlOrders, submitOrder, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    if (response.status === 200) {
      console.log("Congrats, server responded");
      console.log('Response data:', response.data);
    }
    // else {
    //   console.log("That didn't go that well");
    // }
    console.log(response.status);
    return response.data as IOrderResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`Couldn't post to server: ${error.response?.status} ${error.response?.statusText}`);
      throw error;
    }
    throw new Error('An unexpected error occurred');
  }
}

export const updateProductQuantityInDB = async (productId :string, newQuantity : number) => {
  try {
    const response = await axios.patch(`https://candy-shop-rest-api.onrender.com/products/${productId}`, {
      stock_quantity: newQuantity
    });
    console.log('DB Update Response:', response.data);
  } catch (error) {
    console.error('Failed to update product quantity in DB:', error);
  }
};
