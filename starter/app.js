// 눈에 안 보이는 부분 계산 하는 곳
// BUDGET CONTROLLER
var budgetController = (function () {
    // 지출
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // 수입
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            // console.log(cur) == Income {id: 0, description: "test", value: 3000}
            /*    description: "test"
                  id: 0
                  value: 3000 */
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    // 지출 || 수입 저장 후 총 예산
    var data = {
        allItems: {
            exp: [],
            inc: [],
        },
        totals: {
            exp: 0,
            inc: 0,
        },
        budget: 0,
        percentage: -1,
    };

    return {
        // 손익 구분 후 입력값 별로 return
        addItem: function (type, des, val) {
            var newItem, ID;

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        // 예산 총 합과 수익율 계산
        calculateBudget: function () {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that we spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round(
                    (data.totals.exp / data.totals.inc) * 100
                );
            } else {
                data.percentage = -1;
            }

            // Expense = 100, income = 200, spent = 50% = 100/200
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage,
            };
        },

        testing: function () {
            console.log(data);
        },
    };
})();

// 계산 한 값들 받아서 웹에 표시하기
// UI CONTOLLER
var UIController = (function () {
    // 손익 입력부분 && 지출과 수입 열
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
    };

    return {
        getInput: function () {
            return {
                // value : input 요소에서는 단순히 입력된 값을 얻지만
                // select요소에서는 option의 value값을 얻는다
                type: document.querySelector(DOMstrings.inputType).value, //  Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription)
                    .value,
                value: parseFloat(
                    document.querySelector(DOMstrings.inputValue).value
                ),
            };
        },

        // HTML 문자열 생성 with placeholder text
        addListItem: function (obj, type) {
            var html, newHtml, element;

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html =
                    '<div class="item clearfix" id="income-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html =
                    '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix">    <div class="item__value">%value%</div>   <div class="item__percentage">21%</div>    <div class="item__delete">        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>    </div></div></div>';
            }
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            // 변경값을 유지하면서 바꿯야 하기 때문에 newHtml.replace() 사용
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            // Insert the HTML into the DOM
            document
                .querySelector(element)
                .insertAdjacentHTML('beforeend', newHtml);
        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(
                DOMstrings.inputDescription + ', ' + DOMstrings.inputValue
            );

            // fields.slice() 지금은 이케가 안되는게 fields가 배열이 아니라 안 됨
            fieldsArr = Array.prototype.slice.call(fields);
            // 그래서 이케 배열생성자함수 써서 배멸로 만들면서 이케 해야 함

            fieldsArr.forEach(function (current, index, array) {
                current.value = '';
            });
            // Add description으로 초점 이동(DOMstrings.inputDescription칸);
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            document.querySelector(DOMstrings.budgetLabel).textContent =
                obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent =
                obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent =
                obj.totalExp;
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent =
                    obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent =
                    '---';
            }
        },

        getDomstrings: function () {
            return DOMstrings;
        },
    };
})();

// 사용자가 직접 사용하는 부분
// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
    var setupEventListeners = function () {
        var DOM = UICtrl.getDomstrings();

        document
            .querySelector(DOM.inputBtn)
            .addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
    };
    var updateBudget = function () {
        // 1. 예산 계산
        budgetCtrl.calculateBudget();

        // 2. return the budget
        var budget = budgetCtrl.getBudget();
        // 3. UI에 예산 표시
        UICtrl.displayBudget(budget);
    };

    var ctrlAddItem = function () {
        var input, newItem;

        // 1. 입력된 데이터 가져오기.
        input = UICtrl.getInput();

        if (
            input.description !== '' &&
            !isNaN(input.value) &&
            input.value > 0
        ) {
            // 2. 예산 관리자에 항목 추가
            newItem = budgetCtrl.addItem(
                input.type,
                input.description,
                input.value
            );
            // 3. UI에 항목 추가
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();
        }
    };

    return {
        init: function () {
            console.log('Application has started.');
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1,
            });
            setupEventListeners();
        },
    };
})(budgetController, UIController);

controller.init();
