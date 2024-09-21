document.addEventListener('FormIsReady', function () {
    const draggables = document.querySelectorAll('.draggable');
    const containers = document.querySelectorAll('.dragspace');
    console.log('FormIsReady');

    socket.on('dragstart', (data) => {
        var draggable = document.getElementById(data.draggableId);
        draggable.classList.add('dragging')
        console.log('dragstart');
    });

    socket.on('dragover', (data) => {
        var draggable = document.getElementById(data.draggableId);
        var container = document.getElementById(data.containerId);
        var afterElement = data.afterElementId !== null ? document.getElementById(data.afterElementId) : null;
        if (afterElement === null) {
            container.appendChild(draggable)
        } else {
            container.insertBefore(draggable, afterElement)
        }
        console.log('dragover');
    });

    socket.on('dragend', (data)=>{
        var draggable = document.getElementById(data.draggableId);
        draggable.classList.remove('dragging')
        console.log('dragend');
    });
    
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging')
            console.log('dragstart');
            socket.emit('dragstart', {draggableId: draggable.id});
        })
    })

    containers.forEach(container => {
        container.addEventListener('dragover', e => {
            e.preventDefault()
            const afterElement = getDragAfterElement(container, e.clientY)
            const draggable = document.querySelector('.dragging')
            if (afterElement == null) {
                container.appendChild(draggable)
            } else {
                container.insertBefore(draggable, afterElement)
            }
            console.log('dragover');
            var data = {
                draggableId: draggable.id, 
                afterElementId: afterElement != null? afterElement.id:null, 
                containerId: container.id
            }
            socket.emit('dragover', data);
            
        })
    
        container.addEventListener('dragend', e => {
            e.preventDefault();
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                const id = draggable.cells[0].innerText - 1;
                const position = getPositionInContainer(draggable, container);
                data = {
                    Order1: id, 
                    Order2: position,
                    draggableId: draggable.id
                }
                socket.emit('dragend', data);
                draggable.classList.remove('dragging')
                console.log('dragend');
            }
            //
        })
    })
});


function getPositionInContainer(element, container) {
    const items = [...container.querySelectorAll('.draggable')];
    return items.indexOf(element);
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.draggable:not(.dragging)')]

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect()
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child }
        } else {
            return closest
        }

    }, { offset: Number.NEGATIVE_INFINITY }).element
}