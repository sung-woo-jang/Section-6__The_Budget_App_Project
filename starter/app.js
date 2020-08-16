// BUDGET CONTROLLER
var budgetController = (function () {
    // Some code
})();

// UI CONTOLLER
var UIController = (function () {
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
    };

    return {
        getInput: function () {
            return {
                // value : input 요소에서는 단순히 입력된 값을 얻지만
                // select요소에서는 option의 value값을 얻는다
                type: document.querySelector(DOMstrings.inputType).value, //비용 지출에 대한 지출 또는 지출이 있을 것이다.???
                description: document.querySelector(DOMstrings.inputDescription)
                    .value,
                value: document.querySelector(DOMstrings.inputValue).value,
            };
        },
        getDomstrings: function () {
            return DOMstrings;
        },
    };
})();

// GLOBAL APP CONTROLLER
var controller = (function (budgetCtrl, UICtrl) {
    var DOM = UICtrl.getDomstrings();

    var ctrlAddItem = function () {
        // 1. 입력된 데이터 가져오기
        var input = UICtrl.getInput();
        console.log(input);
        // 2. 예산 관리자에 항목 추가
        // 3. UI에 항목 추가
        // 4. 예산 계산
        // 5. UI에 예산 표시
    };

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

    document.addEventListener('keypress', function (event) {
        if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();
        }
    });
})(budgetController, UIController);
