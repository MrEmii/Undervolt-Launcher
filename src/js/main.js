const electron = require('electron');
const { remote } = electron;
const $ = require('jquery');
const FileManager = require('./js/FileManager.js');

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
   Array.from($(".b-banner")).map((e) => {
       generateGradient(e)
   })
    if (account.data.accessToken) {
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

function tryLogin(accessToken) {
    alert("success", "Logged in", "Successfully log in! Welcome back")
    account.set('accessToken', accessToken);
    updateData(accessToken);
}

function updateData(accessToken) {
    fetch("https://api.undervolt.io/api/user", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            token: accessToken
        })
    })
        .then(response => response.json())
        .then(json => {
            switch (json.code) {
                case 200: {
                    user = json.user;
                    $('#ud-alias').text(user.alias)
                    $('#ud-pic').attr('src', user.image == "default" ? "http://undervolt.io/UVLogo.png" : user.image)
                    mount.setAttribute("data-login", "true")
                    changeView("friends")
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
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: data.get("user"),
            pass: data.get("pass")
        })
    })
        .then(response => response.json())
        .then(json => {
            switch (json.code) {
                case 200: {
                    tryLogin(json.accessToken)
                    break;
                }
                case 530: {
                    prompt({
                        title: 'UnderVolt',
                        label: 'Please enter your verification code:',
                        type: 'input'
                    }).then((user) => {
                        if (user != null && user != '') {
                            fetch("https://api.undervolt.io/api/verify", {
                                method: "POST",
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    code: user
                                })
                            })
                                .then(response => response.json())
                                .then(json => {
                                    switch (json.code) {
                                        case 200: {
                                            setTimeout(() => {
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

function generateGradient(target) {
    
    var gradients = [
        ["1CB5E0", "000851"],
        ["00C9FF", "92FE9D"],
        ["FC466B", "3F5EFB"],
        ["3F2B96", "A8C0FF"],
        ["FDBB2D", "22C1C3"],
        ["FDBB2D", "3A1C71"],
        ["4b6cb7", "182848"],
        ["9ebd13", "008552"],
        ["0700b8", "00ff88"],
        ["d53369", "daae51"],
        ["00d2ff", "3a47d5"],
        ["f8ff00", "3ad59f"],
        ["fcff9e", "c67700"],
        ["e3ffe7", "d9e7ff"]
    ]

    var grad = gradients[Math.round(Math.random() * (13 - 0) + 0)]
    target.style.backgroundImage = "linear-gradient(to right top, #"+ grad[0] +" , #"+ grad[1] +")"
}


const inputField = document.querySelector('.chosen-value');
const dropdown = document.querySelector('.value-list');
const dropdownArray = [... document.querySelectorAll('.value-list li')];
console.log(typeof dropdownArray)

inputField.focus(); // Demo purposes only
let valueArray = [];
dropdownArray.forEach(item => {
  valueArray.push(item.textContent);
});

const closeDropdown = () => {
  dropdown.classList.remove('open');
}

inputField.addEventListener('input', () => {
  dropdown.classList.add('open');
  let inputValue = inputField.value.toLowerCase();
  let valueSubstring;
  if (inputValue.length > 0) {
    for (let j = 0; j < valueArray.length; j++) {
      if (!(inputValue.substring(0, inputValue.length) === valueArray[j].substring(0, inputValue.length).toLowerCase())) {
        dropdownArray[j].classList.add('closed');
      } else {
        dropdownArray[j].classList.remove('closed');
      }
    }
  } else {
    for (let i = 0; i < dropdownArray.length; i++) {
      dropdownArray[i].classList.remove('closed');
    }
  }
});

dropdownArray.forEach(item => {
  item.addEventListener('click', (evt) => {
    inputField.value = item.textContent;
    dropdownArray.forEach(dropdown => {
      dropdown.classList.add('closed');
    });
  });
})

inputField.addEventListener('focus', () => {
   inputField.placeholder = 'Type to filter';
   dropdown.classList.add('open');
   dropdownArray.forEach(dropdown => {
     dropdown.classList.remove('closed');
   });
});

inputField.addEventListener('blur', () => {
   inputField.placeholder = 'Select version';
  dropdown.classList.remove('open');
});

document.addEventListener('click', (evt) => {
  const isDropdown = dropdown.contains(evt.target);
  const isInput = inputField.contains(evt.target);
  if (!isDropdown && !isInput) {
    dropdown.classList.remove('open');
  }
});