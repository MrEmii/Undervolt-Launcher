const electron = require('electron');
const { remote } = electron;
const $ = require('jquery');
const FileManager = require('./js/FileManager.js');

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
        email: "",
        username: "",
        accesstoken: "",
        joined: "",
        photo: ""
    }
});

document.addEventListener("DOMContentLoaded", (e) => {
    if (account.data.email) {
        console.log("ACcount");

    } else {
        currentPage.classList.add("visible")
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

document.getElementById("signinform").addEventListener("submit", (e) => {
    document.getElementById("s-email").onerror = (e) => {
        console.log("hola");
    }
    alert("success", "Logged in", "Successfully log in! Welcome back")
    e.preventDefault();
    changeView("home")
    mount.setAttribute("data-login", "true")
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