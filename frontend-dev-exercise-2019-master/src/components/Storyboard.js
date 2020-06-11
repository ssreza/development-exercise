import React from 'react';

function Storyboard (props) {
    let {data, story_state, goToFrame} = props;
    let mainStyle = {
        "backgroundColor":data.colors.bg,
        "color":data.colors.text,
    }
    let borderStyle ={
        "backgroundColor":data.colors.text,
    }
    let {buttons} = data;
    let buttonOne , buttonTwo;
    if(buttons.length> 1){
        buttonOne = buttons[0];
        buttonTwo = buttons[1];
    } else {
        buttonTwo = buttons[0];
    }
    let bottomBorder ={
        "backgroundColor":data.colors.text,

    }
    if(buttonTwo.text==="Start Over"){
        bottomBorder["width"]="58vw";
    }
    return (
        <div className="container story-board" style={mainStyle}>
            <div className="outer-background">
                <div className="inner-background">
                    <div className="top-border">
                        <div className="border" style={borderStyle}></div>
                    </div>
                    <div className="left-border"  style={borderStyle}></div>
                    <div className="container">
                        <div className="title">{data.title}</div>
                        <div className="body-content">
                            <div dangerouslySetInnerHTML={{ __html: data.body}}  className="body-text"></div>
                            <div className="image"><img src={data.img}/></div>
                        </div>
                    </div>
                    <div className="right-border">
                       
                        <div className="page-number">{story_state+1}</div>
                        <div style={borderStyle} className="border"></div>
                    </div>
                    <div className="bottom-border">
                        {buttonOne && (<div className="action-btn button-one" onClick={()=>goToFrame(buttonOne.linkindex) }>{ buttonOne.text}</div>)}
                        <div className="border" style={bottomBorder}></div>
                        {buttonTwo && (<div className="action-btn button-two" onClick={()=>goToFrame(buttonTwo.linkindex) }>{ buttonTwo.text}</div>)}
                    </div>
                </div>
            </div>
        </div>
      );
}

export default Storyboard;