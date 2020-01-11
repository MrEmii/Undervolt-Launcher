const electron = require('electron');
const { remote } = electron;
const $ = require('jquery');
const FileManager = require('./js/FileManager.js');
const userPrompt = require('electron-osx-prompt');

var prompt = require('electron-prompt');

const navbar = document.getElementById("navbar");
const mount = $(".mount")[0]
var currentPage = document.getElementById(mount.getAttribute("data-current"))
const notification = {
    body: document.getElementById("notification"),
    title: document.getElementById("notification").children[1].children[0],
    description: document.getElementById("notification").children[1].children[1]
}

const account = new FileManager({
    configName: 'account',
    defaults: {
        accessToken: "",
    }
});

var user = {};

document.addEventListener("DOMContentLoaded", (e) => {
    if(account.data.accessToken) {
        updateData(account.data.accessToken);
    } else {
        currentPage.classList.add("visible")
        setTimeout(() => {
            document.getElementById("loading").style.display = "none";
        }, 200)
    }
});

Array.from(navbar.children).forEach(children => {
    children.addEventListener("click", (e) => {
        Array.from(navbar.children).forEach(children1 => { children1.classList.remove("active") })
        children.classList.add("active");
        changeView(children.getAttribute("data-src"));
    })
})

document.getElementById("settings-ui").addEventListener("click", (e) => {
    var target = document.getElementById("settings-ui");
    Array.from(navbar.children).forEach(children1 => { children1.classList.remove("active") })
    changeView(target.getAttribute("data-src"))

})

function changeView(view) {
    currentPage.classList.remove("visible")
    mount.setAttribute("data-current", view)
    currentPage = document.getElementById(mount.getAttribute("data-current"))
    currentPage.classList.add("visible")

}

document.getElementById('close').addEventListener('click', () => {
    var win = remote.getCurrentWindow();
    win.close();

})

document.getElementById('minimize').addEventListener('click', () => {
    var win = remote.getCurrentWindow();
    win.minimize();
})

function tryLogin(accessToken){
    alert("success", "Logged in", "Successfully log in! Welcome back")
    account.set('accessToken', accessToken);
    updateData(accessToken);
}

function updateData(accessToken){
    fetch("https://api.undervolt.io/api/user", {
        method: "POST",
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: accessToken
        })
    })
    .then(response => response.json())
    .then(json => {
        switch(json.code){
            case 200: {
                user = json.user;
                $('#ud-alias').text(user.alias)
                $('#ud-pic').attr('src', user.image == "default" ? "http://undervolt.io/UVLogo.png" : user.image)
                mount.setAttribute("data-login", "true")
                changeView("home")
                document.getElementById("loading").style.display = "none";
                break
            }
            default: {
                mount.setAttribute("data-login", "false")
                account.set('accessToken', '');
                changeView("signin")
                document.getElementById("loading").style.display = "none";
            }
        }
    });
}

document.getElementById("signinform").addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(e.target)
    fetch("https://api.undervolt.io/api/login", {
        method: "POST",
        headers:{
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: data.get("user"),
            pass: data.get("pass")
        })
    })
    .then(response => response.json())
    .then(json => {
        switch(json.code){
            case 200:{
                tryLogin(json.accessToken)
                break;
            }
            case 530: {
                prompt({
                    title: 'UnderVolt',
                    label: 'Please enter your verification code:',
                    type: 'input'
                }).then((user)=>{
                    if(user != null && user != ''){
                        fetch("https://api.undervolt.io/api/verify", {
                            method: "POST",
                            headers:{
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                code: user
                            })
                        })
                        .then(response => response.json())
                        .then(json => {
                            switch(json.code){
                                case 200: {
                                    setTimeout(()=>{
                                        tryLogin(json.accessToken)
                                    }, 500)
                                    break;
                                }
                                case 510: {
                                    alert("error", "Logged in", "Invalid Code");
                                    break;
                                }
                                default: {
                                    alert("error", "Logged in", "Invalid Code");
                                }
                            }
                        })
                    }
                })
                break;
            }
            default: {
                alert("error", "Logged in", json.msg);
                break;
            }
        }
    }).catch(c => {
        console.error(c)
        account.set('accessToken', '');
        alert("warn", "Logged in", "The servers are on maintenance");
    })
    e.preventDefault();
})



slide(document.getElementById("category"))

function slide(items) {

    let isDown = false;
    let startX;
    let scrollLeft;


    items.addEventListener("mousedown", (e) => {
        isDown = true;
        startX = e.pageX - items.offsetLeft;
        scrollLeft = items.scrollLeft;
    });
    items.addEventListener("mouseleave", () => {
        isDown = false;
        items.classList.remove("shifting")
    });
    items.addEventListener("mouseup", () => {
        isDown = false;
        items.classList.remove("shifting")
    });
    items.addEventListener("mousemove", (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - items.offsetLeft;
        const walk = x - startX;
        items.scrollLeft = scrollLeft - walk;
        items.classList.add("shifting")
    });

}

document.getElementById("close-notification").addEventListener("click", (e) => {
    notification.body.parentElement.classList.remove("active")
    notification.body.parentElement.classList.add("close")
})

function alert(type, title, description, code) {
    code = code ? code : ""
    notification.body.parentElement.classList.remove("close")
    notification.body.parentElement.classList.add("active")
    notification.body.setAttribute("data-type", type)
    notification.title.innerHTML = title
    notification.description.innerHTML = `${description} <code>${code}</code>`

    setTimeout(() => {
        if (notification.body.parentElement.classList.contains("active")) {
            notification.body.parentElement.classList.remove("active")
            notification.body.parentElement.classList.add("close")
        }
    }, 60000);
}