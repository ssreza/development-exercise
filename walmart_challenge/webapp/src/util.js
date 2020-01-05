import moment from "moment";
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


export function isPositive(num){
    num = Number(num);
    if(!num || isNaN(num)){
        return 0;
    }
    else if(num<0){
        return 0;
    }
    return num;
}

export function sortArray(inputArray, property, isDateTime, direction) {
    inputArray.sort(__ddsrt(property, isDateTime, direction))
}

function __ddsrt(property,isDateTime, direction) {
    let sortOrder = 1;
    if (direction) {
        sortOrder = direction;
    }
    // if(property[0] === "-") {
    //     sortOrder = sortOrder*-1;
    //     property = property.substr(1);
    // }
    if(isDateTime){
        return function (a,b) {
            const propa= moment(a[property]);
            const propb = moment(b[property]);

            const result = (propb.isAfter(propa)) ? -1 : (propa.isAfter(propb)) ? 1 : 0;
            return result * sortOrder;
        }
    }
    return function (a,b) {
        const result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
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
