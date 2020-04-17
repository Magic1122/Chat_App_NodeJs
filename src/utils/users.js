const users = []

// addUser (start track a user), removeUser (stop track a user), getUser (fetch an existing users data), getUsersInRoom (get the users in a specific room)

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    
    // Validate the data, check if both are provided
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)     // findes the user by its id and gives back the index of it

    if (index !== -1) {
        return users.splice(index, 1)[0]        // it gives back the removed user
    }
}

const getUser = (id) => {

    return users.find(user => user.id === id)

 /*    const index = users.findIndex(user => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }

    return undefined */
}

const getUsersInRoom = (room) => {

    return users.filter(user => user.room === room)     // we don't use trim and toLowerCase here because this data won't come from the user

    // Clean the data

    /* room = room.trim().toLowerCase()

    const usersInRoom = users.filter(user => user.room === room)

    if (usersInRoom) {
        return usersInRoom
    }

    return [] */
}


module.exports = {
    addUser, 
    removeUser, 
    getUser, 
    getUsersInRoom
}
