const form = document.getElementById("form");
const viewer = document.getElementById("view")
const fullAddress = window.location.href.toString();
const path = fullAddress.split(window.location.host)[1].split("/");
path.shift()
const process = path.shift()
const URL = "http://localhost:3000";

window.onload = function () {
    grabItems();
};

form.addEventListener("submit", submitForm);

function submitForm(e) {
    e.preventDefault();
    const name = document.getElementById("apikey");
    const files = document.getElementById("files");
    const responseText = document.getElementById("upload");
    const formData = new FormData();
    formData.append("apikey", name.value);
    for (let i = 0; i < files.files.length; i++) {
        formData.append("files", files.files[i]);
    }
    fetch(URL + "/upload/" + path.join("/"), {
        method: 'POST',
        body: formData
    })
        .then((res=> res.json())).then(r => responseText.innerText = JSON.stringify(r))
        .catch((err) => console.log("Error occured", err));
}

function grabItems() {
    console.log(URL + "/files/" + path.join("/"))

    fetch(URL + "/files/" + path.join("/"), {
        method: 'GET'
    })
        .then(res => res.json())
        .then(data => {
            const items = JSON.parse(data);
            items[0].forEach(item => {
                const div = document.createElement('li');
                const label = document.createElement('p')
                div.className = 'row';

                label.innerText = "Folder: " + item.toString();

                div.appendChild(label);
                // div.innerHTML += `
                //     <input type="button" class="delete-button" value="Delete Item" onclick="removeRow(this)" />`;
                viewer.appendChild(div);
            });
            items[1].forEach(item => {
                const div = document.createElement('li');
                const label = document.createElement('p')
                div.className = 'row';

                label.innerText = "File: " + item.toString();

                div.appendChild(label);
                div.innerHTML += `
                    <input type="button" class="delete-button" value="Delete Item" onclick="removeRow(this)" />`;
                viewer.appendChild(div);
            });
        })
        .catch((err) => console.log("Error occured", err))
}

function removeRow(input) {
    const item = input.parentNode.children[0].innerText.substring(6);
    console.log(URL + "/files/" + path.join("/") + "/" + item);
    if (!confirm("Are you sure you want to delete '" + item + "'?")) {
        return;
    }
    const name = document.getElementById("apikey");
    const formData = new FormData();
    formData.append("apikey", name.value);
    let fetchURL = URL + "/files/" + path.join("/");
    if (path.length > 0){
        fetchURL += "/";
    }
    fetch((fetchURL + item), {
        method: "DELETE",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify([{}, {
            "apikey": name.value
        }])
    }).then(r => r.json())
        .then((response) => {
        console.log(response);
        input.parentNode.children[0].innerText = JSON.stringify(response);
    });
}
