const url = 'https://api.web3forms.com/submit';
let form, result;

function setContact() {
    form = document.getElementById('form');
    result = document.getElementById('result');

    form.addEventListener('submit',  (e) => {
        submitForm(e);
    });
}

async function submitForm(e) {
    e.preventDefault();

    result.innerHTML = "Please Wait...";

    const formData = getFormData();
    const response = await sendFormData(formData);

    result.innerHTML = response;
}

function getFormData() {
    const formData = new FormData(form);
    let object = Object.fromEntries(formData);

    object.name = `${object?.first_name} ${object?.last_name}`;
    object.from_name = object.name;

    delete object.first_name;
    delete object.last_name;

    return JSON.stringify(object);
}
async function sendFormData(formData) {
    try {
        const response = await fetch(url, getOptions(formData));

        if(response.status == 200) {
            return "Message Sent!";
        }
        else {
            console.error("Not 200:");
            console.log(response);
        }
    }
    catch(error) {
        console.error(error);
    }

    return "Failed to Send Message. Please Try Again Later.";
}

function getOptions(json) {
    return {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: json
    };
}

document.addEventListener("DOMContentLoaded", setContact);
