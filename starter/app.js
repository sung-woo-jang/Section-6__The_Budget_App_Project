// 눈에 안 보이는 부분 계산 하는 곳
// BUDGET CONTROLLER
var budgetController = (function () {
    // 지출
    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
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

        deleteItem: function (type, id) {
            var ids, index;

            // id = 3
            // data.allItems[type][id];
            // ids = [1, 2, 4, 6, 8];
            // index = 3;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
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

        calculatePercentages: function () {
            /* 
            a=20
            b=10
            c=40
            income = 100
            a= 20/100 = 20%
            b= 10/100 = 10%
            c= 40/100 = 40%
            */
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },

        getPercentages: function () {
            // map은 forEach와 다르게 무언가를 반환하기에 변수에 저장 가능
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
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
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };

    var formatNumber = function (num, type) {
        var numSplit, int, dec, type;
        /* 
        + 또는 - 숫자 이전
        소수점 정확히 2개
        천 단위로 컴마
        2310.4567 -> + 2,310.46
        2000 -> + 2,000.00
         */

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];

        if (int.length > 3) {
            int =
                int.substr(0, int.length - 3) +
                ',' +
                int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
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
                    '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html =
                    '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix">    <div class="item__value">%value%</div>   <div class="item__percentage">21%</div>    <div class="item__delete">        <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>    </div></div></div>';
            }
            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            // 변경값을 유지하면서 바꿔야 하기 때문에 newHtml.replace() 사용
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // Insert the HTML into the DOM
            document
                .querySelector(element)
                .insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
            // 단순히 그 항목을 삭제 할 순 없어서 부모로 가서 자식요소 제가하는 방식으로 해야 함
            el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldsArr;

            // querySelectorAll = 배열이 아닌 list를 반환(?)
            fields = document.querySelectorAll(
                DOMstrings.inputDescription + ', ' + DOMstrings.inputValue
            );

            // fields.slice() 지금은 이케가 안되는게 fields가 배열이 list라서 안 됨
            // list를 배열로 만드는 트릭
            fieldsArr = Array.prototype.slice.call(fields);
            // 그래서 이케 배열생성자함수 써서 배멸로 만들면서 이케 해야 함
            // console.log(fieldsArr);  (2) [input.add__description, input.add__value]

            fieldsArr.forEach(function (current, index, array) {
                current.value = '';
                // current = <input type="text" class="add__description" placeholder="Add description">, <input type="number" class="add__value" placeholder="Value">
                //
            });
            // Add description으로 초점 이동(DOMstrings.inputDescription칸);
            fieldsArr[0].focus();
        },

        displayBudget: function (obj) {
            var type;

            obj.budget > 0 ? (type = 'inc') : (type = 'exp');

            document.querySelector(
                DOMstrings.budgetLabel
            ).textContent = formatNumber(obj.budget, type);

            document.querySelector(
                DOMstrings.incomeLabel
            ).textContent = formatNumber(obj.totalInc, 'inc');

            document.querySelector(
                DOMstrings.expensesLabel
            ).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent =
                    obj.percentage + '%';
            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent =
                    '---';
            }
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(
                DOMstrings.expensesPercLabel
            );

            var nodeListForEach = function (list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },

        displayMonth: function () {
            var now, year, month, day;
            now = new Date();

            month = now.getMonth() + 1;

            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent =
                month + ' / ' + year;
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

        document
            .querySelector(DOM.container)
            .addEventListener('click', ctrlDeleteItem);
    };

    var updateBudget = function () {
        // 1. 예산 계산
        budgetCtrl.calculateBudget();

        // 2. return the budget
        var budget = budgetCtrl.getBudget();
        // 3. UI에 예산 표시
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function () {
        // 1. 백분율 계산
        budgetCtrl.calculatePercentages();

        // 2. Read percentages from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. UI업뎃 new percentages
        UICtrl.displayPercentages(percentages);
    };

    // cilck keypress
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

            // 4. 입력 한 값들 지우기
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update percentages
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. updata and show the new budget
            updateBudget();

            // 4. Calculate and update percentages
            updatePercentages();
        }
    };

    return {
        init: function () {
            console.log('Application has started.');
            UICtrl.displayMonth();
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
