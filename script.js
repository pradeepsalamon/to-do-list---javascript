// programs
console.log(document.referrer,111)
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
var isRunning = false
var pendingTasks = []
var ongoingTasks = []
var interval_id = 0
const form = document.getElementById('addItemForm')
form.addEventListener('submit', handleSubmit)
let storedData = JSON.parse(localStorage.getItem('taskData')) || []
if (storedData.length > 0) {
    storedData.forEach(data => {
        data.status = statusCheck(data.startTime, data.endTime)
    })
    listData = storedData
    updateList(listData)
    starter()
}
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
                    message("Task name already exists !")
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
        if (startTime == endTime) {
            message("Invalid Time !")
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
    starter()
}
// message box
function message(m) {
    document.getElementById('message').textContent = m
    document.querySelector('.message-container').style.display = 'block'
    document.querySelector('.popup2').style.display = 'block'
}

function closeMessage() {
    document.querySelector('.message-container').style.display = 'none'
    document.querySelector('.popup2').style.display = 'none'
}

// update data to session
function updateToStorage() {
    localStorage.setItem('taskData', JSON.stringify(listData))
}

// Function to be called when an object property changes
function onObjectChange(object, propertyName, newValue) {
    updateToStorage()
    console.log(`Property '${propertyName}' of object with id ${object.id} changed to: ${newValue}`);
    // Perform any specific action based on the property change
}

// Function to be called when the array changes
function onArrayChange(newArray) {
    updateToStorage()
    console.log('Array of objects has changed:', newArray);
    // Perform any action based on the array change
}

// Helper function to create a proxy for an object
function createObjectProxy(obj) {
    return new Proxy(obj, {
        set(target, property, value) {
            target[property] = value;
            onObjectChange(target, property, value); // Call the function when object property changes
            return true;
        }
    });
}

// Create proxies for all objects in the array
listData = listData.map(createObjectProxy);

// Create a proxy for the array of objects
listData = new Proxy(listData, {
    set(target, key, value) {
        // If setting an object, wrap it in a proxy
        if (typeof value === 'object' && value !== null) {
            value = createObjectProxy(value);
        }

        target[key] = value;

        // Call the function when the array changes
        onArrayChange([...target]); // Use spread operator to clone array
        return true;
    }
});


// findind the status of task
function statusCheck(startTime, endTime) {
    todayDate = new Date
    let currentHour = String(todayDate.getHours()).padStart(2, '0')
    let currentMinute = String(todayDate.getMinutes()).padStart(2, '0')
    let currentTime = `${currentHour}:${currentMinute}`
    if (currentTime < startTime) {
        return "pending"
    }
    else if (currentTime == endTime || currentTime > endTime) {
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
        starter()
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
            message("Add atleast 2 tasks to select")
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
        message("Select items to turn on reminder")
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
        message("Select items to delete")
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
    if (listData.length <= 1) {
        message("Add atleast 2 tasks to sort")
        return
    }
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

// messages

function starter() {
    if ((listData.length == 1) || (interval_id == 0 && listData.length > 0)) {
        filterPendingTasks()
        filterOngoingTasks()
        interval_id = setInterval(statusUpdater, 1000)
    }
}

function filterPendingTasks() {
    pendingTasks = []
    listData.forEach((task) => {
        if (task.status == "pending") {
            pendingTasks.push(task)
        }
    })
    console.log("----------------------")
    pendingTasks.forEach((task) => {
        console.log(task.taskName)
    })
}

function filterOngoingTasks() {
    ongoingTasks = []
    listData.forEach((task) => {
        if (task.status == "ongoing") {
            ongoingTasks.push(task)
        }
    })
}


function statusUpdater() {
    if (pendingTasks.length == 0 && ongoingTasks.length == 0) {
        console.log("no pending")
        clearInterval(interval_id)
        interval_id = 0
    }
    pendingTasks.forEach(task => {
        let status = statusCheck(task.startTime, task.endTime)
        if (status == 'ongoing') {
            task.status = 'ongoing'
            listData.forEach(item => {
                if (task.taskName == item.taskName) {
                    item.status = 'ongoing'
                    updateList(listData)
                }
            })
            task.reminder == true ? message(task.taskName + 'is started') : null
        }
    })
    ongoingTasks.forEach(task => {
        let status = statusCheck(task.startTime, task.endTime)
        if (status == 'done') {
            task.status = 'done'
            listData.forEach(item => {
                if (task.taskName == item.taskName) {
                    item.status = 'done'
                    item.reminder = false
                    updateList(listData)
                }
            })
        }
    })
    filterPendingTasks()
    filterOngoingTasks()
    console.log("checking")
}

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

// change screen to landscape in mobile
function enterFullscreenAndLockOrientation() {
    const docEl = document.documentElement;

    // Enter fullscreen mode
    if (docEl.requestFullscreen) {
        docEl.requestFullscreen();
    } else if (docEl.mozRequestFullScreen) { // Firefox
        docEl.mozRequestFullScreen();
    } else if (docEl.webkitRequestFullscreen) { // Chrome, Safari, and Opera
        docEl.webkitRequestFullscreen();
    } else if (docEl.msRequestFullscreen) { // IE/Edge
        docEl.msRequestFullscreen();
    }
    // Lock orientation once in fullscreen mode
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape')
                setTimeout(() => { screen.orientation.lock('any') }, 10000)
            }
        }
    })
}

function checkScreen() {
    const screenWidth = window.screen.width
    if (screenWidth < 700) {
        document.querySelector('section').style.display = 'none'
        document.querySelector('.confirm').style.display = 'block'
        document.getElementById('allow').addEventListener('click', () => {
            enterFullscreenAndLockOrientation()
            document.querySelector('section').style.display = 'block'
            document.querySelector('.confirm').style.display = 'none'
        })
    }
}
checkScreen()

screen.orientation.addEventListener('change', function () {
    if (screen.orientation.type.startsWith('portrait')) {
        checkScreen()
    }
})
