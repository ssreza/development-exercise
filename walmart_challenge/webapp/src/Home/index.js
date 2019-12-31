

import React from 'react';
import '../App.css';
import {pluck_level_one, sortArray,deepCopy} from "../util";
import moment from "moment";
import { ApiService, getSessionData } from '../Services';

class Home extends React.Component {
    constructor(props){
        super(props);
        this.getData = this.getData.bind(this);
        this.selectUser = this.selectUser.bind(this);
        this.submit = this.submit.bind(this);
        let sessionData = getSessionData();        
        this.state={
          loaded_data_types:[],
          users:["all"],
          orders: [],
          items:[],
          order_items:[],
          selected_user:0,
          selected_order:null,
          selected_item:null,
          filtered_orders:[],
          viewOrder:null,
          prompt:(<span></span>),
          loading:false
        }
    }
    componentWillMount(){
      this.getData(["users", "orders", "items", "order_items"]);
      window.dataAvail= ()=>{
        let {users, orders, items, order_items, filtered_orders}= this.state;
        return{
          users:users,
          orders:orders,
          items:items,
          order_items:order_items,
          filtered_orders:filtered_orders
        }
      }
    }    
    getData(components){
      let self =this;
      this.setState({loading:true});
      let  length= components.length;
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
          if(index == (length-1)){
            payload.loading =false;
          }
          self.setState(payload);
         }).catch((err) => {
          console.error(err);
        });
      })
      
    }
    selectUser(event) {
      console.log(event.target.value)
      let {orders,users}=this.state;
      let userid = Number(event.target.value);
      let filtered_orders = deepCopy(orders);
      if(userid !==0){
        filtered_orders  = filtered_orders.filter(order=> {
          if(order.user === userid){
            return order;
          }
        });
      }
      this.setState({selected_user:userid,filtered_orders:filtered_orders});
    }
    submit(options){
        let {type,dataType} = options;
        this.setState({loading:true, prompt:""});
        let self = this;
        if(type ==="delete" && options.id){
          let {id }= options;
            ApiService.deleteOne(dataType,id).then((res)=>{
              self.getData([dataType]);
            }).catch(err=>{
              console.error(err);
            });
        }
    }
    render() {
      let {users, filtered_orders,items,order_items, selected_user,prompt, loading}= this.state;
      sortArray(users,  "name");
      let usersList =   (<div className="select">
        <select value={selected_user} onChange={(e)=>{this.selectUser(e)}}>
          {users.map((user, index)=>{
            return(<option key={index} value={user.id}>{user.name}</option>)
          })}
        </select></div>);
      let ordersList = filtered_orders.map((order)=>{
        let user = pluck_level_one(users, "id", order.user);
        let itemsToDisplay =[];
        order_items.map(x=> {
          if(x.order === order.id){
            let item = pluck_level_one(items,"id", x.item);
            itemsToDisplay.push(item);
          }
        });
        let displayCreated = moment(order.created_at).format("h:mm a, MMM DD");
        return(<tr key={order.id} onClick={()=>{
          this.setState({viewOrder:order,});
        }}>
          <td>{user.name}</td>
          <td>{order.id}</td>
          <td>{itemsToDisplay.map((y, index) => {
            return (<span key={index} style={{padding:"5px 5px"}}>{y.name} </span>);
            })}</td>
          <td>{displayCreated}</td>
          <td onClick={()=>{
              let prompt=(<div className="modal is-active">
              <div className="modal-background"></div>
              <div className="modal-content">
                <div className="box">
                    <p>Are You Sure you want to delete?</p>
                    <br/>
                    <button className="button is-danger" onClick={e => {this.submit({type:"delete",dataType:"orders", id:order.id });}} style={{"margin-right":"10px"}}>Delete</button>
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
      return (
        <div className="container">
           <div>
            <h3>Select user: {usersList}</h3>
                
            </div>
            <br/>
            <h2 className="">View, Create or Update orders</h2>
            <br/>
            <div className="">
              {loading && (<div className="loader-class">
              <div className="loader is-loading"></div>
              </div>)}
              {!loading && (<table className="table">
                <thead>
                  <tr>
                    <td>User Name</td>
                    <td>Order Id</td>
                    <td>Items</td>
                    <td>Created</td>
                    <td>Delete</td>
                  </tr>
                </thead>
                <tbody>
                {ordersList}
                </tbody>
              </table>)}
            </div>
            {prompt}
        </div>
      );
    }
  }
export default Home;