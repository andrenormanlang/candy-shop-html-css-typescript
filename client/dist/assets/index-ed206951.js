(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))c(e);new MutationObserver(e=>{for(const s of e)if(s.type==="childList")for(const a of s.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&c(a)}).observe(document,{childList:!0,subtree:!0});function o(e){const s={};return e.integrity&&(s.integrity=e.integrity),e.referrerpolicy&&(s.referrerPolicy=e.referrerpolicy),e.crossorigin==="use-credentials"?s.credentials="include":e.crossorigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function c(e){if(e.ep)return;e.ep=!0;const s=o(e);fetch(e.href,s)}})();const w="https://bortakvall.se/api/products",T="https://bortakvall.se/api/orders",C=async()=>{const t=await fetch(w);if(console.log("Response fetch status",t.status),!t.ok)throw new Error(`No response from server: ${t.status} ${t.statusText}`);return console.log("Response",t),await t.json()},E=async t=>{const r=await fetch(w+`/${t}`);if(console.log("Response fetch status",r.status),!r.ok)throw new Error(`No response from server: ${r.status} ${r.statusText}`);return console.log("Response",r),await r.json()},P=async t=>{const r=await fetch(T,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(t)});if(!r.ok)throw new Error(`Could't post to server: ${r.status} ${r.statusText}`);return r.status===200?console.log("Congrats, server responded"):console.log("That didnt go that well"),console.log(r.status),await r.json()};let l=JSON.parse(localStorage.getItem("products")??"[]"),b,n;const _=async()=>{try{b=await C(),l=b.data,console.log("Products",l)}catch(t){console.error("Problem with the server",t)}return M(l),p(),R(),j(),u(),f(),b},N=()=>l.filter(t=>i(t)>0),A=()=>l.filter(t=>i(t)===0),p=()=>{document.querySelector("#storage-instockvsoutofstock").innerHTML=`
<h5>Vi har ${N().length} sorters godis i lager. ${A().length} Sorter är slutsålda</h5>`},v=t=>t.stock_status==="instock"&&t.stock_quantity&&i(t)?'<span style="color: green; font-weight:bold; ">I Lager</span>':'<p style="color: red; font-weight:bold;">Slut i lager</p>',S=t=>{document.querySelector(`#product-status${t.id}`).innerHTML=v(t)},q=t=>{document.querySelector(`#product-quantity${t.id}`).innerHTML=String(i(t))},g=t=>{document.querySelector(`#product-add${t.id}`).disabled=i(t)===0},H=t=>{document.querySelector("#product-description-add").disabled=i(t)===0},i=t=>(console.log(t),(t.stock_quantity||0)-Number(localStorage.getItem(String(t.id)))),M=t=>{const r=document.querySelector("#card-container").innerHTML=t.sort((o,c)=>o.name.toLocaleLowerCase().localeCompare(c.name.toLocaleLowerCase())).map(o=>`
        <div class="card shadow-lg" style="width: 18rem;">
        <img class="card-img-top img-fluid cardImg" src="https://bortakvall.se${o.images.thumbnail}" alt="picture of ${o.name}"
        <div class="card-body">
        <h5 class="card-title">${o.name}</h5>
        <p id="product-status${o.id}">${v(o)}</p>
        <p id="product-quantity${o.id}">${i(o)}</p>
        <p class="card-text fw-bold fst-italic">${o.price}kr</p>
        <a href="#"></a>
        <div class="d-flex flex-column card-body card-buttons">
        <button type="button" class="btn product-description-btn card-btn btn-info mb-2" data-product-id=${o.id}>Läs mer</button>
        <button type="button" id="product-add${o.id}" class="cart-btn btn btn-success card-btn" data-cart-id=${o.id}>Lägg till</button>

        </div>
        </div>
        </div>`).join("");return t.forEach(g),r},j=()=>{document.querySelectorAll(".cart-btn").forEach(t=>{t.addEventListener("click",async r=>{r.preventDefault();const c=r.target.dataset.cartId;console.log(c),k(c)})})},k=t=>{let r=l.find(c=>c.id==Number(t)),o=Number(localStorage.getItem(t)||0);i(r)>0&&o++,localStorage.setItem(t,String(o)),u(),f(),q(r),S(r),g(r),h(r),p()},O=t=>{let r=l.find(c=>c.id==Number(t)),o=Number(localStorage.getItem(t)||0);o<=1?x(t):(o--,localStorage.setItem(t,String(o)),u(),f(),q(r),S(r),g(r),h(r),p())},x=t=>{let r=l.find(o=>o.id==Number(t));localStorage.removeItem(t),u(),f(),q(r),S(r),g(r),h(r),p()},h=t=>{var r,o;document.querySelector("#card-product-description").innerHTML=`
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
              <p id="product-status${t.id}">${v(t)}</p>

              <p id="product-quantity${t.id}">${i(t)}</p>

              <div class="container">
              </div>
           
              <button type="button" id="product-description-add" class="cart-btn btn btn-success" data-product-id=${t.id}>Add to cart</button>
              <button id="main-homepage" type="button" class="btn btn-primary">Back to main</button>
              </div>
            </div>
          </div>
        </div>
      </div>`,D(),H(t),(o=(r=document.querySelector("#product-description"))==null?void 0:r.querySelector("#product-description-add"))==null||o.addEventListener("click",c=>{const e=c.target;k(e.dataset.productId),console.log(e.dataset.productId)})},R=()=>{document.querySelectorAll(".product-description-btn").forEach(t=>{t.addEventListener("click",async r=>{var s,a,d;const o=r.target;console.log(o);let e=(await E(o.dataset.productId)).data;(s=document.querySelector("#main-page"))==null||s.classList.add("hide"),(a=document.querySelector("#product-description"))==null||a.classList.remove("hide"),(d=document.querySelector(".checkout-form"))==null||d.classList.add("hide"),h(e)})})},D=()=>{var t;(t=document.querySelector("#main-homepage"))==null||t.addEventListener("click",async r=>{var c,e,s,a;const o=r.target;console.log(o),(c=document.querySelector("#product-description"))==null||c.classList.add("hide"),(e=document.querySelector("#main-page"))==null||e.classList.remove("hide"),(s=document.querySelector(".description"))==null||s.classList.add("hide"),(a=document.querySelector(".checkout-form"))==null||a.classList.add("hide")})},F=document.querySelector("#menu-toggle"),m=document.querySelector(".cart");F.addEventListener("click",()=>{m.classList.toggle("cart-hidden")});const Q=t=>localStorage.getItem(String(t.id)),y=()=>l.filter(Q),L=t=>t.map(o=>o.price*Number(localStorage.getItem(String(o.id)))).reduce((o,c)=>o+c,0),u=async()=>{let t=y(),r=L(t);document.querySelector("#count-item").innerHTML=String(t.length);const o=document.querySelector(".cart-render").innerHTML=t.map(e=>`
        <div class="cart-items">
        <div id="cartBox" class="d-flex">

            <div id="imgBox" class="d-flex m-2 gap-2">
              <img src="src/img/trash-can.svg" class="remove-item remove-img" data-product-id=${e.id}>
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
      <h5>Total ${r} kr</h5>
      <button class="btn btn-warning" id="checkout-btn">Till Kassan</button>`;const c=document.querySelector("#checkout-btn");return c==null||c.addEventListener("click",()=>{var e,s,a,d;(e=document.querySelector("#main-page"))==null||e.classList.add("hide"),(s=document.querySelector("#product-description"))==null||s.classList.add("hide"),(a=document.querySelector(".checkout-form"))==null||a.classList.remove("hide"),m.classList.toggle("hidden"),(d=document.querySelector(".description"))==null||d.classList.add("hide")}),document.querySelectorAll(".remove-item").forEach(e=>{e.addEventListener("click",s=>{const a=s.target;console.log("TARGET",a),x(a.dataset.productId)})}),document==null||document.querySelectorAll(".reduce-btn").forEach(e=>{e==null||e.addEventListener("click",s=>{const a=s.target;O(a.dataset.productId)})}),document==null||document.querySelectorAll(".increase-btn").forEach(e=>{e==null||e.addEventListener("click",s=>{const a=s.target;console.log(a),k(a.dataset.productId)})}),document.querySelector("#checkout-btn").addEventListener("click",()=>{var e,s;(e=document.querySelector("#main-page"))==null||e.classList.add("hide"),(s=document.querySelector(".checkout-form"))==null||s.classList.remove("hide"),m.classList.toggle("hide")}),document.querySelector("#checkout-btn").addEventListener("click",()=>{var e,s;(e=document.querySelector("#main-page"))==null||e.classList.add("hide"),(s=document.querySelector(".checkout-form"))==null||s.classList.remove("hide"),m.classList.toggle("hide")}),o};_();const f=async()=>{let t=y(),r=L(t);document.querySelector("#count-item").innerHTML=String(t.length);const o=document.querySelector("#checkoutSummary").innerHTML=t.map(c=>`<div class="d-flex flex-wrap card border-0 rounded-3 mb-4 w-100 p-3 h-100 d-inline-block" style="">
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
      <h5>Total ${r} kr</h5>
      `,o},B=async()=>{const t=document.querySelector("#inputFirstName").value,r=document.querySelector("#inputLastName").value,o=document.querySelector("#inputAddress").value;let c=document.querySelector("#inputZip").value;const e=document.querySelector("#inputCity").value,s=document.querySelector("#inputEmail").value;let a=document.querySelector("#inputPhone").value,d=y(),$=L(d);console.log($);let I={customer_first_name:t,customer_last_name:r,customer_address:o,customer_postcode:c,customer_city:e,customer_email:s,customer_phone:a,order_total:$,order_items:z()};return await P(I)},z=()=>y().map(t=>({product_id:t.id,qty:Number(localStorage.getItem(String(t.id))),item_price:t.price,item_total:t.price*Number(localStorage.getItem(String(t.id)))})),J=()=>{var t;(t=document.querySelector("#form-customer"))==null||t.addEventListener("submit",async r=>{r.preventDefault(),n=await B(),n.status==="success"?(localStorage.clear(),K(),u()):n.status==="fail"&&Object.keys(n.data).forEach(o=>{document.querySelector(`#${o}`).innerText=String(n.data[o])})})};J();const K=async()=>{var t;(t=document.querySelector(".checkout-form"))==null||t.classList.add("hide"),document.querySelector("#order-confirmation").innerHTML=`

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
