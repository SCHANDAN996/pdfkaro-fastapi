// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function () {

    // Select the button element
    const button = document.querySelector('button');

    // Add an event listener to the button for click action
    button.addEventListener('click', function () {
        alert("Button clicked! You can add more functionality here.");
    });

    // You can also add other interactions here (like API calls, form submission, etc.)
    console.log("JS is working and integrated!");
});
