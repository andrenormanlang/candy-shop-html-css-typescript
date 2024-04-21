import { fetchProduct, fetchProducts, createOrders } from "./api";
import {
  IProduct,
  IProductsResponse,
  IOrderRequest,
  IOrderItemRequest,
  IOrderResponse,
  IOrder,
} from "./interfaces";
import "bootstrap/dist/css/bootstrap.css";
import * as bootstrap from "bootstrap";
import "./style.css";

let products: IProduct[] = JSON.parse(localStorage.getItem("products") ?? "[]");

let productsResponse: IProductsResponse;
let orderResponse: IOrderResponse;

const getProducts = async () => {
  try {
    productsResponse = await fetchProducts();
    products = productsResponse.data;
    console.log("Products", products);
  } catch (err) {
    console.error("Problem with the server", err);
  }

  renderProducts(products);
  stockPhrase();
  description();
  addEventToCartButton();
  renderCart();
  renderCartinCheckout();

  return productsResponse;
};

const inStockItems = () => {
  return products.filter((item) => renderProductQuantity(item) > 0);
};

const outofStockItems = () => {
  return products.filter((item) => renderProductQuantity(item) === 0);
};

const stockPhrase = () => {
  document.querySelector("#storage-instockvsoutofstock")!.innerHTML = `
<h5>Vi har ${inStockItems().length} sorters godis i lager. ${
    outofStockItems().length
  } Sorter är slutsålda</h5>`;
};

const renderProductStatus = (product: IProduct) => {
  return product.stock_status === "instock" &&
    product.stock_quantity &&
    renderProductQuantity(product)
    ? `<span style="color: green; font-weight:bold; ">I Lager</span>`
    : `<p style="color: red; font-weight:bold;">Slut i lager</p>`;
};

const updateProductStatus = (product: IProduct) => {
  document.querySelector(`#product-status${product.id}`)!.innerHTML =
    renderProductStatus(product);
};

const updateProductQuantity = (product: IProduct) => {
  document.querySelector(`#product-quantity${product.id}`)!.innerHTML = String(
    renderProductQuantity(product)
  );
};

const updateProductAddToCart = (product: IProduct) => {
  document.querySelector<HTMLButtonElement>(
    `#product-add${product.id}`
  )!.disabled = renderProductQuantity(product) === 0;
};

const updateProductDescriptionAddToCart = (product: IProduct) => {
  document.querySelector<HTMLButtonElement>(
    `#product-description-add`
  )!.disabled = renderProductQuantity(product) === 0;
};

const renderProductQuantity = (product: IProduct) => {
  console.log(product);
  return (
    (product.stock_quantity || 0) -
    Number(localStorage.getItem(String(product.id)))
  );
};

const renderProducts = (products: IProduct[]) => {
  const cardItems = (document.querySelector("#card-container")!.innerHTML =
    products
      .sort((a, b) =>
        a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
      )
      .map(
        (product: IProduct) =>
          `<div class="card shadow-lg" style="width: 18rem;">
        <img class="card-img-top img-fluid cardImg" src="https://bortakvall.se${
          product.images.thumbnail
        }"alt="picture of ${product.name}" <div class="card-body">
        <h5 class="card-title">${product.name}</h5>
        <p id="product-status${product.id}">${renderProductStatus(product)}</p>
        <p id="product-quantity${product.id}">${renderProductQuantity(
            product
          )}</p>
        <p class="card-text fw-bold fst-italic">${product.price}kr</p>
        <a href="#"></a>
          <div class="d-flex flex-column card-body card-buttons">
            <button type="button" class="btn product-description-btn card-btn btn-info mb-2" data-product-id=${
              product.id
            }>Läs mer</button>
            <button type="button" id="product-add${
              product.id
            }" class="cart-btn btn btn-success card-btn"data-cart-id=${
            product.id
          }>Lägg till</button>
          </div>
    </div>`
      )
      .join(""));
  products.forEach(updateProductAddToCart);
  return cardItems;
};

const addEventToCartButton = () => {
  document.querySelectorAll(".cart-btn").forEach((element) => {
    element.addEventListener("click", async (e: Event) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      const productId = target.dataset.cartId!;
      console.log(productId);
      addToCart(productId);
    });
  });
};

const addToCart = (productId: string) => {
  let product: IProduct = products.find((e) => e.id == Number(productId))!;
  let productQuantity = Number(localStorage.getItem(productId) || 0);
  if (renderProductQuantity(product) > 0) {
    productQuantity++;
  }

  localStorage.setItem(productId, String(productQuantity));

  renderCart();

  renderCartinCheckout();
  updateProductQuantity(product);
  updateProductStatus(product);
  updateProductAddToCart(product);
  renderProductDescription(product);
  stockPhrase();
};

const removeFromCart = (productId: string) => {
  let product: IProduct = products.find((e) => e.id == Number(productId))!;
  let productQuantity = Number(localStorage.getItem(productId) || 0);
  if (productQuantity <= 1) {
    deleteFromCart(productId);
  } else {
    productQuantity--;
    localStorage.setItem(productId, String(productQuantity));
    renderCart();
    renderCartinCheckout();
    updateProductQuantity(product);
    updateProductStatus(product);
    updateProductAddToCart(product);
    renderProductDescription(product);
    stockPhrase();
  }
};

const deleteFromCart = (productId: string) => {
  let product: IProduct = products.find((e) => e.id == Number(productId))!;

  localStorage.removeItem(productId);

  renderCart();
  renderCartinCheckout();
  updateProductQuantity(product);
  updateProductStatus(product);
  updateProductAddToCart(product);
  renderProductDescription(product);
  stockPhrase();
};

const renderProductDescription = (product: IProduct) => {
  document.querySelector("#card-product-description")!.innerHTML = `
  <div class="container mt-5 mb-4">
    <div class="container mt-5">
      <div class="row">
        <div class="col-sm-5 p-0 mb-4">
          <img src="https://bortakvall.se${
            product.images.large
          }" class="img-fluid" alt="...">
        </div>
          <div class="col-sm-6 pb-3" style="background-color:yellow;">
            <h4 class="mt-5 fw-bold ">${product.name}</h4>
            <h6 class="card-subtitle mb-2 text-muted"></h6>
            <p class="mb-4 d-flex justify-content-center">Art. nr: ${
              product.id
            }</p>
            <h5 class="mt-2 card-text fw-bold fst-italic">${
              product.price
            }kr</h5>
            <p class="card-text mt-3">${product.description}</p>
            <p id="product-status${product.id}">${renderProductStatus(
    product
  )}</p>
            <p id="product-quantity${product.id}">${renderProductQuantity(
    product
  )}</p>
            <div class="container"></div>
            <button type="button" id="product-description-add" class="cart-btn btn btn-success" data-product-id=${
              product.id
            }>Add to cart</button>
            <button id="main-homepage" type="button" class="btn btn-primary">Back to main</button>
          </div>
        </div>
      </div>
  </div>`;

  attachHomePageEvent();
  updateProductDescriptionAddToCart(product);
  document
    .querySelector("#product-description")
    ?.querySelector(`#product-description-add`)
    ?.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      addToCart(target.dataset.productId!);
      console.log(target.dataset.productId);
    });
};

function displayProductDetailsInModal(product: any) {
  const modalBody = document.querySelector(".modal-body") as HTMLElement;

  modalBody!.innerHTML = `

  <div class="modal-content">
    </div>
    <div class="modal-body">
      <div class="d-flex">
        <div class="flex-shrink-0">
          <img src="https://bortakvall.se${product.images.thumbnail}" alt="${product.name}" class="img-fluid" style="max-width: 200px; height: auto;">
        </div>
        <div class="flex-grow-1 ms-3">
          <h4>${product.name}</h4>
          <p>${product.description}</p>
          <p class="font-weight-bold">Price: ${product.price} kr</p>
        </div>
      </div>
    </div>

  </div>
</div>`;
  const addToCartBtn = document.querySelector(
    "#addToCartBtn"
  ) as HTMLButtonElement;

  addToCartBtn!.onclick = () => addToCart(product.id);
  const productModalElement = document.getElementById(
    "productModal"
  ) as HTMLElement;

  new bootstrap.Modal(productModalElement).show();
}

const description = () => {
  document.querySelectorAll(".product-description-btn").forEach((element) => {
    // element.addEventListener("click", async (e) => {
    //   const target = e.target as HTMLElement;
    //   console.log(target);

    //   let productResponse: IProductResponse = await fetchProduct(
    //     target.dataset.productId!
    //   );

    //   let product = productResponse.data;

    //   //transition
    //   document.querySelector("#main-page")?.classList.add("hide");
    //   document.querySelector("#product-description")?.classList.remove("hide");
    //   document.querySelector(".checkout-form")?.classList.add("hide");

    //   renderProductDescription(product);
    // });
    element.addEventListener("click", async (e) => {
      e.preventDefault();
      const target = e.target as HTMLElement;
      const productId = target.dataset.productId!;
      const productResponse = await fetchProduct(productId);
      const product = productResponse.data;
      displayProductDetailsInModal(product);
    });
  });
};

const attachHomePageEvent = () => {
  document
    .querySelector("#main-homepage")
    ?.addEventListener("click", async (e) => {
      const target = e.target as HTMLElement;
      console.log(target);

      //transition
      document.querySelector("#product-description")?.classList.add("hide");
      //document.querySelector(".description")?.classList.add("hide");
      document.querySelector("#main-page")?.classList.remove("hide");
      document.querySelector(".description")?.classList.add("hide");
      document.querySelector(".checkout-form")?.classList.add("hide");
    });
};

// DROP DOWN MENU
const toggler = document.querySelector("#menu-toggle") as HTMLButtonElement;
const theDropDown = document.querySelector("#dropdown-menu") as HTMLDivElement;

let isOpen: boolean = false;

toggler!.addEventListener("click", () => {
  isOpen = !isOpen;
  if (isOpen) {
    theDropDown!.style.display = "block";
  } else {
    theDropDown!.style.display = "none";
  }
});

const productInCart = (product: IProduct) => {
  return localStorage.getItem(String(product.id));
};

const productsAddedInCart = () => {
  return products.filter(productInCart);
};

const totalPrice = (products: IProduct[]) => {
  const calcPriceCart = products
    .map(
      (product) =>
        product.price * Number(localStorage.getItem(String(product.id)))
    )
    .reduce((acc, num) => acc + num, 0);

  return calcPriceCart;
};

const renderCart = async () => {
  let productsInCart = productsAddedInCart();

  let totalCart = totalPrice(productsInCart);

  document.querySelector("#count-item")!.innerHTML = String(
    productsInCart.length
  );

  const cartItems = (document.querySelector(".cart-render")!.innerHTML =
    productsInCart
      .map(
        (product: IProduct) =>
          `<div class="cart-items">
      <div id="cartBox" class="d-flex">
        <div id="imgBox" class="d-flex m-2 gap-2">
          <button type="button" class="remove-item remove-img" data-product-id=${
            product.id
          }>
            <i class="fa fa-trash" data-product-id=${product.id}></i>
            <i class="fa fa-trash-can" data-product-id=${product.id}></i>
          </button>
          <i class="fa fa-trash-can" data-product-id=${product.id}></i>
          </button>
          <img class="menu-img img-fluid" src="https://bortakvall.se${
            product.images.thumbnail
          }"
            alt="picture of ${product.name}" />
        </div>
      <h5 class="card-title m-2">${product.name}</h5>
      </div>
      <div class="menu-items d-flex justify-content-end gap-3">
        <p>${product.price} kr</p>
        <p>${
          Number(localStorage.getItem(String(product.id))) * product.price
        } kr</p>
      </div>
      <div class="test d-flex justify-content-end">
        <div class="counter-icon m-2">
          <button class="reduce-btn" data-product-id=${product.id}>-</button>
          <span class="sum-products">${localStorage.getItem(
            String(product.id)
          )} </span>
          <button class="increase-btn" data-product-id=${product.id}>+</button>
        </div>
    </div>
  </div>`
      )
      .join(""));

  document.querySelector("#total-cart")!.innerHTML = `
    <h5>Total ${totalCart} kr</h5>
    <button class="btn btn-warning" id="checkout-btn">Till Kassan</button>`;

  const checkoutBtn = document.querySelector("#checkout-btn");
  checkoutBtn?.addEventListener("click", () => {
    // TRANSITION
    document.querySelector("#main-page")?.classList.add("hide");
    document.querySelector("#product-description")?.classList.add("hide");
    document.querySelector(".checkout-form")?.classList.remove("hide");

    theDropDown!.classList.toggle("hidden");

    document.querySelector(".description")?.classList.add("hide");
  });

  document.querySelectorAll(".remove-item").forEach((element) => {
    element.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;

      deleteFromCart(target.dataset.productId!);
    });
  });

  document?.querySelectorAll(".reduce-btn").forEach((element) => {
    element?.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      removeFromCart(target.dataset.productId!);
    });
  });
  document?.querySelectorAll(".increase-btn").forEach((element) => {
    element?.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      console.log(target);
      addToCart(target.dataset.productId!);
    });
  });

  document.querySelector("#checkout-btn")!.addEventListener("click", () => {
    // TRANSITION
    document.querySelector("#main-page")?.classList.add("hide");
    document.querySelector(".checkout-form")?.classList.remove("hide");

    theDropDown!.classList.toggle("hide");
  });

  document.querySelector("#checkout-btn")!.addEventListener("click", () => {
    // TRANSITION
    document.querySelector("#main-page")?.classList.add("hide");
    document.querySelector(".checkout-form")?.classList.remove("hide");

    theDropDown!.classList.toggle("hide");
  });

  return cartItems;
};

getProducts();

const renderCartinCheckout = async () => {
  let productsInCart = productsAddedInCart();

  let totalCart = totalPrice(productsInCart);

  document.querySelector("#count-item")!.innerHTML = String(
    productsInCart.length
  );

  const checkoutCart = (document.querySelector("#checkoutSummary")!.innerHTML =
    productsInCart
      .map(
        (product: IProduct) =>
          `<div class="d-flex flex-wrap card border-0 rounded-3 mb-4 w-100 p-3 h-100 d-inline-block" style="">
          <div class="card-body p-4">
            <div class="row d-flex justify-content-between align-items-center">
              <div class="col-md-2 col-lg-2 col-xl-2">
                <img class="card-img-top mx-auto d-block menu-img img-fluid" src="https://bortakvall.se${
                  product.images.thumbnail
                }" alt="picture of ${product.name}"/>
              </div>
              <div class="col-md-3 col-lg-3 col-xl-3">
                <p class="lead fw-normal mb-2">${product.name}</p>
                <p><span class="text-muted"></span>${
                  product.price
                }kr<span class="text-muted"></span></p>
              </div>
              <div class="col-md-3 col-lg-3 col-xl-2 d-flex">

              <span class="sum-products">Antal ${localStorage.getItem(
                String(product.id)
              )} </span>
              </div>
              <div class="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
                <h5 class="mb-0"><p>Summa ${
                  Number(localStorage.getItem(String(product.id))) *
                  product.price
                } kr</p></h5>
              </div>
            </div>
          </div>
        </div>`
      )
      .join(""));

  document.querySelector("#total-cart-checkout")!.innerHTML = `
      <h5>Total ${totalCart} kr</h5>
      `;

  return checkoutCart;
};

const orderFormRequest = async () => {
  const firstNameInput =
    document.querySelector<HTMLInputElement>("#inputFirstName")!.value;
  const lastNameInput =
    document.querySelector<HTMLInputElement>("#inputLastName")!.value;
  const adressInput =
    document.querySelector<HTMLInputElement>("#inputAddress")!.value;
  let zipInput = document.querySelector<HTMLInputElement>("#inputZip")!.value;
  const cityInput =
    document.querySelector<HTMLInputElement>("#inputCity")!.value;
  const emailInput =
    document.querySelector<HTMLInputElement>("#inputEmail")!.value;
  let phoneInput =
    document.querySelector<HTMLInputElement>("#inputPhone")!.value;

  let productsInCart = productsAddedInCart();

  let totalSumPrice = totalPrice(productsInCart);

  console.log(totalSumPrice);

  let newOrderRequest: IOrderRequest = {
    customer_first_name: firstNameInput,
    customer_last_name: lastNameInput,
    customer_address: adressInput,
    customer_postcode: zipInput,
    customer_city: cityInput,
    customer_email: emailInput,
    customer_phone: phoneInput,
    order_total: totalSumPrice,
    order_items: orderItemsRequest(),
  };

  return await createOrders(newOrderRequest);
};

const orderItemsRequest = () => {
  return productsAddedInCart().map(
    (product) =>
      <IOrderItemRequest>{
        product_id: product.id,
        qty: Number(localStorage.getItem(String(product.id))),
        item_price: product.price,
        item_total:
          product.price * Number(localStorage.getItem(String(product.id))),
      }
  );
};

const orderSubmitForm = () => {
  document
    .querySelector<HTMLFormElement>("#form-customer")
    ?.addEventListener("submit", async (e) => {
      e.preventDefault();
      orderResponse = await orderFormRequest();

      if (orderResponse.status === "success") {
        localStorage.clear();
        orderConfirmation();
        renderCart();
      } else if (orderResponse.status === "fail") {
        Object.keys(orderResponse.data).forEach((key) => {
          document.querySelector<HTMLSpanElement>(`#${key}`)!.innerText =
            String(orderResponse.data[key as keyof IOrder]);
        });
      }
    });
};

orderSubmitForm();

const orderConfirmation = async () => {
  document.querySelector(".checkout-form")?.classList.add("hide");

  document.querySelector("#order-confirmation")!.innerHTML = `
  <div class="card mt-5">
      <div class="card-body mx-4">
        <div class="container">
          <h5 class="my-5 mx-5" style="font-size: 30px;">Tack för din order</h5>
            <div class="row">
              <ul class="list-unstyled">
                <li class="text-black font-weight-bold">${orderResponse.data.customer_first_name} ${orderResponse.data.customer_last_name}</li>
                <li class="text-muted mt-1"><span class="text-black">Ordernummer:</span> ${orderResponse.data.id}</li>
                <li class="text-black mt-1">${orderResponse.data.order_date}</li>
              </ul>
              <hr style="border: 2px solid black;">
            </div>
          <div class="row text-black">
          <div class="col-xl-12">
          <h6 class="float-none fw-bold">Total Summa:${orderResponse.data.order_total}
          </h6>
      </div>
      <hr style="border: 2px solid black;">
  </div>`;
};
