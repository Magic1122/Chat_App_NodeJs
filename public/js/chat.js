const socket = io() // to connect to socket.io

// server (emit) --> client (receive) -- acknowledgement --> server
// client (emit) --> server (receive) -- acknowledgement --> client

// Elements
const $messageForm = document.getElementById('message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $shareLocationButton = document.getElementById('share-location')
const $messages = document.getElementById('messages')

// Templates
const messageTemplate = document.getElementById('message-template').innerHTML  // to select the templates you need the innerHTML property
const locationTemplate = document.getElementById('location-message-template').innerHTML
const sidebarTemplate = document.getElementById('sidebar-template').innerHTML

socket.on('message', (msg) => {     // message rendering
    // console.log(msg)
    const html = Mustache.render(messageTemplate, { 
        username: msg.username, 
        createdAt: moment(msg.createdAt).format('h:mm a'),      // we use the preloaded Moment library for formatting our timestamp
        msg: msg.text })  // we use the Mustache library to render a template in the browser, second argument is an obj with the date
    $messages.insertAdjacentHTML('beforeend', html)  // we render the template in the browser
    autoscroll()
})

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })      // we parse our query string with the Qs library from the location.search, as a second argument we set up an option Obj to take away the ? marks // we immediately destructure the object to get two const variables a username and a room

const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild      // it grabs the last element as a child

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)      // getting the styles
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    console.log(newMessageMargin)                                       // we add up the heights to get the total height
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight      // this gives a total height what we are able to scroll

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight       
            // scrollTop - it gives a number which is the amount that we scrolled down from the top
    
    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('locationMessage', (msg) => {    // location link rendering
    console.log(location)
    const html = Mustache.render(locationTemplate, { 
        username: msg.username, 
        location: msg.location, 
        createdAt: moment(location.createdAt).format('h:mm a')
     })

    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {        // we are setting up a listener to the roomData event
    console.log(room)
    console.log(users)

    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })

    document.getElementById('sidebar').innerHTML = html
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')  // to desable the form once it has been submitted

    console.log(e.target.elements)
    let msg = e.target.message.value  // e.target.elements.message.value also works
    
    socket.emit('sendMessage', msg, (error) => {  // function as final event for acknowledgement

        $messageFormButton.removeAttribute('disabled')  // re enable the form
        $messageFormInput.value = ''  // clear the form input
        $messageFormInput.focus()  // set focus back to the input

        if (error) {
            return console.log(error)
        }

        console.log('Message delivered!')
    })

})

$shareLocationButton.addEventListener('click', () => {

    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser.')
    }

    $shareLocationButton.setAttribute('disabled', 'disabled')  // disable the button after the click

    navigator.geolocation.getCurrentPosition((position) => {  // browser Geolocation API
        const location = {}
        // console.log(position)
        location.longitude = position.coords.longitude
        location.latitude = position.coords.latitude

        // console.log(location)
        socket.emit('sendLocation', location, () => {
            $shareLocationButton.removeAttribute('disabled')  // reenable the button
            console.log('Location shared!')   // function as final event for acknowledgement
        })
    })
    
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})