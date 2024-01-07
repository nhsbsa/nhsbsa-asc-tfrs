function getLocalData() {
    //Send a request to the server
    fetch('/get-data', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({filters}),
    })
    .then(response => response.json())
    .then(data => {
        console.log(JSON.stringify(data))
      return(data)
    })
    .catch(error => {
        console.error('Error getting data:', error);
    });
}


module.exports = { getLocalData }