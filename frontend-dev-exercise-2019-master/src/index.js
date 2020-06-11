import React from 'react';
import ReactDOM from 'react-dom';
import './styles.scss';
import Loading from "./components/Loading";
import Storyboard from "./components/Storyboard";
import { createGlobalStyle } from 'styled-components';
 
import MonoRegular from './fonts/woff/mono-regular.woff';
 
const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Mono Regular';
    font-style: normal;
    font-weight: normal;
    src:
      url('${MonoRegular}') format('woff'),
  }
 
  html, body {
    font-family: 'Mono Regular', sans-serif;
  }
`;
class App extends React.Component{
    constructor(props){
        super(props);
        this.getData = this.getData.bind(this);
        this.goToFrame = this.goToFrame.bind(this);
        this.state={
            loading:true,
            story_state:-1,
            frames:[]
        }
    }

    componentDidMount(){
       setTimeout(this.getData, 500) 
    }
    getData(){
        fetch('/data/story.json').then(response => {
            return response.json();
          }).then(data => {
            // Work with JSON data here
            console.log(data);
            this.setState({
                loading:false,
                story_state:0,
                frames:data.frames
            })
          }).catch(err => {
            console.error(err);
          });
    }
    goToFrame(story_state){
      console.log(story_state);
      this.setState({loading:true});
      let self = this;
      setTimeout(()=>{
        self.setState({story_state:story_state, loading:false})
      }, 500);
    }
    render(){
        let{loading, story_state, frames} = this.state;
        let story_data = frames[story_state];
        return (<div className="main-component">
            <GlobalStyle/>
            {loading && <Loading/>}
            {!loading && <Storyboard goToFrame={this.goToFrame} data={story_data} story_state={story_state}/>}
        </div>)
    }
}
ReactDOM.render(<App />, document.getElementById('root'));