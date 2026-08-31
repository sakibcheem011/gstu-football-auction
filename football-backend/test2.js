fetch('https://gstu-football-auction.onrender.com/jerseys').then(r => r.json()).then(data => console.log(JSON.stringify(data[0].votes))).catch(console.error);
