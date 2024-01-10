const { collect } = require("underscore");
const Order = require("./Order");

const OrderState = Object.freeze({
      WELCOMING: Symbol("welcoming"),
      SIZE_1: Symbol("size1"),
      TOPPINGS_1: Symbol("toppings1"),
      second_item: Symbol("2nditem"),
      SIZE_2: Symbol("size2"),
      TOPPINGS_2: Symbol("toppings2"),
      third_item: Symbol("3rditem"),
      SIZE_3: Symbol("size3"),
      TOPPINGS_3: Symbol("toppings3"),
      DRINKS: Symbol("drinks"),
      UP_SELL: Symbol("fries"),
      PAYMENT: Symbol("payment")
});

module.exports = class ShwarmaOrder extends Order 
{
  constructor(sNumber, sUrl) 
  {
    super(sNumber, sUrl);
    this.stateCur = OrderState.WELCOMING;
    this.sSize1 = "";
    this.sToppings1 = "";
    this.sDrinks = "";
    this.sItem = "shawarama";
    this.sItem2 = "";
    this.sSize2 = "";
    this.sToppings2 = "";
    this.sItem3 = "";
    this.sSize3 = "";
    this.sToppings3 = "";
    this.sUp_sell = "";
    this.scost = 5;
  }
  handleInput(sInput) 
  {
    let aReturn = [];
    switch (this.stateCur) 
    {
      case OrderState.WELCOMING:
        this.stateCur = OrderState.SIZE_1;
        aReturn.push("Welcome to Richard's Shawarma.");
        aReturn.push("What size of shawarma would you like?");
        break;
      case OrderState.SIZE_1:
        this.stateCur = OrderState.TOPPINGS_1
        this.sSize1 = sInput;
        aReturn.push("What toppings would you like?");
        break;
      case OrderState.TOPPINGS_1:
        this.stateCur = OrderState.second_item
        this.sToppings1 = sInput;
        aReturn.push("would you like pizza?");
        break;
      case OrderState.second_item:
          if (sInput.toLowerCase() != "no") 
          {
              this.sItem2 = "pizza";
              this.scost = this.scost + 10;
              this.stateCur = OrderState.SIZE_2;
              aReturn.push("what pizza size would you like??")
              break;
          }
          this.stateCur = OrderState.third_item;
          aReturn.push("Would you like wrap with that?");
        break;
        case OrderState.SIZE_2:
          this.stateCur = OrderState.TOPPINGS_2
          this.sSize2 = sInput;
          aReturn.push("What toppings would you like?");
        break;
        case OrderState.TOPPINGS_2:
          this.stateCur = OrderState.third_item
          this.sToppings2 = sInput;
          aReturn.push("Would you like wrap with that?");
        break;
        case OrderState.third_item:
          if (sInput.toLowerCase() != "no") 
          {
              this.sItem3 = "Wrap";
              this.scost = this.scost + 7;
              this.stateCur = OrderState.TOPPINGS_3;
              aReturn.push("what wrap would you like??")
              break;
          }
          this.stateCur = OrderState.UP_SELL;
          aReturn.push("what you like a fries with that");
        break;
        case OrderState.TOPPINGS_3:
          this.stateCur = OrderState.UP_SELL
          this.sToppings3 = sInput;
          aReturn.push("Would you like fries with that?");
        break;
        case OrderState.UP_SELL:
          if(sInput.toLowerCase() !="no")
          {
              this.sUp_sell = sInput;
              this.scost = this.scost + 4 ;
              this.stateCur = OrderState.DRINKS
          }
          this.stateCur = OrderState.DRINKS
          aReturn.push("would you like drink with that?");
        break;   
        case OrderState.DRINKS:
          this.isDone(true); 
          if (sInput.toLowerCase() != "no") 
          {
            this.sDrinks = sInput;
            this.scost = this.scost + 2;
            this.nOrder = this.scost;
            this.stateCur = OrderState.PAYMENT;
          }
          else
          {
            this.stateCur = OrderState.PAYMENT;
            this.nOrder = this.scost;
          }
          aReturn.push("Thank-you for your order of");
          aReturn.push(`${this.sSize1} ${this.sItem} with ${this.sToppings1} `);
          this.sItem2 && aReturn.push(`${this.sSize2} ${this.sItem2} with ${this.sToppings2}`);
          this.sItem3 && aReturn.push(`${this.sItem3} with ${this.sToppings3}`);
          this.sUp_sell && aReturn.push(this.sUp_sell);
          this.sDrinks && aReturn.push(this.sDrinks);
          aReturn.push(`Please pay for your order here`);
          aReturn.push(`${this.sUrl}/payment/${this.sNumber}/`);
      break;
      case OrderState.PAYMENT:
        var add = sInput.purchase_units[0]["shipping"];
        var add2 = add["address"]; 
        this.isDone(true);
        let d = new Date();
        d.setMinutes(d.getMinutes() + 20);
        aReturn.push(`Your order will be delivered at Address: ${add2["address_line_1"]} ${add2["admin_area_2"]} ${add2["admin_area_1"]} ${add2["postal_code"]} ${add2["country_code"]} at ${d.toTimeString()}`); 
      break;
    }
    return aReturn;
  }
  renderForm(sTitle = "-1", sAmount = "-1") 
  {
    // your client id should be kept private
    if (sTitle != "-1") 
    {
      this.sItem = sTitle;
    }
    if (sAmount != "-1") 
    {
      this.nOrder = sAmount;
    }
    const sClientID = "AVOebDM3PGxME5DBlEMIblRucVbHdwQnP6VefjtcL4F3qGxSQmmB1wW7yyxXQGVqFeLeX4pj5LOZg0LO" || 'put your client id here for testing ... Make sure that you delete it before committing'
    return (`
      <!DOCTYPE html>
  
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1"> <!-- Ensures optimal rendering on mobile devices. -->
        <meta http-equiv="X-UA-Compatible" content="IE=edge" /> <!-- Optimal Internet Explorer compatibility -->
      </head>
      
      <body>
        <script src="https://code.jquery.com/jquery-3.5.1.min.js"></script>
        <script
          src="https://www.paypal.com/sdk/js?client-id=${sClientID}"> // Required. Replace SB_CLIENT_ID with your sandbox client ID.
        </script>
        Thank you ${this.sNumber} for your ${this.sItem} order of $${this.nOrder}.
        <div id="paypal-button-container"></div>
  
        <script>
          paypal.Buttons({
              createOrder: function(data, actions) {
                // This function sets up the details of the transaction, including the amount and line item details.
                return actions.order.create({
                  purchase_units: [{
                    amount: {
                      value: '${this.nOrder}'
                    }
                  }]
                });
              },
              onApprove: function(data, actions) {
                // This function captures the funds from the transaction.
                return actions.order.capture().then(function(details) {
                  // This function shows a transaction success message to your buyer.
                  $.post(".", details, ()=>{
                    window.open("", "_self");
                    window.close(); 
                  });
                });
              }
          
            }).render('#paypal-button-container');
          // This function displays Smart Payment Buttons on your web page.
        </script>
      
      </body>
          
      `);

  }
}