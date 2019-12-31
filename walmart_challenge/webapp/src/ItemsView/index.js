
import React from 'react';
import '../App.css';
import {pluck_level_one, sortArray,deepCopy} from "../util";
import { ApiService } from '../Services';
export default class ItemsView extends React.Component {
    constructor(props){
        super(props);
        this.getData = this.getData.bind(this);
        this.state={
          loaded_data_types:[],
          users:["all"],
          orders: [],
          items:[],
          order_items:[],
          selected_user:0,
          selected_order:null,
          selected_item:null,
        }
    }
    getData(components){
        let self =this;
        components.map((type)=>{
          ApiService.getAll(type).then((data)=>{
            let payload = {};
            payload[type]=data;
            if(type == "users"){
              payload[type].push({id:0, name:"All", created_at:""});
            }
            payload["filtered_" +type] = deepCopy(payload[type]);
            let {loaded_data_types}  = self.state;
            if(loaded_data_types.indexOf(type)<0){
              loaded_data_types.push(type);
              payload.loaded_data_types=loaded_data_types;
            }
            self.setState(payload);
           }).catch((err) => {
            console.error(err);
          });
        })
        
      }
    componentWillMount(){

    }
    render(){
        return (<div>
            <h1>Create, View, Delete , Edit Item</h1>
        </div>)
    }
}