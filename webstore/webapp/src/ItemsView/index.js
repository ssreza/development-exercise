
import React from 'react';
import '../App.css';
import {pluck_level_one, sortArray,deepCopy} from "../util";
import moment from "moment";
import { ApiService } from '../Services';
export default class ItemsView extends React.Component {
    constructor(props){
        super(props);
        this.getData = this.getData.bind(this);
        this.addItem = this.addItem.bind(this);

        this.state={
          loaded_data_types:[],
          users:["all"],
          orders: [],
          items:[],
          order_items:[],
          filtered_items:[],
          selected_user:0,
          selected_order:null,
          selected_item:null,
          loading:false,
          prompt:"",
          new_item:{
            name:""
          }
        }
    }
    getData(components){
        let self =this;
        let length = components.length-1;
        components.map((type, index)=>{
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
            if(index == length){
              payload.loading = false;
            }
            self.setState(payload);
           }).catch((err) => {
            console.error(err);
          });
        })
        
      }
    componentWillMount(){
      this.getData(["items"])
    }

    addItem(){
      let {new_item}=this.state;
      let self= this;
      self.setState({loading:true});
      ApiService.createOne("items", {name:new_item.name}).then(res=>{
        self.getData(["items"]);
        let {new_item}=self.state;
        new_item.open =false;
        self.setState({new_item:new_item});
      });
    }
    render(){
      let {users, filtered_items,items,order_items, new_item,prompt, loading}= this.state;

      sortArray(filtered_items,  "name");
      let ItemsList = filtered_items.map((item)=>{
      
        let displayCreated = moment(item.created_at).format("h:mm a, MMM DD");
        return(<tr key={item.id} onClick={()=>{
              this.setState({viewItem:item});
            }}>
          <td>{item.name}</td>
          <td>{item.id}</td>
          <td>{displayCreated}</td>
          <td onClick={()=>{
              let prompt=(<div className="modal is-active">
              <div className="modal-background"></div>
              <div className="modal-content">
                <div className="box">
                    <p>Are You Sure you want to delete?</p>
                    <br/>
                    <button className="button is-danger" onClick={e => {
                        let self = this;
                       ApiService.deleteOne("items",item.id).then((res)=>{
                         self.setState({prompt:""})
                         self.getData(["items"]);
                       }).catch(err=>{
                         console.error(err);
                       });
                      }} style={{"margin-right":"10px"}}>Delete</button>
                      <button className="button"  onClick={e => this.setState({prompt:""}) } >cancel</button>
                </div>
              </div>
            </div>);
            this.setState({prompt:prompt});
          }} className="delete-column">  <span style={{color:"#ff3860", padding:"8px"}}>
                    <i className="fa fa-times"></i>
                </span>
          </td>
          </tr>);
      });
      let createItemForm=(<div className="box">
          <div className="field">
            <label className="label">Name</label>
            <div className="control">
              <input className="input" type="text" placeholder="New Item" onChange={(e)=>{
                new_item.name = e.target.value;
                this.setState({new_item:new_item});
              }}/>
            </div>
          </div>
          <div className="field is-grouped">
                  <div className="control">
                    <button className="button is-link" onClick={()=> this.addItem()}>Submit</button>
                  </div>
                  <div className="control">
                    <button className="button is-link is-light" onClick={(e)=> {
                      e.preventDefault();
                      new_item.open=false;
                      this.setState({new_item:new_item});
                    }}>Cancel</button>
                  </div>
                </div>
        </div>)
        return (<div className="container">
           <div>
              <h2 className="level-left">View, Create or Update items</h2>
            <span className="level-left " onClick={(e)=> {
              e.preventDefault();
              new_item.open=true;
              this.setState({new_item:new_item});
            }} style={{"cursor":"pointer"}}>
              <i className="fa fa-plus"></i><span style={{"margin":"5px 5px"}}>Create an Item</span>
            </span>
            </div>
            {new_item.open && createItemForm}
            <br/>
            <div className="data-table">
              {loading && (<div className="loader-class">
              <div className="loader is-loading"></div>
              </div>)}
              {!loading && (<table className="table">
                <thead>
                  <tr>
                    <td>Item Name</td>
                    <td>Item Id</td>
                    <td>Created</td>
                    <td>Delete</td>
                  </tr>
                </thead>
                <tbody>
                {ItemsList}
                </tbody>
              </table>)}
            </div>
            {prompt}
        </div>)
    }
}