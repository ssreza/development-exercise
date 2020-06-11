import moment from "moment";


export function deepCopy(value){ // deepcopy of obj doesn't work if there is functions
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

// sort an array using and inner key also works with dates
export function sortArray(inputArray, property, isDateTime, direction) {
    inputArray.sort(__ddsrt(property, isDateTime, direction))
}

function __ddsrt(property,isDateTime, direction) {
    let sortOrder = 1;
    if (direction) {
        sortOrder = direction;
    }
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


export function pluck_level_one(arr, key, match ){ // find in in array with inner key
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
export function isEmpty(obj) {  //check if obj is empty
if (!obj) {
    return true;
}
return Object.keys(obj).length === 0 && obj.constructor === Object;
}
