
document.querySelector('#rangeNumber').textContent= `# ${document.querySelector('.number').value}`

document.querySelector('.number').addEventListener('input', (e)=>{
  document.querySelector('#rangeNumber').textContent= `# ${e.target.value}`
})

document.querySelector('.bet').addEventListener('click', (e)=>{
  let wager = parseInt(document.querySelector('.betInput').value);
  var userId = document.querySelector('.betInput').id;
  let userEmail = e.target.id;
  let balance = parseInt(document.querySelector('.amount').textContent);
  let userChoice = parseInt(document.querySelector('.number').value);
  console.log(wager, userId, userEmail, balance, userChoice);


  if((wager > 0 && wager<=750) && wager <= balance){
    console.log('in fetch');

    fetch('bet', {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
          'wager':wager,
          'userId':userId,
          'userEmail':userEmail,
          'balance':balance,
          'userChoice':userChoice
      })
    })
    .then(response => {
      if (response.ok) return response.json()
    })
    .then(data => {
      console.log(data)
      window.location.reload(true)
    })
  }
})
















//
