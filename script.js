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
const listHead = `<div class="list-head list-items">
                        <div>Task</div>
                        <div>Status</div>
                        <div>Created Date</div>
                        <div>Actions</div>
                    </div>`
var listData = []
var selectedList = []
var sortedList = []
var selectedMode = 0
var isSortMode = 0
var sortStatus = 'Ascending'
var selectAllStatus = 0
var taskPlace = 0
var temp
var pendingTasks = []
const form = document.getElementById('addItemForm')
form.addEventListener('submit', handleSubmit)

//  adding new list
function handleSubmit(event) {
    event.preventDefault()
    var conflict = false
    if (form.checkValidity()) {
        let task = document.getElementById("task").value
        var i = 0
        listData.forEach((list) => {
            if (list.taskName == task) {
                if (document.getElementById("submit").textContent != "save" || i != taskPlace) {
                    alert("Task name already exists !")
                    conflict = true
                }
            }
            ++i
        })
        if (conflict) {
            return
        }
        let startTime = document.getElementById("startTime").value
        let endTime = document.getElementById("endTime").value
        if (startTime == endTime){
            alert("Invalid Time !")
            return
        }
        let reminder = document.getElementById("reminder-input").checked
        let status = statusCheck(startTime, endTime)
        if (document.getElementById("submit").textContent == "Add") {
            let newTask = new taskData(++taskCount, task, status, todayDate.toLocaleDateString(), startTime, endTime, reminder)
            listData.push(newTask)
            addNewList(listData[listData.length - 1])
        }
        else {
            temp = listData[taskPlace]
            temp.taskName = task
            temp.startTime = startTime
            temp.endTime = endTime
            temp.reminder = reminder
            temp.status = statusCheck(startTime, endTime)
            updateList(listData)
        }
        closeAddNewItemPopup()
    }
}

// findind the status of task
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
        input.checked = false
    })

}

// finding list ,return the id

function taskFinder(event) {
    var task = event.target.parentNode.parentNode.parentNode.childNodes
    let taskName = task[1].textContent.trim()
    for (let i = 0; i < listData.length; i++) {
        if (taskName == listData[i].taskName) {
            return i
        }
    }
}

// edit list's reminder
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


// edit list
function edit(event) {
    taskPlace = taskFinder(event)
    document.getElementById("submit").textContent = "save"
    getNewList(listData[taskPlace])
}

// select mode

function selectMode() {
    if (selectedMode == 0) {
        if (listData.length <= 1) {
            alert("Add atleast 2 tasks to select")
            return
        }
        togggleOpacity()
        document.querySelector(".navbar").style.display = "none"
        document.querySelector(".navbar-selectMode").style.display = "flex"
        document.querySelector(".navbar-selectMode").children[0].style.backgroundColor = "rgba(134, 7, 188, 0.977)"
        document.querySelector(".navbar-selectMode").children[0].style.color = "white"
        document.querySelector(".list-head").children[3].textContent = "Select"
        document.querySelectorAll(".actions").forEach((action) => {
            action.style.display = "none"
        })
        document.querySelectorAll("#select").forEach((select) => {
            select.style.display = "inline"
        })
        selectedMode = 1
    }
    else {
        document.querySelector(".navbar").style.display = "flex"
        document.querySelector(".navbar-selectMode").style.display = "none"
        document.querySelector(".list-head").children[3].textContent = "Actions"
        document.querySelectorAll(".actions").forEach((action) => {
            action.style.display = "inline"
        })
        document.querySelectorAll("#select").forEach((select) => {
            select.style.display = "none"
        })
        selectedMode = 0
    }
    document.querySelectorAll(".lists").forEach((a) => { a.classList.remove("selected") })
    document.querySelectorAll("#select").forEach((a) => {
        a.checked = false
    })
    selectedList = []
    document.querySelector(".navbar-selectMode").children[1].textContent = "SelectAll"
}

function togggleOpacity() {
    let label1 = [...document.querySelector(".navbar-selectMode").children]
    if (selectedList.length == 0) {
        label1.slice(2, 4).forEach((label) => {
            label.style.opacity = "40%"
            label.classList.add("not-allowed")
        })
    }
    else {
        label1.forEach((label) => {
            label.style.opacity = "100%"
            label.classList.remove("not-allowed")
        })
    }
}

function selectList(event) {
    if (selectedList.length == 0) {
        document.querySelector(".navbar-selectMode").children[2].style.opacity = "50%"
        document.querySelector(".navbar-selectMode").children[3].style.opacity = "50%"
    }
    let taskPlace = taskFinder(event)
    if (selectedList.includes(listData[taskPlace].taskName)) {
        selectedList.splice(selectedList.indexOf(listData[taskPlace].taskName), 1)
        event.target.parentNode.parentNode.parentNode.classList.remove("selected")
    }
    else {
        selectedList.push(listData[taskPlace].taskName)
        event.target.parentNode.parentNode.parentNode.classList.add("selected")
    }
    if (selectedList.length == 0) {
        document.querySelector(".navbar-selectMode").children[1].textContent = "SelectAll"
        selectAllStatus = 0
    }
    else if (selectedList.length == listData.length) {
        document.querySelector(".navbar-selectMode").children[1].textContent = "UnSelectAll"
        selectAllStatus = 1
    }
    togggleOpacity()
}

function selectAll() {
    document.querySelectorAll(".lists").forEach((a) => { a.classList.remove("selected") })
    if (selectAllStatus == 0 || selectedList.length == 0) {
        document.querySelector(".navbar-selectMode").children[1].textContent = "UnSelectAll"
        document.querySelectorAll(".lists").forEach((a) => { a.classList.add("selected") })
        document.querySelectorAll("#select").forEach((a) => {
            a.checked = true
        })
        listData.forEach((list) => { selectedList.push(list.taskName) })
        selectAllStatus = 1
    }
    else {
        document.querySelectorAll(".lists").forEach((a) => { a.classList.remove("selected") })
        document.querySelectorAll("#select").forEach((a) => {
            a.checked = false
        })
        document.querySelector(".navbar-selectMode").children[1].textContent = "SelectAll"
        selectAllStatus = 0
        selectedList = []
    }
    togggleOpacity()
}

function turnOnReminder() {
    if (selectedList.length == 0) {
        alert("Select items to turn on reminder")
        return
    }
    selectedList.forEach((list) => {
        for (let i = 0; i < listData.length; i++) {
            if (listData[i].taskName == list) {
                listData[i].reminder = true
            }
        }
    })
    updateList(listData)
    selectMode()
}

function deleteSelected() {
    if (selectedList.length == 0) {
        alert("Select items to delete")
        return
    }
    selectedList.forEach((list) => {
        for (let i = 0; i < listData.length; i++) {
            if (listData[i].taskName == list) {
                listData.splice(i, 1)
            }
        }
    })
    updateList(listData)
    selectMode()
}

// updating the list

function updateList(taskData) {
    document.querySelectorAll(".list-container").forEach((list) => { list.innerHTML = listHead })
    taskData.forEach((Task) => {
        let listContainer = document.querySelector(".list-container")
        let detils = `<div> ${Task.taskName} </div><div> ${Task.status} </div><div> ${Task.createdDate} </div>`
        if (Task.reminder == true) {
            var reminderIcon = `images/notification-bell.png`
        }
        else {
            reminderIcon = `images/off.png`
        }
        reminderIcon = `<div class="actions"><img src=${reminderIcon} alt="remind" class="reminder"id="reminder"
                        onclick="toggleReminder(event)"><span>reminder</span></div>`

        listContainer.innerHTML += `<div class="list-items lists"> ${detils} <div> ${reminderIcon}
        <div class="actions"><img src="images/edit.png" alt="edit" id="editscript.j" onclick="edit(event)"><span>edit</span></div>
        <div class="actions"><img src="images/delete.png" alt="delete" id="remove" onclick="remove(event)"><span>delete</span></div>
        <div><input type="checkbox" id="select" onclick="selectList(event)"></div></div></div>`
    })
}

// sort mode

function sortMode() {
    if (!isSortMode) {
        document.querySelector(".navbar").style.display = "none"
        document.querySelector(".navbar-sortMode").style.display = "flex"
        document.querySelector(".navbar-sortMode").children[0].style.backgroundColor = "rgba(134, 7, 188, 0.977)"
        document.querySelector(".navbar-sortMode").children[0].style.color = "white"
        isSortMode = 1
    }
    else {
        document.querySelector(".navbar").style.display = "flex"
        document.querySelector(".navbar-sortMode").style.display = "none"
        isSortMode = 0
    }
    document.getElementById("sort").value = 'none'
}

function sortBy(value) {
    sortedList = []
    if (value == 'none') {
        return
    }
    else if (value == 'taskName') {
        listData.forEach((list) => sortedList.push(list.taskName))
    }
    else if (value == 'status') {
        listData.forEach((list) => sortedList.push(list.status))
    }
    else if (value == 'reminder') {
        listData.forEach((list) => sortedList.push(list.reminder))
    }

    if (sortStatus == 'Ascending') {
        sortedList = sortedList.sort()
    }
    else {
        sortedList = sortedList.sort().reverse()
    }
    if (value == 'status') {
        sortedList = sortedList.sort()
    }
    let tempData = [...listData]
    var sortedData = []
    sortedList.forEach((list) => {
        for (let i = 0; i < tempData.length; i++) {
            if (Object.values(tempData[i]).includes(list)) {
                sortedData.push(tempData[i])
                tempData.splice(i, 1)
                return
            }
        }
    })
    updateList(sortedData)
    sortMode()
}

function toggleSort(event) {
    let label = event.target
    if (label.textContent == 'Ascending') {
        label.textContent = 'Descending'
    }
    else {
        label.textContent = 'Ascending'
    }
    sortStatus = label.textContent
}

// alerts



// fron-end 

function getNewList(list) {
    if (list == undefined) {
        let popup = document.querySelectorAll(".popup,.popupAddNewItem")
        popup.forEach(pop => {
            pop.style.display = 'inline'
        })
    }
    else {
        document.getElementById("task").value = list.taskName
        document.getElementById("startTime").value = list.startTime
        document.getElementById("endTime").value = list.endTime
        document.getElementById("reminder-input").checked = list.reminder
        let popup = document.querySelectorAll(".popup,.popupAddNewItem")
        popup.forEach(pop => {
            pop.style.display = 'inline'
        })
    }
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
    reminderIcon = `<div class="actions"><img src=${reminderIcon} alt="remind" class="reminder"id="reminder"
                        onclick="toggleReminder(event)"><span>reminder</span></div>`

    listContainer.innerHTML += `<div class="list-items lists"> ${detils} <div> ${reminderIcon}
        <div class="actions"><img src="images/edit.png" alt="edit" id="edit" onclick="edit(event)"><span>edit</span></div>
        <div class="actions"><img src="images/delete.png" alt="delete" id="remove" onclick="remove(event)"><span>delete</span></div>
        <div><input type="checkbox" id="select" onclick="selectList(event)"></div></div></div>`
}

function closeAddNewItemPopup() {
    var popup = document.querySelectorAll(".popup,.popupAddNewItem")
    popup.forEach(pop => {
        pop.style.display = 'none'
    })
    document.getElementById("submit").textContent = "Add"
    resetInputFields()
}

function remove(event) {
    event.target.parentNode.parentNode.parentNode.remove()
    let taskPlace = taskFinder(event)
    listData.splice(taskPlace, 1)
}


// handle animations

function bellAnimation(event) {
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
