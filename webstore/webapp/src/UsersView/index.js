
import React from 'react';
import '../App.css';
import {pluck_level_one, sortArray,deepCopy} from "../util";
import moment from "moment";
import { ApiService } from '../Services';
export default class UsersView extends React.Component {
    constructor(props){
        super(props);
        this.getData = this.getData.bind(this);
        this.addUser = this.addUser.bind(this);

        this.state={
          loaded_data_types:[],
          users:["all"],
          orders: [],
          items:[],
          order_items:[],
          filtered_users:[],
          selected_user:null,
          loading:false,
          prompt:"",
          new_user:{
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
      this.getData(["users"])
    }

    addUser(){
      let {new_user}=this.state;
      let self= this;
      self.setState({loading:true});
      ApiService.createOne("users", {name:new_user.name}).then(res=>{
        self.getData(["users"]);
        let {new_user}=self.state;
        new_user.open =false;
        self.setState({new_user:new_user});
      });
    }
    render(){
      let {users, filtered_users,items,order_items, new_user,prompt, loading}= this.state;

      sortArray(filtered_users,  "name");
      let ItemsList = filtered_users.map((user)=>{
      
        let displayCreated = moment(user.created_at).format("h:mm a, MMM DD");
        return(<tr key={user.id} onClick={()=>{
              this.setState({viewItem:user});
            }}>
          <td>{user.name}</td>
          <td>{user.id}</td>
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
                       ApiService.deleteOne("users",user.id).then((res)=>{
                         self.setState({prompt:""})
                         self.getData(["users"]);
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
      let createUserForm=(<div className="box">
          <div className="field">
            <label className="label">Name</label>
            <div className="control">
              <input className="input" type="text" placeholder="New Item" onChange={(e)=>{
                new_user.name = e.target.value;
                this.setState({new_user:new_user});
              }}/>
            </div>
          </div>
          <div className="field is-grouped">
                  <div className="control">
                    <button className="button is-link" onClick={()=> this.addUser()}>Submit</button>
                  </div>
                  <div className="control">
                    <button className="button is-link is-light" onClick={(e)=> {
                      e.preventDefault();
                      new_user.open=false;
                      this.setState({new_user:new_user});
                    }}>Cancel</button>
                  </div>
                </div>
        </div>)
        return (<div className="container">
           <div>
              <h2 className="level-left">Delete, Create or Update users</h2>
            <span className="level-left " onClick={(e)=> {
              e.preventDefault();
              new_user.open=true;
              this.setState({new_user:new_user});
            }} style={{"cursor":"pointer"}}>
              <i className="fa fa-plus"></i><span style={{"margin":"5px 5px"}}>Create an User</span>
            </span>
            </div>
            {new_user.open && createUserForm}
            <br/>
            <div className="data-table">
              {loading && (<div className="loader-class">
              <div className="loader is-loading"></div>
              </div>)}
              {!loading && (<table className="table">
                <thead>
                  <tr>
                    <td>User Name</td>
                    <td>User Id</td>
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