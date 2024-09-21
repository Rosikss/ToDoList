var express = require('express');
var app = express();


var rootServerPort = process.env.PORT || 3001;
var rootServer = app.listen(rootServerPort);

app.use(express.static('public'));
const cors = require('cors');
app.use(cors());


console.log("Global socket server is running on port " + rootServerPort);

var tasks = [
    { Order: 1, Name: "Task 1", Id: 1 },
    { Order: 2, Name: "Task 2", Id: 2 },
    { Order: 3, Name: "Task 3", Id: 3 }
];

var socket = require('socket.io');

var io = socket(rootServer);

io.sockets.on('connection', newConnection);

function newConnection(socket){
    console.log('New connection: ' + socket.id);
    socket.emit('connection', tasks);

    socket.on('createTask', createTask);
    function createTask(data) {
        console.log('Add task');
        var maxOrder = Math.max(...tasks.map(task => task.Order));
        
        var newTask = {
            Order: maxOrder + 1,
            Name: data.Name,
            Id: tasks.length + 1 
        };
        tasks.push(newTask);
        io.sockets.emit('update', tasks);
    }

    socket.on('editTask', editTask);
    function editTask(data){
        console.log('Edit task');
        tasks.sort((a, b) => a.Order - b.Order);
        const index = tasks.findIndex(task => task.Id === data.Id);

        if (index !== -1) {
            tasks[index] = data;
            io.sockets.emit('update', tasks);

        }
    }

    socket.on('delete', deleteTask);
    function deleteTask(data){
        console.log('Delete task');

        tasks.sort((a, b) => a.Order - b.Order);
        const index = tasks.findIndex(task => task.Id === data.Id);

        if (index >= 0 && index < tasks.length) {
            tasks.splice(index, 1);
            
            for (var i = index; i < tasks.length; i++) {
                tasks[i].Order = tasks[i].Order - 1;
            }
        }

        io.sockets.emit('update', tasks);
    }
    
    socket.on('dragstart', dragstart);
    function dragstart(data){
        socket.broadcast.emit('dragstart', data);
        console.log('dragstart');
    }

    socket.on('dragover', dragover);
    function dragover(data){
        socket.broadcast.emit('dragover', data);
        console.log('dragover');
        console.log(data);
    }

    socket.on('dragend', changeOrder);
    function changeOrder(data) {
        console.log('dragend');
        socket.broadcast.emit('dragend', {draggableId: data.draggableId});
        
        if (data.Order1 !== 0 || data.Order2 !== 0) {
            tasks.sort((a, b) => a.Order - b.Order);
        
            if (data.Order1 <= data.Order2) {
                for (let i = data.Order2; i > data.Order1; i--) {
                    tasks[i].Order = i;
                }
                tasks[data.Order1].Order = data.Order2 + 1;
            } else {
                tasks[data.Order1].Order = data.Order2 + 1;
                for (let i = data.Order2; i < data.Order1; i++) {
                    tasks[i].Order = i + 2;
                }
            }
            io.sockets.emit('update', tasks);
        }
        
    }
}
