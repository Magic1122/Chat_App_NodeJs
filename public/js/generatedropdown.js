const fetchRooms = () => {
    let rooms = []

    fetch('/rooms')
        .then((response) => {
            return response.json()
        })
        .then((rooms) => {
            if (rooms.length !== 0) {
                const hiddenElements = document.getElementsByClassName('hidden-options')
                for (i = 0; i < hiddenElements.length; i++) {
                    hiddenElements[i].style.visibility = 'visible'
                }
                rooms.map((room) => {
                    const option = document.createElement("option")
                    option.text = room
                    option.value = room
                    const select = document.getElementById("existing-rooms");
                    select.appendChild(option)
                })
            }
        })
}

fetchRooms()

setRoomValue = () => {
    console.log('changed')
    const value = document.getElementById('existing-rooms').value
    console.log(value)
    document.getElementById('room').value = value
}

