var socket;
const globalServerPort = 3001;

document.addEventListener('DOMContentLoaded', function () {
    socket = io.connect('http://localhost:3001'); //join the server, and at the same time send a message "connection"

    
    function generateTaskList(tasks){
        tasks.sort((a, b) => a.Order - b.Order);
        tasks.forEach(function (item) {
            var row = document.createElement('tr');
            row.className = 'draggable';
            row.draggable = true;
            row.id = 'draggableTask' + item.Id;
    
            var orderCell = document.createElement('td');
            orderCell.textContent = item.Order;
    
            var nameCell = document.createElement('td');
            nameCell.textContent = item.Name;
    
            var buttonGroup = document.createElement('div');
            buttonGroup.className = 'btn-group';
            buttonGroup.style.float = 'right';
    
            var updateButton = document.createElement('input');
            updateButton.type = 'button';
            updateButton.className = 'btn btn-primary';
            updateButton.value = 'Update';
            updateButton.addEventListener('click', function () {
                var formData = {
                    action: 'Edit',
                    submitButtonText: 'Update',
                    task: {
                        Order: item.Order, 
                        Name: item.Name, 
                        Id: item.Id 
                    }
                }
                console.log(formData);
                updateForm(formData);
            });
    
            var deleteButton = document.createElement('input');
            deleteButton.type = 'submit';
            deleteButton.className = 'btn btn-danger';
            deleteButton.value = 'Delete';
            deleteButton.addEventListener('click', function () {
                socket.emit('delete', {Id: item.Id});
            });
    
            buttonGroup.appendChild(updateButton);
            buttonGroup.appendChild(deleteButton);
    
            var actionCell = document.createElement('td');
            actionCell.appendChild(buttonGroup);
    
            row.appendChild(orderCell);
            row.appendChild(nameCell);
            row.appendChild(actionCell);
    
            document.querySelector('.task-list').appendChild(row);
        });
    }

    function generateForm(formConfig) {
        const form = document.createElement('form');
        form.className = 'form';
        form.style.width = '300px';
        form.style.margin = '0 auto';
        form.addEventListener('submit', function(event) {
            // event.preventDefault();
        
            if (formConfig.action === 'Create') {
                var taskName = nameInput.value;
                socket.emit('createTask', { Name: taskName });
            } else if (formConfig.action === 'Edit') {
                var task = {
                    Order: formConfig.task.Order,
                    Name: nameInput.value,
                    Id: formConfig.task.Id
                }
                console.log(task);
                socket.emit('editTask', task);
            }
        });
        
        
    
        const table = document.createElement('table');
        table.className = 'table';
    
        const tbody = document.createElement('tbody');
    
        const tr = document.createElement('tr');
    
        const nameCell = document.createElement('td');
    
        const nameInput = document.createElement('input');
        nameInput.name = 'Task.Name';
        nameInput.className = 'form-control';
        nameInput.value = formConfig.task ? formConfig.task.Name : '';

    
        const nameValidation = document.createElement('span');
        nameValidation.className = 'text-danger';
    
        nameCell.appendChild(nameInput);
        nameCell.appendChild(nameValidation);
    
        const submitCell = document.createElement('td');
    
        const submitButton = document.createElement('button');
        submitButton.type = 'submit';
        submitButton.className = 'btn btn-primary';
        submitButton.textContent = formConfig.submitButtonText;
    
        submitCell.appendChild(submitButton);
    
        tr.appendChild(nameCell);
        tr.appendChild(submitCell);
    
        tbody.appendChild(tr);
    
        table.appendChild(tbody);
    
        form.appendChild(table);
    
        document.querySelector('.taskFormContainer').appendChild(form);
    }

    // socket actions
    socket.on('connection', (tasks) => {
        updateTasks(tasks);
        var formData = {
            action: 'Create',
            submitButtonText: 'Create'
        }
        updateForm(formData);
    
    });


    socket.on('update', updateTasks);

    function updateTasks(tasks){
        var taskList = document.querySelector('.task-list');
        taskList.innerHTML = '';

        generateTaskList(tasks);
        
        // Creating an event to call DragNDrop.js
        var myEvent = new Event('FormIsReady');
        document.dispatchEvent(myEvent);
    }

    function updateForm(formData){
        var taskFormContainer = document.querySelector('.taskFormContainer');
        taskFormContainer.innerHTML = '';
        generateForm(formData);
        

    }
    
    
});
