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
import "./style.scss";

let products: IProduct[] = JSON.parse(localStorage.getItem("products") ?? "[]");

let productsResponse: IProductsResponse;
let orderResponse: IOrderResponse;

const showSpinner = () => {
  const spinner = document.getElementById("spinner")!;
  spinner.classList.remove("d-none");
};

const hideSpinner = () => {
  const spinner = document.getElementById("spinner")!;
  spinner.classList.add("d-none");
};

const getProducts = async () => {
  showSpinner();
  try {
    productsResponse = await fetchProducts();
    products = productsResponse.data;
    renderProducts(products);
    stockPhrase();
    description();
    addEventToCartButton();
    renderCartinCheckout();
    renderCart();

    hideSpinner();
    console.log("Products", products);
  } catch (err) {
    console.error("Problem with the server", err);
  }

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
<h5>We have ${inStockItems().length} various types of candy in stock and ${
    outofStockItems().length
  }  are sold out</h5>`;
};

const renderProductStatus = (product: IProduct) => {
  const availableQuantity = renderProductQuantity(product);
  if (product.stock_status === "instock" && availableQuantity > 0) {
    return `<span id="product-quantity${
      product.id
    }" style="color: green; font-weight:bold;">${renderProductQuantity(
      product
    )}</span> <span style="color: green; font-weight:bold;">in stock </span>`;
  } else {
    return `<span style="color: red; font-weight:bold;">SOLD OUT</span>`;
  }
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
          `
        <div class="card shadow-lg" data-product-id=${
          product.id
        } style="width: 18rem;">
          <h1 class="text-uppercase product-card-title mt-2">${
            product.name
          }</h1>
          <img class="card-img-top img-fluid cardImg p-3 products-images" src="https://bortakvall.se${
            product.images.thumbnail
          }" alt="picture of ${product.name}" <div class="card-body">
          <p id="product-status${product.id}">${renderProductStatus(
            product
          )} </p>
          <p class="card-text fw-bold fst-italic">${product.price}kr</p>
          <a href="#"></a>
          <div class="d-flex flex-column card-body card-buttons">
            <button type="button" id="product-add${
              product.id
            }" class="cart-btn btn btn-success card-btn" data-cart-id=${
            product.id
          }>Add to cart</button>
          </div>
        </div>`
      )
      .join(""));
  products.forEach(updateProductAddToCart);
  document.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", (event) => {
      if ((event.target as HTMLElement).closest("button")) {
        return;
      }
      const productId = card.getAttribute("data-product-id");
      const product = products.find((p) => p.id.toString() === productId);
      if (product) {
        displayProductDetailsInModal(product);
      }
    });
  });

  return cardItems;
};

getProducts().then(() => {
  renderProducts(products);
  // ...any other code needed after products are fetched and rendered
  console.log("Calling addEventToCartButton...");
  addEventToCartButton();
});

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
  showSpinner();
  let product = products.find((e) => e.id === Number(productId));
  if (!product) {
    console.error("Product not found");
    hideSpinner(); // Hide spinner if the product is not found
    return;
  }

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

  hideSpinner(); // Hide the spinner here after all updates
};

const removeFromCart = (productId: string) => {
  showSpinner(); // Start spinner at the beginning of the operation
  let product = products.find((e) => e.id === Number(productId));
  if (!product) {
    console.error("Product not found");
    hideSpinner(); // Hide spinner if the product is not found
    return;
  }

  let productQuantity = Number(localStorage.getItem(productId) || 0);
  if (productQuantity <= 1) {
    deleteFromCart(productId);
    hideSpinner(); // Hide spinner after deletion
  } else {
    productQuantity--;
    localStorage.setItem(productId, String(productQuantity));

    renderCartinCheckout();
    renderCart();
    updateProductQuantity(product);
    updateProductStatus(product);
    updateProductAddToCart(product);
    renderProductDescription(product);
    stockPhrase();

    hideSpinner();
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
          <h5 class="mt-2 card-text fw-bold fst-italic">${product.price}kr</h5>
          <p class="card-description-text mt-3">${product.description}</p>
          <p id="product-status${product.id}">${renderProductStatus(
    product
  )}</p>
          <p id="product-quantity${product.id}">${renderProductQuantity(
    product
  )}</p>
          <button type="button" id="product-description-add" class="cart-btn btn btn-success" data-product-id=${
            product.id
          }>
            Add to cart
          </button>
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

      <div class="modal-header">
        <h5 class="modal-title">${product.name}</h5>

      </div>
      <div class="modal-body">
        <div class="container-fluid">
          <div class="row">
          <div class="col-12 col-md-6 mb-3 mb-md-0 image-description"> <!-- Wrap the image with this div -->
          <img src="https://bortakvall.se${product.images.thumbnail}" alt="${product.name}" class="img-fluid">
        </div>
            <div class="card-product-description col-10 col-md-6">
              <p>${product.description}</p>
              <p class="fw-bold">Price: ${product.price} kr</p>

          </div>
        </div>
      </div>
    `;
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

toggler.addEventListener("click", () => {
  isOpen = !isOpen; // Toggle the state of the dropdown
  if (isOpen) {
    theDropDown.style.display = "block"; // First make the dropdown block to render it
    requestAnimationFrame(() => {
      // Then, on the next animation frame, add the 'show' class
      theDropDown.classList.add("show");
    });
  } else {
    theDropDown.classList.remove("show"); // Remove the 'show' class to start the hiding transition
    setTimeout(() => {
      theDropDown.style.display = "none"; // After the transition ends, set display to none
    }, 500); // This duration should match the CSS transition-duration property
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

  // Update the item count display
  document.querySelector("#count-item")!.innerHTML = String(
    productsInCart.length
  );


  // Check if the cart is empty and display a message
  let cartItemsContainer = document.querySelector(".cart-render");

  if (cartItemsContainer) {
    if (productsInCart.length === 0) {
        cartItemsContainer.innerHTML = `<div class='empty-cart-message'>Get some sweets!</div>`;
        document.querySelector(".total-cart")!.innerHTML = ""; // Clear total cart if empty
        let checkoutBtn = document.querySelector("#checkout-btn");
        if (checkoutBtn) {
            (checkoutBtn as HTMLElement).style.display = "none";
        }

    } else  {
(document.querySelector(".cart-render")!.innerHTML =
    productsInCart
      .map(
        (product: IProduct) =>
          `<div class="cart-items">
            <div class="row g-3 align-items-center">
              <div class="col-2">
                <button type="button" class="remove-item btn btn-outline-secondary btn-sm" data-product-id="${
                  product.id
                }">
                  <i class="fa fa-trash" aria-hidden="true"></i>
                </button>
              </div>
              <div class="col-4">
                <img class="menu-img img-fluid" src="https://bortakvall.se${
                  product.images.thumbnail
                }" alt="picture of ${product.name}" />
              </div>
              <div class="col-6">
                <div class="row">
                  <div class="col-12">
                    <h5 class="card-title">${product.name}</h5>
                  </div>
                  <div class="col-12">
                    <div class="d-flex justify-content-between align-items-center">
                      <div class="price">${
                        Number(localStorage.getItem(String(product.id))) *
                        product.price
                      } kr</div>
                      <div class="quantity-controls">
                        <button class="reduce-btn btn btn-outline-secondary" data-product-id=${
                          product.id
                        }>-</button>
                        <span class="sum-products">${localStorage.getItem(
                          String(product.id)
                        )}</span>
                        <button class="increase-btn btn btn-outline-secondary" data-product-id=${
                          product.id
                        }>+</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <hr class="my-4">
            </div>
            `
          )
          .join(""));

  document.querySelector(".total-cart")!.innerHTML = `
    <div class="total-text">Total</div>
    <div class="total-price">${totalCart} kr</div>
    <button class="btn-checkout" id="checkout-btn">To checkout</button>`;

    const checkoutBtn = document.querySelector(".checkout-btn");
    checkoutBtn?.addEventListener("click", () => {
      console.log("Checkout button clicked"); // Add this line for debugging
    // TRANSITION
    document.querySelector("#main-page")?.classList.remove("hide");
    theDropDown!.classList.toggle("hidden");
    document.querySelector(".description")?.classList.add("hide");

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

  }


  // document.querySelector("#checkout-btn")!.addEventListener("click", () => {
  //   // TRANSITION
  //   document.querySelector("#main-page")?.classList.add("hide");
  //   document.querySelector(".checkout-form")?.classList.remove("hide");

  //   theDropDown!.classList.toggle("hide");
  // });

  // document.querySelector("#checkout-btn")!.addEventListener("click", () => {
  //   // TRANSITION
  //   document.querySelector("#main-page")?.classList.add("hide");
  //   document.querySelector(".checkout-form")?.classList.remove("hide");

  //   theDropDown!.classList.toggle("hide");
  // });

  document.querySelector("#checkout-btn")?.addEventListener("click", () => {
    // Hide Main Page and Dropdown Menu
    theDropDown?.classList.remove("show");
    theDropDown.style.display = "none";

    // Populate and Show the Checkout Summary Modal
    const modalBody = document.querySelector("#checkoutSummaryModalBody");
    if (modalBody) {
      modalBody.innerHTML =
        document.querySelector("#checkoutSummary")?.innerHTML || "";
      const checkoutModalElement = document.getElementById("checkoutModal");
      if (checkoutModalElement) {
        const checkoutModal = new bootstrap.Modal(checkoutModalElement);
        checkoutModal.show();
      }
    }
  });

  // Handle transition to the payment form within the modal
  document
  .querySelector("#proceedToPaymentButton")
  ?.addEventListener("click", () => {
      const modalBody = document.querySelector("#checkoutModal .modal-body");
      if (modalBody) {
        modalBody.innerHTML =
          document.querySelector(".checkout-form")?.innerHTML || ""; // Load form into modal

          // Optionally adjust modal title
          const modalTitle = document.querySelector(
            "#checkoutModal .modal-title"
          );
        if (modalTitle) {
          modalTitle.textContent = "Complete Your Payment";
        }

        // Reattach event listeners or validate form within the modal, if necessary
      }
    });
  }


};

getProducts().then(() => {
  renderProducts(products);
  // Add the new event listener code here
  const proceedToFormButton = document.querySelector("#proceedToFormButton");
  if (proceedToFormButton) {
    proceedToFormButton.addEventListener("click", () => {
      const modalBody = document.querySelector("#checkoutModal .modal-body");
      if (modalBody) {
        const formCustomer = document.querySelector("#form-customer");
        if (formCustomer) {
          const clonedNode = formCustomer.cloneNode(true);
          if (clonedNode instanceof Element) {
            modalBody.innerHTML = clonedNode.outerHTML;
          }
          // Optionally adjust modal title
          const modalTitle = document.querySelector(
            "#checkoutModal .modal-title"
          );
          if (modalTitle) {
            modalTitle.textContent = "Complete Your Form";
          }

          // Reattach event listeners for the cloned form
          const formCustomerInModal = modalBody.querySelector("#form-customer");
          if (formCustomerInModal) {
            formCustomerInModal.addEventListener("submit", async (e) => {
              e.preventDefault();
              // Handle form submission here or validate inputs
              orderSubmitForm();
              orderConfirmation(orderResponse.data);
              console.log("Form submitted!");
            });
          }
        }
      }
    });
  }
});

const renderCartinCheckout = async () => {
  let productsInCart = productsAddedInCart();

  let countItemElement = document.querySelector("#count-item");
  if (countItemElement) {
    countItemElement.innerHTML = String(productsInCart.length);
  }

  let checkoutSummaryElement = document.querySelector("#checkoutSummary");
if (checkoutSummaryElement) {
  checkoutSummaryElement.innerHTML = `
    <div class="row">` + // The row container
    productsInCart.map((product) => {
      return `
      <div class="col-12 mb-3">
        <div class="card cart-item-card">
          <div class="card-body">
            <div class="row g-0">
              <!-- Image and product name on the left -->
              <div class="col-4 d-grid align-items-start pe-3"> <!-- Changed to use Bootstrap's grid system -->
                <img src="https://bortakvall.se${product.images.thumbnail}" class="img-fluid rounded-3 mb-2">
                <h6 class="product-name small text-muted">${product.name}</h6>
              </div>

              <!-- Quantity in the middle -->
              <div class="col-4 d-grid align-items-center justify-content-center">
                <div>
                  <button class="reduce-btn btn btn-outline-secondary btn-sm" data-product-id="${product.id}">-</button>
                  <span class="sum-products mx-2">${localStorage.getItem(String(product.id))}</span>
                  <button class="increase-btn btn btn-outline-secondary btn-sm" data-product-id="${product.id}">+</button>
                </div>
              </div>

              <!-- Price on the right -->
              <div class="col-4 d-flex align-items-center justify-content-end">
                <div>${Number(localStorage.getItem(String(product.id)) || 0) * product.price} kr</div>
              </div>
            </div>
          </div>
        </div>
      </div>


    `;
    }).join("") +
    `</div>`;
}
  let totalProductPrice = productsInCart.reduce((total, product) => {
    const quantity = localStorage.getItem(String(product.id)) || "0";
    return total + parseInt(quantity) * product.price;
  }, 0);

  let totalCartCheckoutElement = document.querySelector("#total-cart-checkout");
  if (totalCartCheckoutElement) {
    totalCartCheckoutElement.innerHTML = `
    <div class="d-flex total-price-checkout justify-content-center align-items-center" style="height: 100px;">
      <p>Total</p>
      &nbsp;
      <p>${totalProductPrice} kr</p>
    </div>
  `;
}

  // Re-attach event listeners to the newly added buttons in the checkout
};

// Run the initial cart rendering
renderCartinCheckout();

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

// Handle the cancel button in the checkout form
let confirmationModalElement = document.getElementById("confirmationModal");
let checkoutModalElement = document.getElementById("checkoutModal");
let confirmContinuePurchaseBtnElement = document.getElementById(
  "confirmContinuePurchaseBtn"
);
let dataBsDismissModalElement = document.querySelector(
  '[data-bs-dismiss="modal"]'
);

if (
  confirmationModalElement &&
  checkoutModalElement &&
  confirmContinuePurchaseBtnElement &&
  dataBsDismissModalElement
) {
  const confirmModal = new bootstrap.Modal(confirmationModalElement, {});
  const checkoutModal = new bootstrap.Modal(checkoutModalElement, {});

  confirmContinuePurchaseBtnElement.addEventListener("click", function () {
    confirmModal.hide();
    setTimeout(() => {
      checkoutModal.show();
    }, 500);
  });

  dataBsDismissModalElement.addEventListener("click", function () {
    confirmModal.hide();
  });
}

document
  .getElementById("confirmCancelBtn")!
  .addEventListener("click", function () {
    localStorage.clear();
    window.location.reload();
  });

const orderSubmitForm = () => {
  const formCustomer = document.querySelector("#form-customer");
  if (formCustomer) {
    formCustomer.addEventListener("submit", async (e) => {
      e.preventDefault();
      showSpinner();
      const orderResponse = await orderFormRequest();
      hideSpinner();

      console.log("Order response:", orderResponse); // Debug: log the response

      if (orderResponse.status === "success") {
        localStorage.clear();
        renderCart();
        showOrderConfirmationModal(orderResponse.data);
        orderConfirmation(orderResponse.data);
        console.log("Order successful:", orderResponse.data);
      } else if (orderResponse.status === "fail") {
        console.error("Order failed:", orderResponse.data);
        // Display error messages
        Object.keys(orderResponse.data).forEach((key) => {
          const errorField = document.querySelector(`#${key}`);
          if (errorField instanceof HTMLElement) {
            errorField.innerText = orderResponse.data[key];
          }
        });
      }
    });
  }
};
const showOrderConfirmationModal = (orderResponse: IOrder) => {
  const modalBody = document.querySelector(
    "#orderConfirmationModal .modal-body"
  );

  if (modalBody) {
    modalBody.innerHTML = `
      <p>Thank you for your order, ${orderResponse.customer_first_name}!</p>
      <p>Your order number is: ${orderResponse.id}</p>
      <p>Total: ${orderResponse.order_total} kr</p>
      <p>Order Date: ${orderResponse.created_at}</p>
    `;

    const orderConfirmationModalElement = document.getElementById(
      "orderConfirmationModal"
    );
    let confirmContinuePurchaseBtnElement = document.getElementById(
      "confirmContinuePurchaseBtn"
    );
    if (orderConfirmationModalElement) {
      const orderConfirmationModal = new bootstrap.Modal(
        orderConfirmationModalElement
      );
      orderConfirmationModal.show();
    } else {
      console.error(
        'Element with id "orderConfirmationModal" was not found in the DOM'
      );
    }
  } else {
    console.error(
      'Element with selector "#orderConfirmationModal .modal-body" was not found in the DOM'
    );
  }
};

orderSubmitForm();


const orderConfirmation = async (orderResponse: IOrder) => {
  document.querySelector(".checkout-form")?.classList.add("hide");

  document.querySelector("#order-confirmation")!.innerHTML = `
  <div class="card mt-5">
      <div class="card-body mx-4">
        <div class="container">
          <h5 class="my-5 mx-5" style="font-size: 30px;">Tack för din order</h5>
            <div class="row">
              <ul class="list-unstyled">
                <li class="text-black font-weight-bold">${orderResponse.customer_first_name} ${orderResponse.customer_last_name}</li>
                <li class="text-muted mt-1"><span class="text-black">Ordernummer:</span> ${orderResponse.id}</li>
                <li class="text-black mt-1">${orderResponse.order_date}</li>
              </ul>
              <hr style="border: 2px solid black;">
            </div>
          <div class="row text-black">
          <div class="col-xl-12">
          <h6 class="float-none fw-bold">Total Summa:${orderResponse.order_total}
          </h6>
      </div>
      <hr style="border: 2px solid black;">
  </div>`;
};
