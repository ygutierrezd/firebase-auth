const signupForm = document.querySelector('#signup-form');

signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const signupEmail = document.querySelector('#signup-email').value
    const signupPassword = document.querySelector('#signup-password').value
    const firstName = document.querySelector('#first-name').value
    const lastName = document.querySelector('#last-name').value
    const docId = document.querySelector('#doc-id').value
    auth.
    createUserWithEmailAndPassword(signupEmail, signupPassword)
        .then(async(useCredential) => {

            let datos = {
                ident: docId,
                nombres: firstName,
                apellidos: lastName,
                email: signupEmail,
                fechaRegistro: new Date().toUTCString()
            }

            let rta = insertDataUser(datos)

            signupForm.reset();
            $('#signup-modal').modal('hide')

            console.log('signUp')
        })
})

const signinForm = document.querySelector('#login-form');

signinForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const Email = document.querySelector('#login-email').value;
    const Password = document.querySelector('#login-password').value;
    console.log(Email, Password)

    auth.
    signInWithEmailAndPassword(Email, Password)
        .then(async(useCredential) => {

            signinForm.reset();

            $('#login-modal').modal('hide')

            console.log('signin')
        })
})

const logout = document.querySelector('#logout')

logout.addEventListener('click', (e) => {
    e.preventDefault()
    auth.signOut().then(_ => {
        console.log('signout')
    })
})


auth.onAuthStateChanged(async(user) => {

    const data = document.querySelector('#data-user')
    changeMenu(user)
    if (user) {
        console.log(user.email)
        data.innerHTML = `Searching data...`
        setTimeout(async function() {
            let userData = await searchDataUsers(user.email)
            data.innerHTML = `Welcome ${userData.nombres} ${userData.apellidos}.`
        }, 3000);

    } else {
        data.innerHTML = 'login to see your information'
    }

})

//Google login

const googleLogin = document.querySelector('#googlelogin')

googleLogin.addEventListener('click', e => {
    e.preventDefault()
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)
        .then(async(result) => {
            let data = result.additionalUserInfo.profile
            let userData = await searchDataUsers(data.email)

            if (!userData) {
                let datos = {
                    ident: data.id,
                    nombres: data.given_name,
                    apellidos: data.family_name,
                    email: data.email,
                    fechaRegistro: new Date().toUTCString()
                }
                await insertDataUser(datos)
            }

            $('#login-modal').modal('hide')
            console.log(result.additionalUserInfo.profile)
        })
        .catch(error => {
            console.log(error)
        })
})

//Methods 

const searchDataUsers = async(email) => {
    let userData = await db.ref('1/users').orderByChild('email').equalTo(email).once('value', snaptshot => {
        return snaptshot
    }).then(ds => {
        let datos;
        ds.forEach(value => {
            datos = value.val()
        })
        return datos
    })

    return userData
}

const insertDataUser = async(user) => {
    let rta = await db.ref(`1/users/${user.ident}`).set(user).then(_ => {
        return true;
    })
    return rta
}

const loggedOutLinks = document.querySelectorAll('.logged-out')
const loggedInLinks = document.querySelectorAll('.logged-in')

const changeMenu = (user) => {

    if (user) {
        loggedInLinks.forEach(link => link.style.display = 'block')
        loggedOutLinks.forEach(link => link.style.display = 'none')
    } else {
        loggedInLinks.forEach(link => link.style.display = 'none')
        loggedOutLinks.forEach(link => link.style.display = 'block')
    }
}