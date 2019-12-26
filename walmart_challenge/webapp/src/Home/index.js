

import React from 'react';
import '../App.css';
import {pluck_level_one} from "../util";
import moment from "moment";
import { ApiService, getSessionData } from '../Services';
class Home extends React.Component {
    constructor(props){
        super(props);
        this.getData = this.getData.bind(this);
        let sessionData = getSessionData();
        
        this.state={
          loaded_data_types:[],
          users:[],
          orders: [],
          items:[],
          order_items:[],
          selected_user:1,
          selected_order:null,
          selected_item:null,
        }
    }
    componentWillMount(){
      this.getData(["users", "orders", "items", "order_items"]);
      window.dataAvail= ()=>{
        let {users, orders, items, order_items}= this.state;
        return{
          users:users,
          orders:orders,
          items:items,
          order_items:order_items
        }
      }
      window.updateTime=()=>{
        let now  = moment().format('YYYY-MM-DD HH:mm:ss');
        let {orders} = this.state;
        orders = orders.map(order=> {
          order.created_at = now;
          return order;
        });
        ApiService.updateAll("orders", orders);
      }
    }
    getData(components){
      let self =this;
      components.map((type)=>{
        ApiService.getAll(type).then((data)=>{
          let payload = {};
          payload[type]=data;
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
    render() {
      let {users, orders,items,order_items, selected_user}= this.state;
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
        </select></div>);
      let ordersList = orders.map((order)=>{
        return(<tr key={order.id}>
          <td>{order.id}</td>
          <td>{order.name}</td>
          </tr>);
      })
      return (
        <div className="container">
           <div>
            <h3>Select user: {usersList}</h3>
                
            </div>
            <br/>
            <h2 className="">View, Create or Update orders</h2>
            <br/>
            <div className="">
              <table className="table">
                <thead>
                  <tr>
                    <td>Order Id</td>
                    <td>Item Name</td>
                  </tr>
                </thead>
                <tbody>
                {ordersList}
                </tbody>
              </table>
            </div>
        </div>
      );
    }
  }
export default Home;