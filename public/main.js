document.addEventListener('DOMContentLoaded', () => {
    const display = $("#display");
    const form = $("#form");
    const todoUserInput = $("#todoUserInput");
    const message = $("#message");
    message.hide();

    //Get todo list and displays it
    const getTodos = () => {
        fetch("/getTodos", {method: "get"})
        .then((response) => {
            return response.json();
        }).then((data) => {
            displayTodos(data);
        });
    }

    //Displays message to the user
    const displayMessage = (flag, msg) => {
        //Successful
        if(flag) {
            message.removeClass('alert-danger');
            message.addClass('alert-success');
            message.html(msg);
            message.show();
            setTimeout(() => { message.hide(); }, 3000);
        }
        //Error
        else {
            message.removeClass('alert-success');
            message.addClass('alert-danger');
            message.html(msg);
            message.show();
            setTimeout(() => { message.hide(); }, 3000);
        }
    }

   getTodos();

    //Reset the input box
    const resetTodosInput = () => {
        todoUserInput.val("");
    }

    //Build unique id for todo
    const buildIDS = (todo) => {
        return {
            editID: "edit_" + todo._id,
            deleteID: "delete_" + todo._id,
            listItemID: "listItem_" + todo._id,
            todoID: "todo_" + todo._id,
            checkboxID: "checkbox_" + todo._id,
            lineThroughID: "lineThrough_" + todo._id
        }
    }

    //Build template for list item
    const buildTemplate = (todo, ids) => {
        return `
        <li class="list-group-item" id="${ids.listItemID}"> 
                <div class="row">
                <div class="col-8">
                    <input class="form-check-input" type="checkbox" id="${ids.checkboxID}">
                    <label class="form-check-label" for="${ids.checkboxID}">
                        <div id="${ids.lineThroughID}"><div id="${ids.todoID}">${todo.todo}</div></div>
                    </label> 
                </div>
                    <div class="col-4">
                    <div class="text-right">
                        <button type="button" class="btn btn-secondary" id="${ids.editID}">Edit</button>
                        <button type="button" class="btn btn-danger" id="${ids.deleteID}">Delete</button>
                    </div>
                    </div>
                </div>
                </li>`
    }

    //Displays todo list
    const displayTodos = (data) => {
        data.forEach((todo) => {
            let ids = buildIDS(todo);
            display.append(buildTemplate(todo, ids));
            isCheck(ids.checkboxID, ids.lineThroughID);
            editTodo(todo, ids.todoID, ids.editID);
            deleteTodo(todo, ids.listItemID, ids.deleteID);
        });
    }

    //listens for checkbox event
    isCheck = (checkID, lineThroughID) => {
        let check = $(`#${checkID}`);
        check.click(() => {
            //check
            if (check.is(":checked")) {
               $('#' + lineThroughID).addClass("lineThrough");
            }
            //uncheck
            else {
                $('#' + lineThroughID).removeClass("lineThrough");
            }
        });
    }

    //Create a new todo
    form.submit((e) => { 
        e.preventDefault();
        fetch('/', {
            method: "post",
            body: JSON.stringify({todo: todoUserInput.val()}),
            headers: {
                "Content-Type": "application/json; charset=utf-8",
            }
        }).then((response) => {
            return response.json();
        }).then((data) => {
            if(!data.error) {
                if(data.result.ok === 1 && data.result.n === 1) { //Successful
                    let ids = buildIDS(data.document);
                    display.append(buildTemplate(data.document, ids));
                    isCheck(ids.checkboxID, ids.lineThroughID);
                    editTodo(data.document, ids.todoID, ids.editID);
                    deleteTodo(data.document, ids.listItemID, ids.deleteID);
                    displayMessage(true, data.msg)
                }
            }
            else  {  
                displayMessage(false, data.error.message)
            }
            resetTodosInput();
        });
});

    //Edit todo
    const editTodo = (todo, todoID, editID) => {
        let editBtn = $(`#${editID}`);
        editBtn.click(() => {
            fetch(`/${todo._id}`, {
                method: "put",
                body: JSON.stringify({todo: todoUserInput.val()}),
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                }
            }).then((response) => {
                return response.json();
            }).then((data) => {
                if(!data.error) {
                    if(data.result.ok === 1) { //Successful
                        let todoIndex = $(`#${todoID}`);
                        todoIndex.html(data.result.value.todo);
                        displayMessage(true, data.msg)
                    }
                }
                else {
                    displayMessage(false, data.error.message)
                }
                resetTodosInput();
            });
        });
}

    //Delete todo
    const deleteTodo = (todo, listItemID, deleteID) => {
        let deleteBtn = $(`#${deleteID}`);
        deleteBtn.click(() => {
            fetch(`/${todo._id}`, {
                method: "delete"
            }).then((response) => {
                return response.json();
            }).then((data) => {
                if(!data.error) {
                    if(data.result.ok === 1) { //Successful
                        $(`#${listItemID}`).remove();
                        displayMessage(true, data.msg)
                    }
                }
                else {
                    displayMessage(false, data.error.message)
                }
            });
        });
    }
});