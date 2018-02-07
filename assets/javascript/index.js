class shoppingCart {
  constructor () {
    this.db = JSON.parse( localStorage.getItem('cart') ) || [];
    this.db.total = this.db.total || 0;
    this.db.shipping = this.db.shipping || 0;
    this.db.time = this.db.time || 0;
    this.elements = {
      //TODO provide selectors for:
      list: document.getElementById("products"),
      items: document.querySelectorAll("#products li"),
      result: document.querySelectorAll(".cartresult"),
      totaltarget: document.querySelectorAll(".total-target"),
      cart: document.getElementById("cart"),
      reset: document.getElementById("reset"),
      total_template: document.getElementById("total-template"),
      template: document.getElementById("template")
    },
    this.init()
  }
  init(){
    //here you take your cart item template and clone this piece of html to a virtual copy
    var card = this.elements.template
    for (var i in database ) {
      var element = card.cloneNode(true);
      element.removeAttribute("id"),

      element.classList.remove('d-none'),
      
      element.querySelector(".card-img-top").src = database[i].image,

      element.querySelector(".card-title").prepend(i);

      var s = document.createElement("small");
      s.classList.add("text-muted"),
      s.innerHTML = `shipping: ${database[i].shipping}&euro; <br> delivery: ${database[i].delivery}d`,
      element.querySelector(".card-footer").appendChild(s);
      var a = element.querySelector(".btn-primary");
      a.dataset.name = i,
      a.dataset.delivery = database[i].delivery,
      a.dataset.shipping = database[i].shipping,
            a.dataset.price = database[i].price,
      // if(window.location.search.substr(1) === "lang=en"){
      //     }
      this.elements.list.appendChild(element);
      var divs = document.querySelectorAll('#products > div');
      var time = 0;
      for (let div of divs) {
        setTimeout(function(){
          div.classList.remove('faded');
        }, time);
        time+=100
      }
    }
    document.addEventListener('click', (e)=>{
      // these are the event listeners for dynamically created elements. Eg: A element is not present and will be generated and rendered with js, its hart to define the event listeners on document load. They will not hook up, so we listen to the document
      if(e.target && e.target.classList.contains( 'btn-danger' )){
        let itemKey = this.findItemKey(e.target.dataset.name)
        this.updateCart(e.target.dataset.name, true)
      } else if (e.target && e.target.classList.contains( 'cart-button' )){
        this.updateCart(e.target.dataset.name);
        this.render();
      }
    })

    this.render()
    this.resetEventListener()
  }
  resetEventListener() {
    this.elements.reset.addEventListener('click', (e)=>{
      this.db.items = []
      this.db.total = 0
      this.db.shipping = 0
      this.db.delivery = 0
      localStorage.setItem("cart", JSON.stringify( {shipping: 0, total: 0, items: [], delivery: 0 } ))
      this.render()
    })
  }
  findItemKey(itemName){
    //TODO this is the "find a item" in the database function, refactor it to array.filter
    for (let i = 0; i < this.db.items.length; i++){
      if (this.db.items[i].name == itemName){
        return i
      } 
        
    }
  }
  updateCart(item, remove = false){
    //here the magic happens
    //try to understand what happens here
    let itemKey = this.findItemKey(item)
    if(remove){
      if(this.db.items[itemKey].count > 1){
        this.db.items[itemKey].count--
      }else{
        this.db.items.shift(itemKey)
      }
    } else {
      if(itemKey !== undefined){
        this.db.items[itemKey].count++
      } else {
        this.db.items.push({shipping: event.target.dataset.shipping, name: event.target.dataset.name, price: event.target.dataset.price, delivery: event.target.dataset.delivery, count: 1})
      }
    }
    if(this.db.items.length > 0) {
      this.db.total = this.db.items.map((i) => {
        return i.price * i.count
      }).reduce((e, i) => Number(e) + Number(i))

      this.db.shipping = this.db.items.map((i) => {
        return i.shipping
      })
      this.db.shipping = Math.max(...this.db.shipping)

      this.db.delivery = this.db.items.map((i) => {
        return i.delivery
      })
      this.db.delivery = Math.max(...this.db.delivery)
    } else {
      this.db.shipping = 0;
      this.db.total = 0;
      this.db.delivery = 0;
    }

    localStorage.setItem("cart", JSON.stringify( {shipping: this.db.shipping, total: this.db.total, items: this.db.items, delivery: this.db.delivery } ))
    this.render()
  }
  render(){
    this.db.items = this.db.items || []
    // the function checks if items are in the cart and hides the cart if it is empty
    if( this.db.items.length > 0 ){
      this.elements.cart.classList.remove('faded')
      for (let i = 0; i < this.elements.totaltarget.length; i++){
        this.elements.totaltarget[i].classList.remove('faded')
      }
    } else {
      this.elements.cart.classList.add('faded')
      for (let i = 0; i < this.elements.totaltarget.length; i++){
        this.elements.totaltarget[i].classList.add('faded')
      }
    }

    var cart = document.createElement('div')
    this.db.items.forEach( item => {
      var element = document.createElement("li");
      element.classList += "list-group-item d-flex justify-content-between align-items-center ",
      element.innerHTML = `<span class="badge badge-info badge-pill mr-2">${item.count} </span>  ${item.name} - ${item.price}&euro; <span class="ml-auto mr-3 font-weight-bold">${(item.price * item.count).toFixed(2)}&euro;</span>`;
      var s = document.createElement("button");
      s.classList.add("btn", "btn-sm", "btn-danger"),
      s.dataset.name = item.name,
      s.innerHTML = "<i class='fa fa-close pointer-events-none'></i>",
      element.appendChild(s)
      cart.appendChild(element)
    });
    for (let i = 0; i < this.elements.result.length; i++){
      this.elements.result[i].innerHTML = cart.innerHTML
    }
    //TODO we want to show the list of totals several times on the page
    //we loop over the target elements, take each time a new template, fill it with data and display it on the page
    var ttemplate = this.elements.total_template
    for (let i = 0; i < this.elements.totaltarget.length; i++){
      ttemplate = ttemplate.cloneNode(true);
      ttemplate.classList.remove("d-none"),
      ttemplate.querySelector(".total").innerHTML = this.db.total ? this.db.total.toFixed(2) : 0,
      ttemplate.querySelector(".delivery").innerHTML = this.db.delivery ? this.db.delivery.toFixed(0) : 0,
      ttemplate.querySelector(".shipping").innerHTML = this.db.shipping ? this.db.shipping.toFixed(0) : 0,
      this.elements.totaltarget[i].innerHTML = ttemplate.innerHTML
    }
  }
}
var instaceOfCart = new shoppingCart();


// When the user scrolls down 20px from the top of the document, show the button
window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
        document.getElementById("btn-top").style.opacity = 1;
    } else {
        document.getElementById("btn-top").style.opacity = 0;
    }
}

// When the user clicks on the button, scroll to the top of the document
function topFunction() {
    $("body,html").animate({
            scrollTop: 0
        }, 800)
}
