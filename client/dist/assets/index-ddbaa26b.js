(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))c(e);new MutationObserver(e=>{for(const s of e)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&c(a)}).observe(document,{childList:!0,subtree:!0});function r(e){const s={};return e.integrity&&(s.integrity=e.integrity),e.referrerpolicy&&(s.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?s.credentials="include":e.crossorigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function c(e){if(e.ep)return;e.ep=!0;const s=r(e);fetch(e.href,s)}})();const x="https://bortakvall.se/api/products",C="https://bortakvall.se/api/orders",E=async()=>{const t=await fetch(x);if(console.log("Response fetch status",t.status),!t.ok)throw new Error(`No response from server: ${t.status} ${t.statusText}`);return console.log("Response",t),await t.json()},P=async t=>{const o=await fetch(x+`/${t}`);if(console.log("Response fetch status",o.status),!o.ok)throw new Error(`No response from server: ${o.status} ${o.statusText}`);return console.log("Response",o),await o.json()},_=async t=>{const o=await fetch(C,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)});if(!o.ok)throw new Error(`Could't post to server: ${o.status} ${o.statusText}`);return o.status===200?console.log("Congrats, server responded"):console.log("That didnt go that well"),console.log(o.status),await o.json()};let l=JSON.parse(localStorage.getItem("products")??"[]"),b,n;const N=async()=>{try{b=await E(),l=b.data,console.log("Products",l)}catch(t){console.error("Problem with the server",t)}return O(l),p(),D(),j(),m(),y(),b},A=()=>l.filter(t=>i(t)>0),H=()=>l.filter(t=>i(t)===0),p=()=>{document.querySelector("#storage-instockvsoutofstock").innerHTML=`
<h5>Vi har ${A().length} sorters godis i lager. ${H().length} Sorter är slutsålda</h5>`},S=t=>t.stock_status==="instock"&&t.stock_quantity&&i(t)?'<span style="color: green; font-weight:bold; ">I Lager</span>':'<p style="color: red; font-weight:bold;">Slut i lager</p>',k=t=>{document.querySelector(`#product-status${t.id}`).innerHTML=S(t)},q=t=>{document.querySelector(`#product-quantity${t.id}`).innerHTML=String(i(t))},g=t=>{document.querySelector(`#product-add${t.id}`).disabled=i(t)===0},M=t=>{document.querySelector("#product-description-add").disabled=i(t)===0},i=t=>(console.log(t),(t.stock_quantity||0)-Number(localStorage.getItem(String(t.id)))),O=t=>{const o=document.querySelector("#card-container").innerHTML=t.sort((r,c)=>r.name.toLocaleLowerCase().localeCompare(c.name.toLocaleLowerCase())).map(r=>`
        <div class="card shadow-lg" style="width: 18rem;">
        <img class="card-img-top img-fluid cardImg" src="https://bortakvall.se${r.images.thumbnail}" alt="picture of ${r.name}"
        <div class="card-body">
        <h5 class="card-title">${r.name}</h5>
        <p id="product-status${r.id}">${S(r)}</p>
        <p id="product-quantity${r.id}">${i(r)}</p>
        <p class="card-text fw-bold fst-italic">${r.price}kr</p>
        <a href="#"></a>
        <div class="d-flex flex-column card-body card-buttons">
        <button type="button" class="btn product-description-btn card-btn btn-info mb-2" data-product-id=${r.id}>Läs mer</button>
        <button type="button" id="product-add${r.id}" class="cart-btn btn btn-success card-btn" data-cart-id=${r.id}>Lägg till</button>

        </div>
        </div>
        </div>`).join("");return t.forEach(g),o},j=()=>{document.querySelectorAll(".cart-btn").forEach(t=>{t.addEventListener("click",async o=>{o.preventDefault();const c=o.target.dataset.cartId;console.log(c),$(c)})})},$=t=>{let o=l.find(c=>c.id==Number(t)),r=Number(localStorage.getItem(t)||0);i(o)>0&&r++,localStorage.setItem(t,String(r)),m(),y(),q(o),k(o),g(o),f(o),p()},R=t=>{let o=l.find(c=>c.id==Number(t)),r=Number(localStorage.getItem(t)||0);r<=1?I(t):(r--,localStorage.setItem(t,String(r)),m(),y(),q(o),k(o),g(o),f(o),p())},I=t=>{let o=l.find(r=>r.id==Number(t));localStorage.removeItem(t),m(),y(),q(o),k(o),g(o),f(o),p()},f=t=>{var o,r;document.querySelector("#card-product-description").innerHTML=`
  <div class="container mt-5 mb-4">

        <div class="container mt-5">

          <div class="row">
            <div class="col-sm-5 p-0 mb-4">
              <img src="https://bortakvall.se${t.images.large}" class="img-fluid" alt="...">
            </div>
            <div class="col-sm-6 pb-3" style="background-color:yellow;">
              <h4 class="mt-5 fw-bold ">${t.name}</h4>
              <h6 class="card-subtitle mb-2 text-muted"></h6>
              <p class="mb-4 d-flex justify-content-center">Art. nr:  ${t.id}</p>
              <h5 class="mt-2 card-text fw-bold fst-italic">${t.price}kr</h5>
              <p class="card-text mt-3">${t.description}</p>
              <p id="product-status${t.id}">${S(t)}</p>

              <p id="product-quantity${t.id}">${i(t)}</p>

              <div class="container">
              </div>
           
              <button type="button" id="product-description-add" class="cart-btn btn btn-success" data-product-id=${t.id}>Add to cart</button>
              <button id="main-homepage" type="button" class="btn btn-primary">Back to main</button>
              </div>
            </div>
          </div>
        </div>
      </div>`,F(),M(t),(r=(o=document.querySelector("#product-description"))==null?void 0:o.querySelector("#product-description-add"))==null||r.addEventListener("click",c=>{const e=c.target;$(e.dataset.productId),console.log(e.dataset.productId)})},D=()=>{document.querySelectorAll(".product-description-btn").forEach(t=>{t.addEventListener("click",async o=>{var s,a,d;const r=o.target;console.log(r);let e=(await P(r.dataset.productId)).data;(s=document.querySelector("#main-page"))==null||s.classList.add("hide"),(a=document.querySelector("#product-description"))==null||a.classList.remove("hide"),(d=document.querySelector(".checkout-form"))==null||d.classList.add("hide"),f(e)})})},F=()=>{var t;(t=document.querySelector("#main-homepage"))==null||t.addEventListener("click",async o=>{var c,e,s,a;const r=o.target;console.log(r),(c=document.querySelector("#product-description"))==null||c.classList.add("hide"),(e=document.querySelector("#main-page"))==null||e.classList.remove("hide"),(s=document.querySelector(".description"))==null||s.classList.add("hide"),(a=document.querySelector(".checkout-form"))==null||a.classList.add("hide")})},Q=document.querySelector("#menu-toggle"),u=document.querySelector("#dropdown-menu");let v=!1;Q.addEventListener("click",()=>{v=!v,v?u.style.display="block":u.style.display="none"});const B=t=>localStorage.getItem(String(t.id)),h=()=>l.filter(B),L=t=>t.map(r=>r.price*Number(localStorage.getItem(String(r.id)))).reduce((r,c)=>r+c,0),m=async()=>{let t=h(),o=L(t);document.querySelector("#count-item").innerHTML=String(t.length);const r=document.querySelector(".cart-render").innerHTML=t.map(e=>`
        <div class="cart-items">
        <div id="cartBox" class="d-flex">

            <div id="imgBox" class="d-flex m-2 gap-2">
            <button type="button" class="remove-item remove-img" data-product-id=${e.id}>
                <i class="fa fa-trash" data-product-id=${e.id}></i>

                <i class="fa fa-trash-can" data-product-id=${e.id}></i>
                </button>
                <i class="fa fa-trash-can" data-product-id=${e.id}></i>
            </button>

              <img class="menu-img img-fluid"
              src="https://bortakvall.se${e.images.thumbnail}"
              alt="picture of ${e.name}"/>

            </div>
          <h5 class="card-title m-2">${e.name}</h5>

      </div>

        <div class="menu-items d-flex justify-content-end gap-3">
        <p>${e.price} kr</p>
        <p>${Number(localStorage.getItem(String(e.id)))*e.price} kr</p>
      </div>


        <div class="test d-flex justify-content-end">
          <div class="counter-icon m-2">
            <button class="reduce-btn" data-product-id=${e.id}>-</button>
        <span class="sum-products">${localStorage.getItem(String(e.id))} </span>

              <button class="increase-btn" data-product-id=${e.id}>+</button>
          </div>
        </div>
    <hr>
        `).join("");document.querySelector("#total-cart").innerHTML=`
      <h5>Total ${o} kr</h5>
      <button class="btn btn-warning" id="checkout-btn">Till Kassan</button>`;const c=document.querySelector("#checkout-btn");return c==null||c.addEventListener("click",()=>{var e,s,a,d;(e=document.querySelector("#main-page"))==null||e.classList.add("hide"),(s=document.querySelector("#product-description"))==null||s.classList.add("hide"),(a=document.querySelector(".checkout-form"))==null||a.classList.remove("hide"),u.classList.toggle("hidden"),(d=document.querySelector(".description"))==null||d.classList.add("hide")}),document.querySelectorAll(".remove-item").forEach(e=>{e.addEventListener("click",s=>{const a=s.target;I(a.dataset.productId)})}),document==null||document.querySelectorAll(".reduce-btn").forEach(e=>{e==null||e.addEventListener("click",s=>{const a=s.target;R(a.dataset.productId)})}),document==null||document.querySelectorAll(".increase-btn").forEach(e=>{e==null||e.addEventListener("click",s=>{const a=s.target;console.log(a),$(a.dataset.productId)})}),document.querySelector("#checkout-btn").addEventListener("click",()=>{var e,s;(e=document.querySelector("#main-page"))==null||e.classList.add("hide"),(s=document.querySelector(".checkout-form"))==null||s.classList.remove("hide"),u.classList.toggle("hide")}),document.querySelector("#checkout-btn").addEventListener("click",()=>{var e,s;(e=document.querySelector("#main-page"))==null||e.classList.add("hide"),(s=document.querySelector(".checkout-form"))==null||s.classList.remove("hide"),u.classList.toggle("hide")}),r};N();const y=async()=>{let t=h(),o=L(t);document.querySelector("#count-item").innerHTML=String(t.length);const r=document.querySelector("#checkoutSummary").innerHTML=t.map(c=>`<div class="d-flex flex-wrap card border-0 rounded-3 mb-4 w-100 p-3 h-100 d-inline-block" style="">
          <div class="card-body p-4">
            <div class="row d-flex justify-content-between align-items-center">
              <div class="col-md-2 col-lg-2 col-xl-2">
                <img class="card-img-top mx-auto d-block menu-img img-fluid" src="https://bortakvall.se${c.images.thumbnail}" alt="picture of ${c.name}"/>
              </div>
              <div class="col-md-3 col-lg-3 col-xl-3">
                <p class="lead fw-normal mb-2">${c.name}</p>
                <p><span class="text-muted"></span>${c.price}kr<span class="text-muted"></span></p>
              </div>
              <div class="col-md-3 col-lg-3 col-xl-2 d-flex">

              <span class="sum-products">Antal ${localStorage.getItem(String(c.id))} </span>
              </div>
              <div class="col-md-3 col-lg-2 col-xl-2 offset-lg-1">
                <h5 class="mb-0"><p>Summa ${Number(localStorage.getItem(String(c.id)))*c.price} kr</p></h5>

              </div>
              <div class="col-md-1 col-lg-1 col-xl-1 text-end">
                <a href="#!" class="text-danger"><i class="fas fa-trash fa-lg"></i></a>
              </div>
            </div>
          </div>
        </div>
        `).join("");return document.querySelector("#total-cart-checkout").innerHTML=`
      <h5>Total ${o} kr</h5>
      `,r},z=async()=>{const t=document.querySelector("#inputFirstName").value,o=document.querySelector("#inputLastName").value,r=document.querySelector("#inputAddress").value;let c=document.querySelector("#inputZip").value;const e=document.querySelector("#inputCity").value,s=document.querySelector("#inputEmail").value;let a=document.querySelector("#inputPhone").value,d=h(),w=L(d);console.log(w);let T={customer_first_name:t,customer_last_name:o,customer_address:r,customer_postcode:c,customer_city:e,customer_email:s,customer_phone:a,order_total:w,order_items:J()};return await _(T)},J=()=>h().map(t=>({product_id:t.id,qty:Number(localStorage.getItem(String(t.id))),item_price:t.price,item_total:t.price*Number(localStorage.getItem(String(t.id)))})),K=()=>{var t;(t=document.querySelector("#form-customer"))==null||t.addEventListener("submit",async o=>{o.preventDefault(),n=await z(),n.status==="success"?(localStorage.clear(),V(),m()):n.status==="fail"&&Object.keys(n.data).forEach(r=>{document.querySelector(`#${r}`).innerText=String(n.data[r])})})};K();const V=async()=>{var t;(t=document.querySelector(".checkout-form"))==null||t.classList.add("hide"),document.querySelector("#order-confirmation").innerHTML=`

      <div class="card mt-5">

        <div class="card-body mx-4">

          <div class="container">

            <h5 class="my-5 mx-5" style="font-size: 30px;">Tack för din order</h5>

              <div class="row">

                <ul class="list-unstyled">

                  <li class="text-black font-weight-bold">${n.data.customer_first_name} ${n.data.customer_last_name}</li>

                  <li class="text-muted mt-1"><span class="text-black">Ordernummer:</span> ${n.data.id}</li>

                  <li class="text-black mt-1">${n.data.order_date}</li>

                </ul>

                <hr style="border: 2px solid black;">

              </div>
            <div class="row text-black">
            <div class="col-xl-12">
            <h6 class="float-none fw-bold">Total Summa:${n.data.order_total}
            </h6>
      </div>
      <hr style="border: 2px solid black;">
    </div>
    `};
