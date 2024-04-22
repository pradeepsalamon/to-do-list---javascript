// programs
class taskData {
    constructor(id, task, status, createdDate, startTime, endTime, reminder) {
        this.id = id
        this.taskName = task
        this.status = status
        this.createdDate = createdDate
        this.startTime = startTime
        this.endTime = endTime
        this.reminder = reminder
    }
}
var taskCount = 0
var todayDate = new Date
var listData = []
const form = document.getElementById('addItemForm')
form.addEventListener('submit', handleSubmit)

function handleSubmit(event) {
    event.preventDefault()
    if (form.checkValidity()) {
        let task = document.getElementById("task").value
        let startTime = document.getElementById("startTime").value
        let endTime = document.getElementById("endTime").value
        let reminder = document.getElementById("reminder-input").checked
        let status = statusCheck(startTime, endTime)
        let newTask = new taskData(++taskCount, task, status, todayDate.toLocaleDateString(), startTime, endTime, reminder)
        listData.push(newTask)
        addNewList(listData[listData.length - 1])
        closeAddNewItemPopup()
        resetInputFields()
    }
}

function statusCheck(startTime, endTime) {
    let currentHour = todayDate.getHours();
    let currentMinute = todayDate.getMinutes();
    let currentTime = `${currentHour}:${currentMinute}`;
    if (currentTime < startTime) {
        return "pending"
    }
    else if (currentTime > endTime) {
        return "done"
    }
    else {
        return "ongoing"
    }
}

function resetInputFields() {
    var inputs = document.querySelectorAll("input")
    inputs.forEach(input => {
        input.value = ""
    })
}

function taskFinder(event) {
    var task = event.target.parentNode.parentNode.parentNode.childNodes
    let taskName = task[1].textContent.trim()
    for (let i = 0; i < listData.length; i++) {
        if (taskName == listData[i].taskName) {
            return i
        }
    }
}

function toggleReminder(event) {
    let taskPlace = taskFinder(event)
    if (listData[taskPlace].reminder == true) {
        listData[taskPlace].reminder = false
    }
    else {
        listData[taskPlace].reminder = true
    }
    bellAnimation(event, listData[taskPlace].reminder)
}

function edit(event) {
    let taskPlace = taskFinder(event)
    console.log(listData[taskPlace])
}

function findUpdates() {

}

function sort(){
    console.log(listData)
}


// fron-end 

function getNewList() {
    var popup = document.querySelectorAll(".popup,.popupAddNewItem")
    popup.forEach(pop => {
        pop.style.display = 'inline'
    })
}

function addNewList(Task) {
    let listContainer = document.querySelector(".list-container")
    let detils = `<div> ${Task.taskName} </div><div> ${Task.status} </div><div> ${Task.createdDate} </div>`
    if (Task.reminder == true) {
        var reminderIcon = `images/notification-bell.png`
    }
    else {
        reminderIcon = `images/off.png`
    }
    reminderIcon = `<div><img src=${reminderIcon} alt="remind" class="reminder"id="reminder"
                        onclick="toggleReminder(event)"><span>reminder</span></div>`

    listContainer.innerHTML += `<div class="list-items"> ${detils} <div> ${reminderIcon}
        <div><img src="images/edit.png" alt="edit" id="edit" onclick="edit(event)"><span>edit</span></div>
        <div><img src="images/delete.png" alt="delete" id="remove" onclick="remove(event)"><span>delete</span></div></div></div>`
}

function closeAddNewItemPopup() {
    var popup = document.querySelectorAll(".popup,.popupAddNewItem")
    popup.forEach(pop => {
        pop.style.display = 'none'
    })
}

function remove(event) {
    console.log(listData)
    event.target.parentNode.parentNode.parentNode.remove()
    let taskPlace = taskFinder(event)
    listData.splice(taskPlace, 1)
    console.log(listData)
}

function updateList(taskPlace, taskInfo, event) {
    let taskList = event.target.parentNode.parentNode.parentNode.children[0].textContent
}

// handle animations

function bellAnimation(event, reminderStatus) {
    if (event.target.src.includes("off")) {
        event.target.src = "images/notification-bell.png"
    }
    else {
        event.target.src = "images/off.png"
    }
    var bell = event.target
    bell.classList.add("animate")
    bell.addEventListener("animationend", function () {
        bell.classList.remove("animate")
    })
}