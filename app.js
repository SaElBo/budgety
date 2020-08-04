////////////////////////  BUDGET CONTROLLER  ///////////////////////////////
const budgetController = (function () {

        
    class BudgetItem {
        constructor(id, description, value) {
            this.id = id;
            this.description = description;
            this.value = value;
        }


    };

    class Expense extends BudgetItem {
        constructor(id, description, value) {
            super(id, description, value);

            this.type = 'exp'
            this.percentage = -1;
        }

        calcPercentage (totalIncome){
            if (totalIncome > 0) {
                this.percentage = Math.round((this.value / totalIncome) * 100);
                } else {
                this.percentage = -1;
                }
        }

        getPercentage (){

            return this.percentage;
            };
    };

       

        

    class Income extends BudgetItem {
        constructor(id, description, value) {
            super(id, description, value);

            this.type = 'inc'
        }
    };

    const calculateTotal = function (type) {

        let sum = 0;
        data.allItems[type].forEach((val) => sum += val.value);
        data.totals[type] = sum;


    };

    //data stucture

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1,
    };

    //public metods

    return {
        addItem: function (type, des, val) {
            let newItem, id;
            let arrItem = data.allItems[type] // exp[] || inc[]


            // if the array is empty the id is 0 else is the id of the last element +1
            arrItem.length > 0 ? id = arrItem[arrItem.length - 1].id + 1 : id = 0



            // Create a new Item object based on the type the user selected
            type === 'inc' ? newItem = new Income(id, des, val)
                : newItem = new Expense(id, des, val);

            //inserting the newItem in the appropiate array
            arrItem.push(newItem);

            return newItem;
        },

        deleteItem: function (type, id) {

            id = parseInt(id);
            const arr = data.allItems[type];

            const ids = arr.map(el => el.id);
            const index = ids.indexOf(id);

            if (index !== -10) {
                arr.splice(index, 1);
            }


        },

        calculateBudget: function () {

            //1. sum of all income  and expenses
            calculateTotal('inc');
            calculateTotal('exp');

            // 2. calculate budget : income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //3. calculate the percentage

            data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
        },

        calculatePercentages: function() {
            
            
            data.allItems.exp.forEach((cur) =>
               cur.calcPercentage(data.totals.inc)
            );
        },
        
        
        
        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        //testing function
        testing: function () {
            console.log(data);

        }
    }

})();



///////////////////////////// UI CONTROLLER //////////////////////////////////


const UIController = (function () {

    const DomStrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        btn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    };





    //Public Function
    return {
        getInput: function () {
            const type = document.querySelector(DomStrings.inputType).value; // inc or exp
            const description = document.querySelector(DomStrings.inputDescription).value;
            const value = parseFloat(document.querySelector(DomStrings.inputValue).value); // it will return a strimg but we parse it into a float number

            return {
                type: type,
                description: description,
                value: value
            };
        },

        addListItem: function (obj, type) {


            // html string

            //Based on the type we decide what the html will be
            let htmlSting = type === 'inc' ?
                `<div class="item clearfix" id="inc-${obj.id}">
                    <div class="item__description">${obj.description}</div>
                    <div class="right clearfix">
                        <div class="item__value">${obj.value}</div>
                        <div class="item__delete">
                            <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                        </div>
                    </div>
                </div>`
                :
                `<div class="item clearfix" id="exp-${obj.id}">
                    <div class="item__description">${obj.description}</div>
                        <div class="right clearfix">
                         <div class="item__value">- ${obj.value}</div>
                        <div class="item__percentage">${obj.percentage}</div>
                        <div class="item__delete">
                        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>
                    </div>
                     </div>
                </div>`


            //insert html into the dom
            // based on the type we insert the html list in the expense or in the income container
            const expenses = document.querySelector(DomStrings.expensesContainer);
            const income = document.querySelector(DomStrings.incomeContainer);

            type === 'inc' ?
                income.insertAdjacentHTML('beforeend', htmlSting)
                : expenses.insertAdjacentHTML('beforeend', htmlSting);


        },

        deleteListItem: function (element) {
            element.parentNode.removeChild(element);
        },

        clearFiel: function () {
            const fields = document.querySelectorAll(DomStrings.inputDescription + ',' + DomStrings.inputValue);
            /*↑ this will return a nodeList not an array but we can use the forEach method
             PS: not all browser support it so the optimal solution for compatibility is
                  Array.prototype.forEach() vedi doc MDN su NodeList*/

            fields.forEach((val) => {
                val.value = '';
            })

            fields[0].focus();

        },

        displayBudget: function (obj) {
            document.querySelector(DomStrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DomStrings.expensesLabel).textContent = obj.totalExp;
            document.querySelector(DomStrings.incomeLabel).textContent = obj.totalInc;

            if (obj.percentage > 0) {
                document.querySelector(DomStrings.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DomStrings.percentageLabel).textContent = '---';

            }

        },

        getDom: function () {
            return DomStrings;
        }
    };
})();


//////////////////////////////// APP CONTROLLER ///////////////////////////////

const controller = (function (budgetCtrl, UICtrl) {

    const setUpEventListners = function () {

        const DOM = UICtrl.getDom();

        // ADD ITEM IF BTN IS PRESSED
        let addBtn = document.querySelector(DOM.btn);
        addBtn.addEventListener('click', ctrlAddItem);

        // ADD ITEM IF ENTER IS PRESSED
        document.addEventListener('keypress', (key) => {
            if (key.keyCode === 13 || key.which === 13) { // 13 = Enter keycode
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
    };

    const updateBudget = function () {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();
        // 2. return the budget
        const budget = budgetCtrl.getBudget();
        // 3.display the budget on the UI
        UICtrl.displayBudget(budget);
    };

     const updatePercentages = function() {
        
        // 1. Calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update the UI with the new percentages
        // UICtrl.displayPercentages(percentages);
        console.log(percentages)
    };



    const ctrlAddItem = () => {
        // 1. GET INPUT 
        const input = UICtrl.getInput();

        //↓ Input validation
        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. ADD ITEM TO BUDGET 
            const newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3.ADD ITEM TO UI
            UICtrl.addListItem(newItem, input.type);

            // 4. CLEAR THE FIELD FOR BETTER UX
            UICtrl.clearFiel();


            // 5.  CALCULATE AND UPDATE BUDGET
            updateBudget();

            updatePercentages();

        }



        console.log('yey')
    }

    const ctrlDeleteItem = function (event) {

        /*path is an array in the event object, it starts whith 
        the clicked item and it arrives to the windows trought event bubbling.

        let elementContainer = event.path[4] NON SUPPORTATO SU FIREFOX :(
        */
      
       
        let elementContainer = event.target.parentNode.parentNode.parentNode.parentNode;

        /* we take the id of the element and split it in two
            ex: inc-0 => ['inc','0'] 
            the first element is the type the second the id 
        */
        const type = elementContainer.id.split('-')[0];
        const id = elementContainer.id.split('-')[1];

        if (id) {

            //  DELETE THE ITEM FROM THE DATA STRUCTURE
            budgetCtrl.deleteItem(type, id);

            // DELETE THE ITEM FROM THE UI
            UICtrl.deleteListItem(elementContainer);

            //UPDATE THE BUDGET WITH THE NEW DATA
            updateBudget();

            
        }

    };

    return {
        init: function () {
            console.log('App Started');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });

            setUpEventListners();
        }
    };



})(budgetController, UIController);


controller.init();


