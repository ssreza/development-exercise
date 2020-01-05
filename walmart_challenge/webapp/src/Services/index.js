import { isEmpty,deepCopy } from "../util";
const apiPath = "http://localhost:8000";

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

export class ApiService{
    static getAll(collection){
        let url = `${apiPath}/api/${collection}/`
        return fetch(url)
        .then((response)=>{
            return response.json();
        });
    }
    static getOne(collection,id){
        let url = `${apiPath}/api/${collection}/${id}`;
        return fetch(url)
        .then((response)=>{
            return response.json();
        });
    }
    static deleteOne(collection, id){
        let url = `${apiPath}/api/${collection}/${id}/`
        return fetch(url,{
            method: 'DELETE',
        }).then((response)=>{
            return response
        });
    }
    static updateOne(collection, id,data){
        let url = `${apiPath}/api/${collection}/${id}/`
        return fetch(url,{
            headers: { "Content-Type": "application/json; charset=utf-8" },
            method: 'PUT',
            body: JSON.stringify(data)
        }).then((response)=>{
            return response.json();
        });
    }
    static createOne(collection,data){
        let url = `${apiPath}/api/${collection}/`
        return fetch(url,{
            headers: { "Content-Type": "application/json; charset=utf-8" },
            method: 'POST',
            body: JSON.stringify(data)
        }).then((response)=>{
            return response.json();
        });
    }
    static updateAll(collection,data){
        let url = `${apiPath}/api/${collection}/multi_update/`
        return fetch(url,{
            headers: { "Content-Type": "application/json; charset=utf-8" },
            method: 'PATCH',
            body: JSON.stringify(data)
        }).then((response)=>{
            return response.json();
        });
    }
}