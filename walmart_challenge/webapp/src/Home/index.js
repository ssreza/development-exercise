

import React from 'react';
import '../App.css';
import {pluck_level_one} from "../util";
import { getAll, getSessionData, updateSessionData } from '../Services';
class Home extends React.Component {
    constructor(props){
        super(props);
        this.getData = this.getData.bind(this);
        let sessionData = getSessionData();
        
        this.state={
          users:(sessionData && sessionData.users)? sessionData.users : [],
          selected_user:1
        }
    }
    componentWillMount(){
      this.getData(["users"]);
    }
    getData(components){
      let self =this;
      
      getAll("users").then((data)=>{
        self.setState({users:data});
        updateSessionData({users:data});     
       }).catch((err) => {
        console.error(err);
      })
    }
    render() {
      let {users, selected_user}= this.state;
      let usersList =   (<div className="select">
        <select value={selected_user}
        onChange={(e)=>{
          let userid = Number(e.target.value);
          let selected_user = pluck_level_one(users, "ud", userid);
          this.setState({selected_user:selected_user});
        }}
        >
          {users.map((user)=>{
            return(<option key={user.id} value={user.id}>{user.name}</option>)
          })}
        </select></div>)
      return (
        <div className="container">
           <div>
            <h3>Users List</h3>
                {usersList}
            </div>
            <br/>
            <h2 className="">View, Create or Update orders</h2>
           
        </div>
      );
    }
  }
export default Home;