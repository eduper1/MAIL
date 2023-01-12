"use strict";

document.addEventListener('DOMContentLoaded', function () {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', function () {
    return load_mailbox('inbox');
  });
  document.querySelector('#sent').addEventListener('click', function () {
    return load_mailbox('sent');
  });
  document.querySelector('#archived').addEventListener('click', function () {
    return load_mailbox('archive');
  });
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_mail); // By default, load the inbox

  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block'; // Clear out composition fields

  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
} // function to display an email's body


function displayMail(email_id) {
  fetch("/emails/".concat(email_id)).then(function (response) {
    return response.json();
  }).then(function (email) {
    console.log(email); // Hide all other views.

    document.querySelector('#email-view').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none'; // display each email
    // const display = document.createElement('p');

    document.querySelector('#email-view').innerHTML = "\n    <p style='display:block;'><b><span>From: </span></b> ".concat(email.sender, "</p>\n    <p style='display:block;'><b><span>To: </span></b> ").concat(email.recipients, "</p>\n    <p style='display:block;'><b><span>Subject: </span></b> ").concat(email.subject, "</p>\n    <p style='display:block;'><b><span>Body: </span></b> ").concat(email.body, "</p>\n    <p style='display:block;'><b><span>Timestamp</span></b> ").concat(email.timestamp, "</p>\n    <div>\n      <button id='archive'>").concat(email.archived ? "Unarchive" : "Archive", "</button>\n      <button id='reply'>Reply</button>\n    </div>\n    "); // reply function

    document.querySelector('#reply').addEventListener('click', function () {
      compose_email();
      document.querySelector('#compose-recipients').value = email.sender;

      if (email.subject.search('Re:')) {
        document.querySelector('#compose-subject').value = email.subject;
      } else {
        document.querySelector('#compose-subject').value = "Re: $(email.subject)";
      }

      document.querySelector('#compose-body').value = "On ".concat(email.timestamp, " ").concat(email.sender, " wrote: ").concat(email.body);
    }); // add event listener

    document.querySelector('#archive').addEventListener('click', function () {
      console.log('btn clicked');

      if (!email.archived) {
        fetch("/emails/".concat(email.id), {
          method: 'PUT',
          body: JSON.stringify({
            archived: true
          })
        }).then(function () {
          return load_mailbox('inbox');
        });
      } else {
        fetch("/emails/".concat(email.id), {
          method: 'PUT',
          body: JSON.stringify({
            archived: false
          })
        }).then(function () {
          return load_mailbox('inbox');
        });
      }
    });
  });
} // function to display all emails in a mailbox


function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none'; // Show the mailbox name

  document.querySelector('#emails-view').innerHTML = "<h3>".concat(mailbox.charAt(0).toUpperCase() + mailbox.slice(1), "</h3>");
  fetch("/emails/".concat(mailbox)).then(function (response) {
    return response.json();
  }).then(function (emails) {
    // print emails
    // console.log(emails);
    emails.forEach(function (email) {
      // console.log(email.sender, email.subject, email.timestamp)
      // Display message on the screen
      var elementDiv = document.createElement('div'); // elementDiv.setAttribute('id', 'msg');

      elementDiv.style.borderStyle = 'solid';
      elementDiv.style.borderColor = 'black';
      elementDiv.style.borderWidth = '1px';
      elementDiv.style.marginBottom = '4px';
      elementDiv.style.cursor = 'pointer';

      if (email.read) {
        elementDiv.style.backgroundColor = "lightGrey";
      }

      elementDiv.innerHTML = "Sender: ".concat(email.sender, "; subject: ").concat(email.subject, "; Timestamp: ").concat(email.timestamp);
      elementDiv.addEventListener('click', function () {
        console.log('This element is clicked');

        if (!email.read) {
          fetch("/emails/".concat(email.id), {
            method: 'PUT',
            body: JSON.stringify({
              read: true
            })
          });
        }

        displayMail(email.id);
      });
      document.querySelector('#emails-view').append(elementDiv);
    });
  });
  return false;
} // function to send emails


function send_mail(event) {
  event.preventDefault();
  console.log("hello");
  var receiver = document.querySelector('#compose-recipients').value;
  var title = document.querySelector('#compose-subject').value;
  var body = document.querySelector('#compose-body').value;
  console.log(receiver, title, body); // Send data to the API url

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: receiver,
      subject: title,
      body: body
    })
  }).then(function (response) {
    return response.json();
  }).then(function (result) {
    load_mailbox('sent');
    console.log(result);
  });
  return false;
}