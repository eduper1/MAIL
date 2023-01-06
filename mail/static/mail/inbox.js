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
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}


// function to display an email's body
function displayMail(email_id){
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);
    // Hide all other views.
    document.querySelector('#email-view').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    
    // display each email
    // const display = document.createElement('p');
    document.querySelector('#email-view').innerHTML = `id: ${email.id}, body: ${email.body}`;
    // document.querySelector('#email-view').append(display);
    if (!email.read){
      fetch(`/emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
        read: true
    })
  })
    }
  });

}

// function to display all emails in a mailbox
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

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
      const elementDiv = document.createElement('div');
      // elementDiv.setAttribute('id', 'msg');
      elementDiv.style.backgroundColor = "#ffffff";
      
      elementDiv.innerHTML = `Sender: ${email.sender}; subject: ${email.subject}; Timestamp: ${email.timestamp}`;
      elementDiv.addEventListener('click', () =>{
        console.log('This element is clicked');
        displayMail(email.id);
      });
      document.querySelector('#emails-view').append(elementDiv);
    });
  });
  return false;
}


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

