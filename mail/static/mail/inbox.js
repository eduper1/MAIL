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
    document.querySelector('#email-view').innerHTML = `
    <p style='display:block;'><b><span>From: </span></b> ${email.sender}</p>
    <p style='display:block;'><b><span>To: </span></b> ${email.recipients}</p>
    <p style='display:block;'><b><span>Subject: </span></b> ${email.subject}</p>
    <p style='display:block;'><b><span>Body: </span></b> ${email.body}</p>
    <p style='display:block;'><b><span>Timestamp</span></b> ${email.timestamp}</p>
    <div>
      <button id='archive'>${email.archived ? "Unarchive":"Archive"}</button>
      <button id='reply'>Reply</button>
    </div>
    `;
    
    // reply function
    document.querySelector('#reply').addEventListener('click', ()=>{
      compose_email();
      document.querySelector('#compose-recipients').value = email.sender;
      if (email.subject.search('Re:')){
        document.querySelector('#compose-subject').value = (email.subject);
      }else{
        document.querySelector('#compose-subject').value = `Re: $(email.subject)`;
      }
      document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
    })

    // add event listener
    document.querySelector('#archive').addEventListener('click', ()=>{
      console.log('btn clicked')
      if (!email.archived){
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
         body: JSON.stringify({
         archived: true
        })
      })
      .then(() => load_mailbox('inbox'))
    }else{
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
       body: JSON.stringify({
       archived: false
      })
    })
    .then(() => load_mailbox('inbox'))
    }

    })
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
      elementDiv.style.borderStyle = 'solid';
      elementDiv.style.borderColor = 'black';
      elementDiv.style.borderWidth = '1px';
      elementDiv.style.marginBottom = '4px';
      elementDiv.style.cursor = 'pointer';
      if(email.read){
        elementDiv.style.backgroundColor = "lightGrey"
      }
      
      elementDiv.innerHTML = `Sender: ${email.sender}; subject: ${email.subject}; Timestamp: ${email.timestamp}`;
      elementDiv.addEventListener('click', () =>{
        console.log('This element is clicked');
        if (!email.read){
          fetch(`/emails/${email.id}`, {
            method: 'PUT',
           body: JSON.stringify({
           read: true
    })
  })
    }
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

