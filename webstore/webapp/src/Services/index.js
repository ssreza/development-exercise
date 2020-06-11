const apiPath = "http://localhost:8000";

var initialLoad = true;
export function isIntialLoad(){
    return initialLoad;
}



export class ApiService{
    //api services to get , create , update and delete from the backend
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
}