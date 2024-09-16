// import {
//   fetchProduct,
//   fetchProducts,
//   createOrders,
//   updateProductQuantityInDB,
// } from "./api";
import { fetchProducts, createOrders } from "./api";
import {
  IProduct,
  IProductsResponse,
  IOrderRequest,
  IOrderItemRequest,
  // IOrderResponse,
  IOrder,
} from "./interfaces";
import "bootstrap/dist/css/bootstrap.css";
import * as bootstrap from "bootstrap";
import "./style.scss";


// Wait for the DOM to load before executing the image logic
document.addEventListener("DOMContentLoaded", function() {
  const spinner = document.getElementById('spinner');
  if (spinner) {
    spinner.style.display = 'block'; // Show spinner while image is loading
  }

  // Create a new Image object and set its source to the background image
  const img = new Image();
  img.src = './src/img/bg-candy-light.jpg'; // Correct relative path to your background image

  // When the image has fully loaded
  img.onload = function() {
    document.body.style.backgroundImage = 'url(./src/img/bg-candy-light.jpg)'; // Set background image
    if (spinner) {
      spinner.style.display = 'none'; // Hide spinner after image has loaded
    }
  };
})

let products: IProduct[] = JSON.parse(localStorage.getItem("products") ?? "[]");

let productsResponse: IProductsResponse;

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
    addEventToCartButton();
    renderCartinCheckout();
    renderCart();

    hideSpinner();
  } catch (err) {
    console.error("Problem with the server", err);
    hideSpinner();
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
  document.querySelector(".stock-phrase")!.innerHTML = `
<p>We have ${inStockItems().length} various types of candy in stock and ${
    outofStockItems().length
  }  are sold out</p>`;
};

const renderProductStatus = (product: IProduct) => {
  const availableQuantity = renderProductQuantity(product);
  if (product.stock_status === "instock" && availableQuantity > 0) {
    return `<span id="product-quantity${
      product.id
    }" style="color: red; font-weight:bold;">${renderProductQuantity(
      product
    )}</span> <span style="color: red; font-weight:bold;">in stock </span>`;
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

const getImageUrl = (imagePath: string): string => {
  // Check if the imagePath starts with 'http' or 'https', then use it directly
  if (imagePath.startsWith("http")) {
    return imagePath;
  } else {
    // Otherwise, prepend the domain to the relative path
    return `https://bortakvall.se${imagePath}`;
  }
};


const renderProducts = (products: IProduct[]) => {
  const cardItems = (document.querySelector("#card-container")!.innerHTML =
    products
      .sort((a, b) =>
        a.name.toLocaleLowerCase().localeCompare(b.name.toLocaleLowerCase())
      )
      .map((product: IProduct) => {
        const isOutOfStock = renderProductQuantity(product) === 0;
        return `
          <div class="card shadow-lg relative ${
            isOutOfStock ? "sold-out" : ""
          }" data-product-id=${product.id} style="width: 18rem;">
            ${
              isOutOfStock
                ? '<div class="sold-out-message top-0 left-0 w-full h-full flex items-center justify-center">SOLD OUT</div>'
                : ""
            }
            <h1 class="text-uppercase product-card-title mt-2">${
              product.name
            }</h1>
            <img class="card-img card-img-top img-fluid cardImg p-3 products-images" src="${getImageUrl(
              product.images.thumbnail
            )}" alt="picture of ${product.name}" class="img-fluid">
            <div class="card-body">
              <i class="info-icon">i</i>
              <div class="d-flex justify-content-start align-items-center">
                <p class="price-tag mr-2">${product.price}kr</p>
                <p id="product-status${
                  product.id
                }" class="stock-tag bg-red ml-2">${renderProductStatus(
          product
        )}</p>
              </div>
              <a href="#"></a>
              <div class="d-flex flex-column card-body card-buttons">
                <button type="button" id=${
                  product.id
                } class="cart-btn btn btn-success card-btn" data-cart-id=${
          product.id
        } ${isOutOfStock ? "disabled" : ""}>Add to cart</button>
              </div>
            </div>
          </div>`;
      })
      .join(""));
  addEventToCartButton();
  document.querySelectorAll(".info-icon").forEach((icon) => {
    icon.addEventListener("click", (event) => {
      // Prevent the event from bubbling up to the card
      event.stopPropagation();

      // Get the card that contains this icon
      const card = (icon as HTMLElement).closest(".card");

      if (card) {
        const productId = card.getAttribute("data-product-id");
        const product = products.find((p) => p.id.toString() === productId);
        if (product) {
          displayProductDetailsInModal(product);
        }
      }
    });
  });

  return cardItems;
};

getProducts().then(() => {
  renderProducts(products);

  console.log("Calling addEventToCartButton...");
});

const addEventToCartButton = () => {
  document.querySelectorAll(".cart-btn").forEach((element) => {
    element.addEventListener("click", async (e: Event) => {
      e.preventDefault();
      const productId = (e.currentTarget as HTMLElement).dataset.cartId!;
      console.log(productId);
      addToCart(productId);
    });
  });
};

const addToCart = (productId: string) => {

  let product = products.find((e) => e.id === Number(productId));
  if (!product) {
    console.error("Product not found");
    // Hide spinner if the product is not found
    return;
  }

  let productQuantity = Number(localStorage.getItem(productId) || 0);
  if (renderProductQuantity(product) > 0) {

    productQuantity++;
    localStorage.setItem(productId, String(productQuantity));
    renderCart();
    renderCartinCheckout();

    updateProductQuantity(product);
    updateProductAddToCart(product);
    updateProductStatus(product);
    stockPhrase();
  } else {
    console.error("Product is out of stock");
  }

  renderCart();
  renderCartinCheckout();

  // Hide the spinner here after all updates
};

const removeFromCart = (productId: string) => {
 // Start spinner at the beginning of the operation
  let product = products.find((e) => e.id === Number(productId));
  if (!product) {
    console.error("Product not found");
    // Hide spinner if the product is not found
    return;
  }

  let productQuantity = Number(localStorage.getItem(productId) || 0);
  if (productQuantity <= 1) {
    deleteFromCart(productId);
    // Hide spinner after deletion
  } else {
    productQuantity--;
    localStorage.setItem(productId, String(productQuantity));

    renderCartinCheckout();
    renderCart();
    updateProductQuantity(product);
    updateProductAddToCart(product);
    updateProductStatus(product);
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

  stockPhrase();
};

function displayProductDetailsInModal(product: IProduct) {
  const modalBody = document.querySelector(".modal-body") as HTMLElement;

  modalBody!.innerHTML = `
      <div class="modal-header">
        <h5 class="modal-title">${product.name}</h5>
      </div>
      <div class="modal-body">
        <div class="container-fluid">
          <div class="row">
          <div class="col-12 col-md-6 mb-3 mb-md-0 image-description">
          <img class="card-img card-img-top img-fluid cardImg p-3 products-images" src="${getImageUrl(
              product.images.thumbnail
            )}" alt="picture of ${product.name}" class="img-fluid">
        </div>
            <div class="card-product-description col-10 col-md-6">
              <p>${product.description}</p>
              <p class="fw-bold">Price: ${product.price} kr</p>
              <button type="button" id="product-description-add" class="cart-btn btn btn-success" data-product-id=${product.id}>
                Add to cart
              </button>
          </div>
        </div>
      </div>
    `;
  const addToCartBtn = document.querySelector(
    "#product-description-add"
  ) as HTMLButtonElement;

  addToCartBtn!.onclick = () => addToCart(product.id.toString());

  // Call your function to disable the button if the product quantity is zero
  updateProductDescriptionAddToCart(product);

  const productModalElement = document.getElementById(
    "productModal"
  ) as HTMLElement;

  new bootstrap.Modal(productModalElement).show();
}

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
    cartItemsContainer.innerHTML = `<div class='empty-cart-message'>Get some sweets!</div>`;
  } else {
    console.error('Element with class "cart-render" not found');
  }

  if (cartItemsContainer) {
    if (productsInCart.length === 0) {
      cartItemsContainer.innerHTML = `<div class='empty-cart-message'>Get some sweets!</div>`;
      document.querySelector(".total-cart")!.innerHTML = ""; // Clear total cart if empty
      let checkoutBtn = document.querySelector("#checkout-btn");
      if (checkoutBtn) {
        (checkoutBtn as HTMLElement).style.display = "none";
      }
    } else {
      document.querySelector(".cart-render")!.innerHTML = productsInCart
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
                <img class="card-img card-img-top img-fluid cardImg p-3 products-images" src="${getImageUrl(
              product.images.thumbnail
            )}" alt="picture of ${product.name}" class="img-fluid">
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
        .join("");

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
          e.stopPropagation(); // Stop event bubbling

          const target = e.target as HTMLElement;
          const productId = target.dataset.productId!;

          // Show the confirmation modal
          const modalElement = document.getElementById("confirmationModal");
          if (modalElement) {
            const confirmationModal = new bootstrap.Modal(modalElement);
            confirmationModal.show();

            // Get the confirmation button
            const confirmRemoveBtn =
              document.getElementById("confirmRemoveBtn");
            if (confirmRemoveBtn) {
              // Remove the previous event listener
              const newConfirmRemoveBtn = confirmRemoveBtn.cloneNode(true);
              confirmRemoveBtn.parentNode?.replaceChild(
                newConfirmRemoveBtn,
                confirmRemoveBtn
              );

              // Add the new event listener
              newConfirmRemoveBtn.addEventListener("click", async (e) => {
                e.stopPropagation(); // Stop event bubbling

                deleteFromCart(productId);
                await renderCart();
                confirmationModal.hide();
              });
            }
          } else {
            console.error("Modal element not found");
          }
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

          formCustomerInModal!.addEventListener("submit", async (e) => {
            e.preventDefault();
            e.stopPropagation();
            // Handle form submission here or validate inputs
            orderSubmitForm();
            // orderConfirmation(orderResponse.data);
            console.log("Form submitted!");
          });
        }
      }
    });
  }
});

const addToCheckout = (productId: string) => {
  let product = products.find((e) => e.id === Number(productId));
  if (!product) {
    console.error("Product not found");
    return;
  }

  let productQuantity = Number(localStorage.getItem(productId) || 0);
  if (renderProductQuantity(product) > 0) {
    productQuantity++;
    localStorage.setItem(productId, String(productQuantity));
    renderCartinCheckout();
    updateProductQuantity(product);
    updateProductStatus(product);
    updateProductAddToCart(product);
    stockPhrase();
  } else {
    console.error("Product is out of stock");
  }
};

const removeFromCheckout = (productId: string) => {
  let product = products.find((e) => e.id === Number(productId));
  if (!product) {
    console.error("Product not found");
    return;
  }

  let productQuantity = Number(localStorage.getItem(productId) || 0);
  if (productQuantity <= 1) {
    deleteFromCart(productId);
  } else {
    productQuantity--;
    localStorage.setItem(productId, String(productQuantity));
    renderCartinCheckout();
    updateProductQuantity(product);
    updateProductStatus(product);
    updateProductAddToCart(product);
    stockPhrase();
  }
};


const renderCartinCheckout = async () => {
  let productsInCart = productsAddedInCart();

  let countItemElement = document.querySelector("#count-item");
  if (countItemElement) {
    countItemElement.innerHTML = String(productsInCart.length);
  }

  let checkoutSummaryElement = document.querySelector("#checkoutSummary");
  if (checkoutSummaryElement) {
    checkoutSummaryElement.innerHTML =
      `
    <div class="row">` + // The row container
      productsInCart
        .map((product) => {
          return `
      <div class="col-12 mb-3">
        <div class="card cart-item-card">
          <div class="card-body">
            <div class="row g-0">
              <!-- Image and product name on the left -->
              <div class="col-4 d-grid align-items-start pe-3"> <!-- Changed to use Bootstrap's grid system -->
                <img src="${getImageUrl(
              product.images.thumbnail
            )}" class="img-fluid rounded-3 mb-2">
                <h6 class="product-name small text-muted">${product.name}</h6>
              </div>

             <!-- Quantity in the middle -->
             <div class="col-4 d-flex align-items-center justify-content-center">
              <div class="d-flex align-items-center">
                <button class="reduce-btn-checkout btn btn-outline-secondary btn-sm" data-product-id=${product.id}>-</button>
                <span class="sum-products mx-2">${localStorage.getItem(String(product.id))}</span>
                <button class="increase-btn-checkout btn btn-outline-secondary btn-sm" data-product-id=${product.id}>+</button>
              </div>
            </div>

              <!-- Price on the right -->
              <div class="col-4 d-flex align-items-center justify-content-end">
                <div>${
                  Number(localStorage.getItem(String(product.id)) || 0) *
                  product.price
                } kr</div>
              </div>
            </div>
          </div>
        </div>
      </div>


    `;
        })
        .join("") +
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
document.querySelectorAll('.increase-btn-checkout').forEach((element) => {
  element.addEventListener('click', (e) =>
    {
      const target = e.target as HTMLElement;
      console.log(target);
      addToCheckout(target.dataset.productId!);
    });
});

document?.querySelectorAll(".reduce-btn-checkout").forEach((element) => {
  element?.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    removeFromCheckout(target.dataset.productId!);
  });
});



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
    order_date: new Date().toISOString(),
    customer_first_name: firstNameInput,
    customer_last_name: lastNameInput,
    customer_address: adressInput,
    customer_postcode: zipInput,
    customer_city: cityInput,
    customer_email: emailInput,
    customer_phone: phoneInput,
    order_total: totalSumPrice,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
let confirmationModalElement = document.getElementById("confirmationModalForm");
let checkoutModalElement = document.getElementById("checkoutModal");
let confirmContinuePurchaseBtnElement = document.getElementById(
  "confirmContinueOrderBtn"
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
  .getElementById("confirmCancelOrderBtn")!
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
        console.log("Order successful:", orderResponse.data);
      } else if (orderResponse && orderResponse.status === "fail") {
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
  // Close all active Bootstrap modals
  document.querySelectorAll(".modal").forEach((modal) => {
    let bsModal = bootstrap.Modal.getInstance(modal);
    if (bsModal) {
      bsModal.hide();
    }
  });

  const modalBody = document.querySelector(
    "#orderConfirmationModalForm .modal-body"
  );
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="card mt-5">
        <div class="card-body mx-4">
          <div class="container">
            <h5 class="my-5 mx-5" style="font-size: 30px;">Thank you for your order!</h5>
            <div class="row">
              <ul class="list-unstyled">
                <li class="text-black font-weight-bold">${orderResponse.customer_first_name} ${orderResponse.customer_last_name}</li>
                <li class="text-muted mt-1"><span class="text-black">Order#:</span> ${orderResponse.id}</li>
                <li class="text-black mt-1">${orderResponse.order_date}</li>
                <li class="text-black mt-1">ORDER TOTAL: ${orderResponse.order_total} Kr</li>
              </ul>
              <hr style="border: 2px solid black;">
            </div>
          </div>
        </div>
      </div>`;

    const orderConfirmationModalElement = document.getElementById(
      "orderConfirmationModalForm"
    );
    if (orderConfirmationModalElement) {
      const orderConfirmationModal = new bootstrap.Modal(
        orderConfirmationModalElement,
        {
          backdrop: "static", // Prevent closing when clicking outside
          keyboard: false, // Prevent closing with keyboard (Esc key)
        }
      );
      orderConfirmationModal.show();

      // Handle the close button click
      orderConfirmationModalElement
        .querySelector(".btn-close-receipt")!
        .addEventListener("click", function () {
          localStorage.clear();
          window.location.reload();
        });
    }
  }
};

// orderSubmitForm();
