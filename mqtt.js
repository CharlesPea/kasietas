
//CODIGO PARA LA FECHA
const currentDate = new Date().toDateString();

function startConnect(){

  clientID = "clientID - "+parseInt(Math.random() * 100);

  host = "test.mosquitto.org";
  port = 8080;

  document.getElementById("consola").innerHTML += currentDate + " " + "<span> Conectando a " + host + "en el puerto " +port+"</span><br>";
  document.getElementById("consola").innerHTML += currentDate + " " +"<span> El id de cliente es " + clientID +" </span><br>";

  client = new Paho.MQTT.Client(host,Number(port),clientID);

  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;

  client.connect({
      onSuccess: onConnect
  });


}


function onConnect(){
  topic =  document.getElementById("topicIPT").value;

  document.getElementById("consola").innerHTML += currentDate + " " + "<span> Suscribiendo a topic "+topic + "</span><br>";

  client.subscribe(topic);
}



function onConnectionLost(responseObject){
  document.getElementById("consola").innerHTML += currentDate + " " + "<span> ERROR: Se ha perdido la conexión.</span><br>";
  if(responseObject !=0){
      document.getElementById("consola").innerHTML += currentDate + " " + "<span> ERROR:"+ responseObject.errorMessage +"</span><br>";
  }
}

function onMessageArrived(message){
  console.log("OnMessageArrived: "+message.payloadString);
  document.getElementById("consola").innerHTML += currentDate + " " + "<span> Topic:"+message.destinationName+"| Mensaje : "+message.payloadString + "</span><br>";
  saveMessageToDatabase(message.payloadString);
}

function startDisconnect(){
  client.disconnect();
  document.getElementById("consola").innerHTML += currentDate + " " + "<span> Desconectado por el usuario </span><br>";




}

function publishMessage(){
msg = document.getElementById("messageIPT").value;
topic = document.getElementById("topicIPT").value;

Message = new Paho.MQTT.Message(msg);
Message.destinationName = topic

client.send(Message);
document.getElementById("consola").innerHTML += currentDate + " " + "<span> Mensaje enviado por topic "+topic+"</span><br>";


}


function publishMessageON(){
  msg = 'ON'
  topic = document.getElementById("topicIPT").value;
  Message = new Paho.MQTT.Message(msg);
  Message.destinationName = topic
  client.send(Message);
  document.getElementById("consola").innerHTML += currentDate + " " + "<span> Mensaje enviado por topic "+topic+"</span><br>";
  
  setTimeout(() => {
    document.getElementById("consola").innerHTML = null
    clientID = "clientID - "+parseInt(Math.random() * 100);

    host = "test.mosquitto.org";
    port = 8080;
  
    document.getElementById("consola").innerHTML += currentDate + " " + "<span> Conectando a " + host + "en el puerto " +port+"</span><br>";
    document.getElementById("consola").innerHTML += currentDate + " " +"<span> El id de cliente es " + clientID +" </span><br>";
  
    client = new Paho.MQTT.Client(host,Number(port),clientID);
  

    client.onMessageArrived = onMessageArrived;
  
    client.connect({
        onSuccess: onConnect
    });
  }, 500);
  
  }

function cleanConsole() {
  document.getElementById("consola").innerHTML = null
}


function saveMessageToDatabase(message) {
  const parsedMessage = JSON.parse(message);

  fetch('http://localhost:3000/saveMessage', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsedMessage),
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Failed to save message');
      }
      console.log('Message saved successfully');
  })
  .catch(error => console.error('Error:', error));
}


// Function to show saved messages
function showSavedMessages() {
  fetch('http://localhost:3000/getMessages')
      .then(response => response.json())
      .then(data => {
          const tableBody = document.querySelector("#messageTable tbody");
          tableBody.innerHTML = "";

          data.forEach(message => {
              const row = document.createElement("tr");
              row.innerHTML = `
                  <td>${message.rfid}</td>
                  <td>${message.hora}</td>
                  <td>${message.fecha}</td>
                  <td>${message.peso}</td>
                  <td><button onclick="deleteMessages(this)">Eliminar</button></td>
              `;
              tableBody.appendChild(row);
          });

          document.getElementById("savedMessages").style.display = "block";
      })
      .catch(error => console.error('Error fetching messages:', error));
}


function closeSavedMessages() {
  document.getElementById("savedMessages").style.display = "none";
}

document.getElementById('manualEntryForm').addEventListener('submit', async function(event) {
  event.preventDefault();

  const weight = parseFloat(document.getElementById('weight').value);
  const time = document.getElementById('time').value;
  const date = document.getElementById('date').value;

  const data = { weight, time, date };

  try {
      const response = await fetch('/save-entry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
      });

      if (response.ok) {
          alert('Entrada guardada exitosamente');
          document.getElementById('manualEntryForm').reset();
      } else {
          alert('Error al guardar la entrada');
      }
  } catch (error) {
      console.error('Error al guardar entrada:', error);
      alert('Error al guardar la entrada');
  }
});

async function deleteEntry(button) {
  const id = button.getAttribute('data-id');

  try {
      const response = await fetch(`/delete-entry/${id}`, { method: 'DELETE' });

      if (response.ok) {
          alert('Registro eliminado exitosamente');
          button.closest('tr').remove();
      } else {
          alert('Error al eliminar el registro');
      }
  } catch (error) {
      console.error('Error al eliminar registro:', error);
      alert('Error al eliminar el registro');
  }
}




function deleteMessages(rfid) {


  

}
