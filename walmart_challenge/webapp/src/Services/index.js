import { isEmpty,deepCopy } from "../util";
const apiPath = "http://localhost:8000";
export   function getAll(type){
    let url = `${apiPath}/api/${type}/`
    return fetch(url)
    .then((response)=>{
        return response.json();
    });
}
export   function getOne(type,id){
    let url = `${apiPath}/api/${type}/${id}`;
    return fetch(url)
    .then((response)=>{
        return response.json();
    });
}
var sessionData={};
var initialLoad = true;
export function isIntialLoad(){
    return initialLoad;
}

export function getSessionData(){
    if(isEmpty(sessionData)){
        sessionData = JSON.parse(sessionStorage.getItem("session_data"));
        if(!sessionData){
            sessionData ={};
        }
    }
    
    return sessionData;
}

export function updateSessionData(data){
    let sData=getSessionData();
    for (const key of Object.keys(data)) {
        sData[key]=data[key];
    }
    sessionStorage.setItem("session_data", JSON.stringify(sData));
    sessionData = deepCopy(sData);
    initialLoad =false;
}
class User {
    constructor(name){
        this.name=name;
        
    }
}
class Order {
    constructor(options){
        this.user_id=options.name;
        
    }
}