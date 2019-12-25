export function postData(url, data) {

    return fetch(url, {
      body: JSON.stringify(data), // must match 'Content-Type' header
      cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST', // *GET, POST, PUT, DELETE, etc.
      referrer: 'no-referrer', // *client, no-referrer
    })
    .then((response)=>{
        return response.json();
    });
   
}

export function deepCopy(value){
  if (value !== 0 && !value) {
      return null;
  }
  else {
      return JSON.parse(JSON.stringify(value));
  } 
}
export function getData(url) {
    

    return fetch(url)
    .then((response)=>{
        return response.json();
    });
   
}

export function pluck_level_one(arr, key, match ){
    if(arr  && Array.isArray(arr)){
        if(!key){
            return false;
        }
        return arr.find(item => {
            if(item[key]){
                return item[key] === match;
            }
        });
    }
    else {
        return false;
    }
}
export function isEmpty(obj) {  //this should be modified within v3 to check if it's an array, and if it is, it should check if the array has zero elements and return true if it has zero elements.
if (!obj) {
    return true;
}
return Object.keys(obj).length === 0 && obj.constructor === Object;
}
