

import React from 'react';
import '../App.css';
import {pluck_level_one, sortArray,deepCopy,isPositive} from "../util";
import moment from "moment";
import { ApiService } from '../Services';

class Home extends React.Component {
    constructor(props){
        super(props);
        this.getData = this.getData.bind(this);
        this.selectUser = this.selectUser.bind(this);
        this.addOrder = this.addOrder.bind(this);
        this.editOrder = this.editOrder.bind(this);
        this.submit = this.submit.bind(this);
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
          prompt:(<span></span>),
          loading:false,
          new_order:{
            user_id:1,
            items:[],
            new_item :{
              count:1,
              name:"Bananas",
              id:1
            },
            error:false,
            error_msg:"",
            loading:false,
            open:false
          },
          edit_order:{
            user_id:1,
            items:[],
            new_item :{
              count:1,
              name:"Bananas",
              id:1
            },
            error:false,
            error_msg:"",
            loading:false,
            open:false
          },
          editModalOpen:false,
          editing_order:1
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
    editOrder(){
      let self = this;
      let {edit_order, editing_order, order_items} =this.state;
      
      
      let data = {
        user:edit_order.user_id
        
      }
      if(edit_order.items.length<1){
        edit_order.error = true;
        edit_order.error_msg = "You need to add items";
        this.setState({edit_order:edit_order});
        return;

      }
      this.setState({loading:true, editModalOpen:false});
      let length = edit_order.items.length | 0;
      ApiService.updateOne("orders",editing_order,data).then((res)=>{
         let order_items_filterd = order_items.filter(x=>x.order === editing_order);
         order_items_filterd.map(x=> {
           let item = pluck_level_one(edit_order.items, "id", x.item);
           if(!item){
             ApiService.deleteOne("order_items", x.id).then(res=>this.getData(["orders", "order_items"]));
           }
           
         });
         edit_order.items.map((x, index)=>{
          let item = pluck_level_one(order_items_filterd, "item", x.id);
          if(!item){
            ApiService.createOne("order_items", {
              order:editing_order, item:x.id, count:x.count
            }).then(res=>{
              this.getData(["orders", "order_items"]);
            });
          }
         })
        
      }).catch(err=>{
        console.error(err);
      });
      
     
    }
    getData(components){ // get data of an array of collections from backend
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
        let {type,collection} = options;
        this.setState({loading:true, prompt:""});
        let self = this;
        if(type ==="delete" && options.id){
          let {id }= options;
            ApiService.deleteOne(collection,id).then((res)=>{
              self.getData([collection]);
            }).catch(err=>{
              console.error(err);
            });
        }
        if(type ==="create" ){ 
          let data= (options.data)?options.data:{};
          ApiService.createOne(collection,data).then((res)=>{
              self.getData([collection]);
            }).catch(err=>{
              console.error(err);
            });
        }
    }
    addOrder(){
      let {orders, new_order, users}=this.state;
      if(new_order.items.length<1){
        new_order.error=true;
        new_order.error_msg="You need to add at least one item";
      } else{
        let user = pluck_level_one(users, "id",new_order.user_id );
        let items = new_order.items;
        
        if(!user){
          user = users[0];
        }
        let self = this;
        this.setState({
          loading:true
        });
        ApiService.createOne("orders", {user:user.id}).then((res)=>{
          console.log(res);
            let order_id = res.id;
            items.map((item,index)=>{
              ApiService.createOne("order_items", {order:order_id, item:item.id, count:item.count}).then(res=>{
                let {new_order}= self.state;
                if(index==items.length-1){
                  self.getData(["orders", "order_items"]);
                  new_order.open = false;
                  self.setState({new_order:new_order});
                }
              });
            });
        });
       
      }
      this.setState({new_order:new_order});
    }
    render() {
      let {users, filtered_orders,items,order_items, selected_user,prompt, loading, new_order, edit_order,editModalOpen}= this.state;
      sortArray(users,  "name");
      let usersList =   (<div className="select">
        <select value={selected_user} onChange={(e)=>{this.selectUser(e)}}>
          {users.map((user, index)=>{
            return(<option key={index} value={user.id}>{user.name}</option>)
          })}
        </select></div>);
        sortArray(filtered_orders,  "created_at",true, -1);
      
      let newOrderUsers= users.filter(x => x.name !== "All");
      
      let createOrderForm =  (<div className="create-order-form box">
                {new_order.error && (<div className="notification is-danger">
                    <button className="delete" onClick={()=> {
                      new_order.error=false;
                      new_order.error_msg="";
                      this.setState({new_order:new_order});
                    }}></button>
                    {new_order.error_msg}
                  </div>)}
              <div className="field">
                <span className="label">User</span>
                <span className="control">
                <div className="select">
                <select value={new_order.user_id} onChange={(e)=>{
                    new_order.user_id = Number(e.target.value);
                    let user = pluck_level_one(newOrderUsers, "id",new_order.user_id);
                    if(!user){
                      user= newOrderUsers[0];
                    }
                    this.setState({new_order:new_order});
                }}>
                  {newOrderUsers.map((user, index)=>{
                    return(<option key={index} value={user.id}>{user.name}</option>)
                  })}
                </select></div>
                </span>
              </div>
              <div className="field add-items">
                <label className="label">Add Items</label>
                <div className="control">
                  <div className="new-item">
                  <button className="button" onClick={()=>{
                      let found = false;
                      new_order.items = new_order.items.map(x=>{
                        if(x.id === new_order.new_item.id){
                          x.count+=new_order.new_item.count;
                          found = true;
                        }
                        return x;
                      });
                      if(!found){                      
                        new_order.items.push(deepCopy(new_order.new_item));
                      }
                      this.setState({new_order:new_order});
                  }}> <i className="fa fa-plus"></i></button> 
                  <div className="select ">
                    <select onChange={(e)=>{
                        let id = isPositive(e.target.value);
                        let item = pluck_level_one(items, "id", id);
                        if(!item){
                          item = items[0];
                        }
                        new_order.new_item.id = item.id;
                        new_order.new_item.name = item.name;
                        this.setState({new_order:new_order});
                    }}>
                      {items.map((item,index)=>{
                        return <option key={index} value={item.id} >{item.name}</option>
                      })}
                    </select>
                  </div>
                  <input className="input new-item-count" type="number" onChange={(e)=>{ 
                    new_order.new_item.count = isPositive(e.target.value);
                    new_order.new_item.count = (new_order.new_item.count <= 0)?1:new_order.new_item.count;
                    this.setState({new_order:new_order});
                  }} value={new_order.new_item.count}/>
                  <div className="order-items">
                   {new_order.items.map((x,index)=>{return (<span key={index} className="tag is-primary">{x.name} count: {x.count} 
                   <i className="fa fa-times"  onClick={()=> {
                        new_order.items.splice(index,1);                    
                        this.setState({new_order:new_order});}}></i>
                      </span>)})} 
                  </div>
                  </div>
                  </div>
                </div>
                <div className="field is-grouped">
                  <div className="control">
                    <button className="button is-link" onClick={()=> this.addOrder()}>Submit</button>
                  </div>
                  <div className="control">
                    <button className="button" onClick={(e)=> {
                      e.preventDefault();
                      new_order.open=false;
                      this.setState({new_order:new_order});
                    }}>Cancel</button>
                  </div>
                </div>
            </div>);
    let editModal =   (<div className={"modal " +((editModalOpen)? "is-active":"")} >
    <div className="modal-background"></div>
    <div className="modal-content box">
    {edit_order.error && (<div className="notification is-danger">
        <button className="delete" onClick={()=> {
          edit_order.error=false;
          edit_order.error_msg="";
          this.setState({edit_order:edit_order});
        }}></button>
        {edit_order.error_msg}
      </div>)}
    <div className="field">
    <span className="label">User</span>
    <span className="control">
    <div className="select">
    <select value={edit_order.user_id} onChange={(e)=>{
        edit_order.user_id = Number(e.target.value);
        let user = pluck_level_one(newOrderUsers, "id",edit_order.user_id);
        if(!user){
          user= newOrderUsers[0];
        }
        this.setState({edit_order:edit_order});
    }}>
      {newOrderUsers.map((user, index)=>{
        return(<option key={index} value={user.id}>{user.name}</option>)
      })}
    </select></div>
    </span>
    </div>
    <div className="field add-items">
    <label className="label">Add Items</label>
    <div className="control">
      <div className="new-item">
      <button className="button" onClick={()=>{
          let found = false;
          edit_order.items = edit_order.items.map(x=>{
            if(x.id === edit_order.new_item.id){
              x.count+=edit_order.new_item.count;
              found = true;
            }
            return x;
          });
          if(!found){                      
            edit_order.items.push(deepCopy(edit_order.new_item));
          }
          this.setState({edit_order:edit_order});
      }}> <i className="fa fa-plus"></i></button> 
      <div className="select ">
        <select onChange={(e)=>{
            let id = isPositive(e.target.value);
            let item = pluck_level_one(items, "id", id);
            if(!item){
              item = items[0];
            }
            edit_order.new_item.id = item.id;
            edit_order.new_item.name = item.name;
            this.setState({edit_order:edit_order});
        }}>
          {items.map((item,index)=>{
            return <option key={index} value={item.id} >{item.name}</option>
          })}
        </select>
      </div>
      <input className="input new-item-count" type="number" onChange={(e)=>{ 
        edit_order.new_item.count = isPositive(e.target.value);
        edit_order.new_item.count = (edit_order.new_item.count <= 0)?1:edit_order.new_item.count;
        this.setState({edit_order:edit_order});
      }} value={edit_order.new_item.count}/>
      <div className="order-items">
      {edit_order.items.map((x,index)=>{return (<span key={index} className="tag is-primary">{x.name} count: {x.count} 
      <i className="fa fa-times"  onClick={()=> {
            edit_order.items.splice(index,1);                    
            this.setState({edit_order:edit_order});}}></i>
          </span>)})} 
      </div>
      </div>
      </div>
    </div>
    <div className="field is-grouped">
      <div className="control">
        <button className="button is-link" onClick={()=> this.editOrder()}>Update</button>
      </div>
      <div className="control">
        <button className="button" onClick={e => this.setState({editModalOpen:false}) }>Cancel</button>
      </div>
    </div>
    </div>
    </div>);
        let ordersList = filtered_orders.map((order)=>{
          let user = pluck_level_one(users, "id", order.user);
          let itemsToDisplay =[];
          let itemsInOrder=[];
          for (let index = 0; index < order_items.length; index++) {
            const x = order_items[index];
            if(x.order === order.id){
              let item = pluck_level_one(items,"id", x.item);
              if(item){
                item.count = x.count;
                itemsInOrder.push(item);
                if(itemsToDisplay.length>2){
                  itemsToDisplay.push({
                    name:"..."
                  });
                  break;
                }else if(item){
                  itemsToDisplay.push(item);
                }
              }
            }
          }
          let displayCreated = moment(order.created_at).format("h:mm a, MMM DD");
          let editColumn = (<td onClick={()=>{
            edit_order.user_id = user.id;
            edit_order.items = itemsInOrder;
            this.setState({editModalOpen:true,editing_order:order.id, edit_order:edit_order});
            }} className="delete-column">  <span style={{color:"#00d1b2", padding:"8px"}}>
                      <i className="fa fa-edit"></i>
                  </span>
            </td>);
          let deleteColumn = (<td onClick={()=>{
            let prompt=(<div className="modal is-active">
            <div className="modal-background"></div>
            <div className="modal-content">
              <div className="box">
                  <p>Are You Sure you want to delete order?</p>
                  <p>User: {user.name}</p>
                  <p>Items: {itemsToDisplay.map(x=> x.name+" ")} </p>
                  <br/>
                  <button className="button is-danger" onClick={e => {this.submit({type:"delete",collection:"orders", id:order.id });}} style={{"margin-right":"10px"}}>Delete</button>
                    <button className="button"  onClick={e => this.setState({prompt:""}) } >Cancel</button>
              </div>
            </div>
          </div>);
          this.setState({prompt:prompt});
        }} className="delete-column">  <span style={{color:"#ff3860", padding:"8px"}}>
                  <i className="fa fa-times"></i>
              </span>
        </td>);
          return(<tr key={order.id} >
            {editColumn}
            <td>{user.name}</td>
            <td>{order.id}</td>
            <td>{itemsToDisplay.map((y, index) => {
              return (<span key={index} style={{padding:"5px 5px"}}>{y.name} </span>);
              })}</td>
            <td>{displayCreated}</td>
            {deleteColumn}
            </tr>);
        });
      return (
        <div className="container">
           <div>
            <h3>Select user: {usersList}</h3>
                
            </div>
            <br/>
            <div>
              <h2 className="level-left">View, Create or Update orders</h2>
            <span className="level-right " onClick={(e)=> {
              e.preventDefault();
              new_order.open=true;
              this.setState({new_order:new_order});
            }} style={{"cursor":"pointer"}}>
              <i className="fa fa-plus"></i><span style={{"margin":"5px 5px"}}>Create an Order</span>
            </span>
            </div>
            {new_order.open && createOrderForm}
            <br/>
           
            <div className="data-table">
              {loading && (<div className="loader-class">
              <div className="loader is-loading"></div>
              </div>)}
              {!loading && (<table className="table">
                <thead>
                  <tr>
                    <td>Edit</td>
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
            {editModal}
        </div>
      );
    }
  }
export default Home;