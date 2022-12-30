document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_mail);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

// function to display all emails in a mailbox
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // print emails
    // console.log(emails);
    emails.forEach(email => {
      // console.log(email.sender, email.subject, email.timestamp)
      // Display message on the screen
      // document.querySelector('#emails-view').innerHTML = `Sender: ${email.sender}; subject: ${email.subject}; Timestamp: ${email.timestamp}`;
      const elementDiv = document.createElement('div');
      elementDiv.setAttribute('id', 'msg');
      elementDiv.style.backgroundColor = "#ffffff";
      
      const elementA = document.createElement('a');
      elementA.innerHTML = `Sender: ${email.sender}; subject: ${email.subject}; Timestamp: ${email.timestamp}`;
      elementA.setAttribute('href', '#');
      elementA.addEventListener('click', displayMail(email.id));
      // element.addEventListener('click', function() {
        // console.log('This element has been clicked!')
        // });
      elementDiv.appendChild(elementA);
      document.querySelector('#emails-view').append(elementDiv);
    });



  });
  return false;
}

// function to display an email's body
function displayMail(email_id){
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);
    // display each email
    const display = document.createElement('div');
    display.innerHTML = `id: ${email.id}, body: ${email.body}`;
    document.querySelector('#emails-view').append(display);
  });
}

// console.log(displayMail());

// function to send emails
function send_mail(event) {
  event.preventDefault();
  console.log("hello");
  const receiver = document.querySelector('#compose-recipients').value;
  const title = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  console.log(receiver, title, body);

  // Send data to the API url
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: receiver,
      subject: title,
      body: body
    })
  })
  .then(response => response.json())
  .then(result => {
    load_mailbox('sent')
    console.log(result);
  });
  return false;
}

